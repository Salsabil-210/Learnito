import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api/authAPI';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSignupClick?: () => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSignupClick, onSuccess }) => {
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Please enter a valid email';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear general error when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    const [err, _response] = await authAPI.login(formData);

    if (err) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
      return;
    }

    // Success - cookies are automatically set by the browser
    onSuccess?.();
    window.location.href = '/';
  };

  const handleGoogleSignIn = async (credential: string) => {
    setGoogleLoading(true);
    setError(null);

    const [err, _response] = await authAPI.googleAuth(credential);

    if (err) {
      setError(err.message || 'Google login failed. Please try again.');
      setGoogleLoading(false);
      return;
    }

    // Success - cookies are automatically set by the browser
    onSuccess?.();
    window.location.href = '/';
  };

  useEffect(() => {
    if (window.google) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: (response: any) => {
          if (response.credential) handleGoogleSignIn(response.credential);
        },
      });
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-start space-y-5">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
        >
          {error}
        </motion.div>
      )}

      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="you@example.com"
        icon={Mail}
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <div className="w-full flex flex-col items-start gap-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
        <div className="relative w-full">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={18} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className={`w-full rounded-lg border px-11 py-3 focus:outline-none ${
              errors.password
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      </div>

      <div className="flex w-full items-center justify-between">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="sr-only" />
          <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
            rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
          }`}>
            {rememberMe && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
          </div>
          <span className="text-sm text-gray-600 select-none">Remember me</span>
        </label>
        <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot Password?</a>
      </div>

      <Button type="submit" fullWidth loading={loading} disabled={googleLoading}>Sign In</Button>

      <div className="relative w-full my-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-500">Or continue with</span></div>
      </div>

      <button
        type="button"
        onClick={() => window.google?.accounts.id.prompt()}
        disabled={loading || googleLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
      >
        {googleLoading ? 'Signing in...' : 'Continue with Google'}
      </button>

      <div className="relative w-full my-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-500">New to Learnito?</span></div>
      </div>

      <Button type="button" variant="secondary" fullWidth onClick={onSignupClick}>Create Account</Button>
    </form>
  );
};
