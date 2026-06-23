import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axios';
import Button from '../components/ui/Button';
import { Mail, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../constants';

export const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      await axiosInstance.post('/auth/forgot-password', data);
      setIsSubmitted(true);
      toast.success('Reset link requested successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong';
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
            Reset Password
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            We'll send you instructions to reset your password.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full dark:bg-emerald-950/20 dark:text-emerald-400 inline-block">
              <Mail size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Check Your Email</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                If an account exists for that address, we have logged a password reset link to the server console.
              </p>
            </div>
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center text-sm font-semibold text-brand-accent hover:underline gap-2 mt-4"
            >
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all duration-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                    errors.email ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-950/20' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 font-semibold">{errors.email.message}</p>
              )}
            </div>

            <Button
              variant="secondary"
              type="submit"
              isLoading={isLoading}
              className="w-full mt-2 font-semibold shadow-lg shadow-brand-accent/20 py-3 cursor-pointer"
            >
              Send Reset Link
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
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
