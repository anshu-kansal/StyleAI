import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAppDispatch } from './app/store';
import { checkAuth } from './features/auth/authSlice';

// Lazy loading pages
const Login = React.lazy(() => import('./pages/Login'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Profile = React.lazy(() => import('./pages/Profile'));
const AiAssistant = React.lazy(() => import('./pages/AiAssistant'));
const OutfitGenerator = React.lazy(() => import('./pages/OutfitGenerator'));
const Compare = React.lazy(() => import('./pages/Compare'));
const ProductListing = React.lazy(() => import('./pages/ProductListing'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Orders = React.lazy(() => import('./pages/Orders'));
const OrderDetails = React.lazy(() => import('./pages/OrderDetails'));
const AIStylist = React.lazy(() => import('./pages/AIStylist'));

// Admin pages (lazy-loaded)
const AdminLayout = React.lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminCategories = React.lazy(() => import('./pages/admin/AdminCategories'));
const AdminCoupons = React.lazy(() => import('./pages/admin/AdminCoupons'));

export const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Perform silent authentication token verification/refresh on mount
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>

        {/* Admin routes — separate layout, no storefront header/footer */}
        <Route
          path="/admin"
          element={
            <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading admin...</div>}>
              <AdminLayout />
            </React.Suspense>
          }
        >
          <Route
            index
            element={
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                <AdminDashboard />
              </React.Suspense>
            }
          />
          <Route
            path="products"
            element={
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                <AdminProducts />
              </React.Suspense>
            }
          />
          <Route
            path="orders"
            element={
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                <AdminOrders />
              </React.Suspense>
            }
          />
          <Route
            path="users"
            element={
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                <AdminUsers />
              </React.Suspense>
            }
          />
          <Route
            path="categories"
            element={
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                <AdminCategories />
              </React.Suspense>
            }
          />
          <Route
            path="coupons"
            element={
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                <AdminCoupons />
              </React.Suspense>
            }
          />
        </Route>

        {/* Storefront routes with MainLayout */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/login"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <Login />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <ForgotPassword />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/reset-password/:token"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <ResetPassword />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <ProductListing />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/product/:slug"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <ProductDetails />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <Cart />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <Wishlist />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    </React.Suspense>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    </React.Suspense>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <ProtectedRoute>
                        <OrderDetails />
                      </ProtectedRoute>
                    </React.Suspense>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    </React.Suspense>
                  }
                />
                <Route
                  path="/stylist"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <AIStylist />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/assistant"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <AiAssistant />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/outfit-generator"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <OutfitGenerator />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/compare"
                  element={
                    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                      <Compare />
                    </React.Suspense>
                  }
                />
                <Route path="*" element={<div className="p-16 text-center text-slate-400">404 - Page Not Found</div>} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </>
  );
};

export default App;

