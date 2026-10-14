-- PROPOSAL ONLY: review and approve before running in Supabase SQL Editor.
-- Not placed in supabase/migrations, so it will not be applied automatically.
-- This adds an integrity guard to the existing place_order_atomic flow; it does not
-- create an alternate order-placement function or modify RLS/grants.

BEGIN;

CREATE OR REPLACE FUNCTION public.validate_order_item_variant()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_variant_product_id UUID;
  v_variant_is_active BOOLEAN;
BEGIN
  IF NEW.product_id IS NULL OR NEW.variant_id IS NULL THEN
    RAISE EXCEPTION 'New order items must reference both a product and a variant';
  END IF;

  SELECT product_id, is_active
  INTO v_variant_product_id, v_variant_is_active
  FROM public.product_variants
  WHERE id = NEW.variant_id
  FOR KEY SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order variant not found';
  END IF;

  IF v_variant_product_id <> NEW.product_id THEN
    RAISE EXCEPTION 'Order variant does not belong to the submitted product';
  END IF;

  IF NOT v_variant_is_active THEN
    RAISE EXCEPTION 'Order variant is inactive';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_item_variant ON public.order_items;
CREATE TRIGGER trg_validate_order_item_variant
  BEFORE INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.validate_order_item_variant();

-- The current atomic checkout function checks coupon expiry and global usage,
-- but omits valid_from and per_customer_limit. Enforce those rules at the existing
-- coupon_usages write so a failure rolls back the whole order RPC transaction.
CREATE OR REPLACE FUNCTION public.validate_coupon_usage_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_valid_from TIMESTAMPTZ;
  v_valid_to TIMESTAMPTZ;
  v_is_active BOOLEAN;
  v_usage_limit INT;
  v_total_used_count INT;
  v_per_customer_limit INT;
  v_customer_usage_count INT;
BEGIN
  SELECT valid_from, valid_to, is_active, usage_limit, total_used_count, per_customer_limit
  INTO v_valid_from, v_valid_to, v_is_active, v_usage_limit, v_total_used_count, v_per_customer_limit
  FROM public.coupons
  WHERE id = NEW.coupon_id
  FOR UPDATE;

  IF NOT FOUND OR NOT v_is_active THEN
    RAISE EXCEPTION 'Coupon is unavailable';
  END IF;
  IF v_valid_from IS NOT NULL AND v_valid_from > NOW() THEN
    RAISE EXCEPTION 'Coupon is not yet valid';
  END IF;
  IF v_valid_to IS NOT NULL AND v_valid_to < NOW() THEN
    RAISE EXCEPTION 'Coupon has expired';
  END IF;
  -- place_order_atomic increments total_used_count before inserting this usage row.
  IF v_usage_limit IS NOT NULL AND v_total_used_count > v_usage_limit THEN
    RAISE EXCEPTION 'Coupon usage limit reached';
  END IF;

  IF v_per_customer_limit IS NOT NULL THEN
    SELECT COUNT(*)::INT
    INTO v_customer_usage_count
    FROM public.coupon_usages
    WHERE coupon_id = NEW.coupon_id
      AND LOWER(customer_email) = LOWER(NEW.customer_email);

    IF v_customer_usage_count >= v_per_customer_limit THEN
      RAISE EXCEPTION 'Coupon per-customer limit reached';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_coupon_usage_limits ON public.coupon_usages;
CREATE TRIGGER trg_validate_coupon_usage_limits
  BEFORE INSERT ON public.coupon_usages
  FOR EACH ROW EXECUTE FUNCTION public.validate_coupon_usage_limits();

COMMIT;

-- Rollback considerations:
-- Dropping this trigger/function restores the existing RPC behavior, which permits
-- mismatched or inactive variants to reach order_items. Do not roll it back without
-- replacing that validation inside place_order_atomic first.
-- Dropping the coupon usage trigger/function restores missing valid_from and
-- per_customer_limit enforcement. Do not roll it back if those coupon restrictions
-- are part of the advertised offer terms.
-- This guard does not add guest-order rate limiting or change lookup_guest_order;
-- keep direct guest lookup disabled until a rate-limited server endpoint exists.
