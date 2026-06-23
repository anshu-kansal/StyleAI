import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User as UserIcon, Search, Menu, Sparkles, Shield, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ROUTES } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { setSearch } from '../../features/catalog/catalogSlice';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const isAdmin = user?.roles?.includes('ADMIN');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.catalog);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 dark:bg-slate-900/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to={ROUTES.HOME} className="font-serif text-2xl font-black tracking-tight text-brand-dark dark:text-white">
              Style<span className="text-brand-accent font-sans">AI</span>
            </Link>
 
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Link to={ROUTES.PRODUCTS} className="hover:text-brand-accent transition-colors">Shop</Link>
              <Link to={ROUTES.AI_ASSISTANT} className="hover:text-brand-accent transition-colors text-brand-accent font-bold flex items-center gap-1">
                <Sparkles size={14} className="fill-brand-accent/10" />
                <span>AI Assistant</span>
              </Link>
              <Link to={ROUTES.OUTFIT_GENERATOR} className="hover:text-brand-accent transition-colors">Outfit Generator</Link>
              <Link to={ROUTES.COMPARE} className="hover:text-brand-accent transition-colors">Compare</Link>
              <Link to={ROUTES.STYLIST} className="hover:text-brand-accent transition-colors">AI Stylist</Link>
            </nav>
          </div>
 
          {/* Search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
              dispatch(setSearch(val));
              navigate(ROUTES.PRODUCTS);
            }}
            className="hidden sm:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                name="search"
                defaultValue={filters.keyword}
                placeholder="Search premium fashion..."
                className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-brand-accent focus:bg-white transition-all dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-900"
              />
              <Search className="absolute left-3.5 top-2 h-4 w-4 text-slate-400" />
            </div>
          </form>
 
          {/* Icons / Utility Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-600 dark:text-slate-300 cursor-pointer duration-300 transform active:scale-95"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-amber-500 rotate-0 transition-transform duration-500 hover:rotate-45" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600 transition-transform duration-500 hover:-rotate-12" />
              )}
            </button>

            <Link to={ROUTES.WISHLIST} className="p-2 hover:bg-slate-50 rounded-full transition-colors dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 relative">
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white font-black text-[9px] h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
 
            <Link to={ROUTES.CART} className="p-2 hover:bg-slate-50 rounded-full transition-colors dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white font-black text-[9px] h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    to={ROUTES.ADMIN_DASHBOARD}
                    className="flex items-center gap-1 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-[11px] font-bold hover:bg-violet-100 transition-all dark:bg-violet-950/30 dark:text-violet-400 dark:hover:bg-violet-950/50 border border-violet-100 dark:border-violet-900/30"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link to={ROUTES.PROFILE} className="p-2 hover:bg-slate-50 rounded-full transition-colors dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <UserIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate(ROUTES.LOGIN);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-brand-accent cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all dark:text-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <UserIcon className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}

            <button className="p-2 md:hidden hover:bg-slate-50 rounded-full transition-colors dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
