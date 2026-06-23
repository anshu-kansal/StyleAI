import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch } from '../app/store';
import { logoutUser } from '../features/auth/authSlice';
import Button from '../components/ui/Button';
import { User, Mail, Shield, LogOut, ShoppingBag, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

export const Profile: React.FC = () => {
  const { user, isLoading } = useAuth();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      toast.success('Logged out successfully');
    } else {
      toast.error('Logout failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-50/50 dark:bg-slate-950/20">
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-100/50 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none space-y-8">
        
        {/* Header/Avatar */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto text-brand-accent border-2 border-brand-accent/20">
            <User size={36} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-black text-slate-900 dark:text-white">
              {user.name}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Manage your personal settings
            </p>
          </div>
        </div>

        {/* User Details */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
            <Mail className="text-slate-400 flex-shrink-0" size={18} />
            <div className="text-sm truncate">
              <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Email Address</span>
              {user.email}
            </div>
          </div>

          <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
            <Shield className="text-slate-400 flex-shrink-0" size={18} />
            <div className="text-sm">
              <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Roles</span>
              {user.roles.join(', ')}
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="space-y-3">
          <Link
            to={ROUTES.ORDERS}
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/65 border border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 rounded-2xl transition-all group"
          >
            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
              <ShoppingBag className="text-brand-accent group-hover:scale-110 transition-transform" size={20} />
              <div className="text-left">
                <span className="text-slate-800 dark:text-slate-100 text-sm font-bold block">
                  My Orders
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Track, cancel, or return orders
                </span>
              </div>
            </div>
            <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform" size={18} />
          </Link>
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white font-semibold py-3 cursor-pointer"
        >
          <LogOut size={16} /> Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
