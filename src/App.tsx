import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { CustomerLayout } from './components/layout/CustomerLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ShopPage } from './pages/customer/ShopPage';
import { CategoryPage } from './pages/customer/CategoryPage';
import { SearchPage } from './pages/customer/SearchPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderConfirmationPage } from './pages/customer/OrderConfirmationPage';
import { MyOrdersPage } from './pages/customer/MyOrdersPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';
import { AboutPage } from './pages/customer/AboutPage';
import { ContactPage } from './pages/customer/ContactPage';
import { FaqPage } from './pages/customer/FaqPage';
import { ShippingPolicyPage } from './pages/customer/ShippingPolicyPage';
import { ReturnsPolicyPage } from './pages/customer/ReturnsPolicyPage';
import { PrivacyPolicyPage } from './pages/customer/PrivacyPolicyPage';
import { TermsPage } from './pages/customer/TermsPage';
import { NotFoundPage } from './pages/customer/NotFoundPage';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSalesPage } from './pages/admin/AdminSalesPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Scroll to top helper on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* 1. Protected Admin Portal Routes (Must be at the top for priority) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="sales" element={<AdminSalesPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* 2. Customer Store Routes */}
            <Route path="/" element={<CustomerLayout />}>
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="product/:slug" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              <Route path="my-orders" element={<MyOrdersPage />} />
              <Route path="order/:orderId" element={<OrderDetailPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="shipping-policy" element={<ShippingPolicyPage />} />
              <Route path="returns-policy" element={<ReturnsPolicyPage />} />
              <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;