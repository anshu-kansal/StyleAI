import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axios';
import Button from '../components/ui/Button';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../constants';

export const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: any) => {
    if (!token) {
      toast.error('Reset token is missing from the URL.');
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      toast.success('Password reset successful! Please login.');
      navigate(ROUTES.LOGIN);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-slate-50/50 dark:bg-slate-950/20">
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-100/50 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none space-y-8">
        
        {/* Header */}
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
            Create New Password
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Enter your new password below to secure your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all duration-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                  errors.password ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-950/20' : 'border-slate-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-500 font-semibold">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === passwordValue || 'Passwords do not match',
                })}
                className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all duration-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                  errors.confirmPassword
                    ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-950/20'
                    : 'border-slate-200'
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-500 font-semibold">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            variant="secondary"
            type="submit"
            isLoading={isLoading}
            className="w-full mt-2 font-semibold shadow-lg shadow-brand-accent/20 py-3 cursor-pointer"
          >
            Reset Password
          </Button>

          <div className="text-center mt-4">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 gap-2"
            >
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
