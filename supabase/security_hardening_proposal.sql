-- PROPOSAL ONLY: review and approve before running in Supabase SQL Editor.
-- This file is intentionally outside supabase/migrations so it is not applied automatically.
-- It does not create accounts, reset passwords, or modify admin role membership.

BEGIN;

-- Public review submissions must not be able to self-approve or claim a purchase.
-- The existing "Admins manage reviews" policy still permits trusted admin moderation
-- through is_admin(); this stricter policy applies to anon/authenticated public inserts.
ALTER TABLE public.reviews
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN is_verified_purchase SET DEFAULT FALSE;

DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
DROP POLICY IF EXISTS "Public submit pending unverified reviews" ON public.reviews;
CREATE POLICY "Public submit pending unverified reviews" ON public.reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND is_verified_purchase = FALSE);

-- Keep the exact order-code + email check, but return only tracking-safe fields.
-- Customer name, email, phone, shipping address, admin notes, and internal UUIDs
-- are deliberately omitted from the returned JSON.
CREATE OR REPLACE FUNCTION public.lookup_guest_order(p_order_id TEXT, p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order JSONB;
  v_items JSONB;
  v_history JSONB;
  v_uuid UUID;
BEGIN
  IF NULLIF(TRIM(p_order_id), '') IS NULL OR NULLIF(TRIM(p_email), '') IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'order_id', o.order_id,
    'order_status', o.order_status,
    'payment_status', o.payment_status,
    'created_at', o.created_at,
    'updated_at', o.updated_at,
    'subtotal', o.subtotal,
    'discount_amount', o.discount_amount,
    'delivery_charge', o.delivery_charge,
    'final_total', o.final_total,
    'courier_name', o.courier_name,
    'tracking_number', o.tracking_number,
    'tracking_url', o.tracking_url
  ), o.id
  INTO v_order, v_uuid
  FROM public.orders AS o
  WHERE UPPER(o.order_id) = UPPER(TRIM(p_order_id))
    AND LOWER(o.customer_email) = LOWER(TRIM(p_email));

  IF v_order IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(
    jsonb_agg(jsonb_build_object(
      'product_name', oi.product_name,
      'variant_title', oi.variant_title,
      'quantity', oi.quantity,
      'unit_price', oi.unit_price,
      'total_price', oi.total_price,
      'image_url', oi.image_url
    ) ORDER BY oi.created_at),
    '[]'::JSONB
  )
  INTO v_items
  FROM public.order_items AS oi
  WHERE oi.order_id = v_uuid;

  SELECT COALESCE(
    jsonb_agg(jsonb_build_object(
      'status', h.status,
      'created_at', h.created_at
    ) ORDER BY h.created_at),
    '[]'::JSONB
  )
  INTO v_history
  FROM public.order_status_history AS h
  WHERE h.order_id = v_uuid;

  RETURN v_order || jsonb_build_object(
    'items', v_items,
    'status_history', v_history
  );
END;
$$;

-- Sequential order codes plus an email check are not a rate limiter. Disable direct
-- client execution; a trusted Edge Function must add per-IP/account throttling,
-- generic failure responses, and abuse monitoring before calling this function.
REVOKE ALL ON FUNCTION public.lookup_guest_order(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lookup_guest_order(TEXT, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_guest_order(TEXT, TEXT) TO service_role;

-- Role behavior is intentionally unchanged. The current is_admin() function treats
-- every admin_users row, including role='manager', as full admin access. Decide the
-- intended manager permissions separately before any role/RLS changes.

COMMIT;

-- Rollback considerations:
-- Do not restore the former public review INSERT policy (WITH CHECK TRUE); doing so
-- reopens self-approval and purchase-verification claims. If reverting defaults,
-- retain an explicit pending/unverified insert policy.
-- Do not re-grant guest lookup to anon/authenticated until a rate-limited trusted
-- server endpoint exists. Restoring the previous function body would also return
-- customer PII and internal order identifiers.