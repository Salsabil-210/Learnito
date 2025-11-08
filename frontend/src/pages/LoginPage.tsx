import React from 'react';
import { motion } from 'framer-motion';
import { LoginForm } from '../components/auth/LoginForm';
import { ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onSignupClick?: () => void;
  onBackClick?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSignupClick, onBackClick }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      {onBackClick && (
        <motion.button
          onClick={onBackClick}
          className="absolute left-4 top-6 z-10 flex items-center gap-2 font-medium text-gray-600 transition-colors hover:text-gray-900 sm:left-6"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft size={18} />
          Back
        </motion.button>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
    {/* Card Container */}
    <div className="space-y-8 rounded-lg border border-gray-200 bg-white/95 p-6 shadow-xl sm:p-8 md:p-10">
          {/* Logo and Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center space-y-2"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Learnito
            </h1>
            <p className="text-gray-600 text-sm">Welcome back to your learning journey</p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <LoginForm onSignupClick={onSignupClick} />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200"
          >
            <p>
              By signing in, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
