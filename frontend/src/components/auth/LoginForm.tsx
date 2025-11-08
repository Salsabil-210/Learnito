import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSignupClick?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSignupClick }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log('Login attempt with:', formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col items-start space-y-6 text-left"
    >
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

      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="••••••••"
        icon={Lock}
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />

      <div className="flex w-full items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          <span>Remember me</span>
        </label>
        <a
          href="/forgot-password"
          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          Forgot Password?
        </a>
      </div>

      <Button type="submit" fullWidth loading={loading}>
        Sign In
      </Button>

      <div className="relative w-full my-2">
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">New to Learnito?</span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={onSignupClick}
      >
        Create Account
      </Button>
    </form>
  );
};
