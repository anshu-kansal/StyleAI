import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  TicketPercent,
  ArrowLeft,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';
import { ROUTES } from '../constants';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, end: false },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree, end: false },
  { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent, end: false },
];

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  // Guard: not authenticated or not admin
  if (!isAuthenticated || !user?.roles.includes('ADMIN')) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-slate-50/50 dark:bg-slate-950/30">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex-shrink-0">
        {/* Admin branding */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-slate-950 dark:bg-white rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white dark:text-slate-950" />
            </div>
            <div>
              <h2 className="font-serif font-black text-sm text-slate-900 dark:text-white tracking-tight">
                Admin Panel
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                StyleAI Management
              </p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Back to store */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-all w-full cursor-pointer"
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-slate-500" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <NavLink
            to={ROUTES.HOME}
            className="flex items-center gap-2 px-4 py-1 text-xs font-bold text-slate-400 hover:text-brand-accent transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Storefront</span>
          </NavLink>
        </div>
      </aside>

      {/* Mobile nav bar (horizontal) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex justify-around py-2 px-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${
                isActive
                  ? 'text-brand-accent'
                  : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 pb-20 lg:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
