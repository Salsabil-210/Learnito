import React from "react";
import { motion } from "framer-motion";
import { LoginForm } from "../components/auth/LoginForm";
import { ArrowLeft, BookOpen } from "lucide-react";

interface LoginPageProps {
  onSignupClick?: () => void;
  onBackClick?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSignupClick, onBackClick }) => {
  return (
    <div className="relative flex min-h-screen">
      {/* Back Button */}
      {onBackClick && (
        <motion.button
          onClick={onBackClick}
          className="absolute left-6 top-6 z-50 flex items-center gap-2 font-medium text-white lg:text-gray-600 transition-colors hover:opacity-80"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back</span>
        </motion.button>
      )}

      {/* Container with two columns */}
      <div className="flex w-full flex-col lg:flex-row">
        {/* Left Side - Minimal Gradient Section */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden"
        >
          {/* Soft decorative background blur */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>

          {/* Content - Centered */}
          <div className="relative z-10 max-w-md text-center space-y-6">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center justify-center gap-3"
            >
              <BookOpen size={40} className="text-white" strokeWidth={2.5} />
              <h1 className="text-5xl font-extrabold tracking-tight">Learnito</h1>
            </motion.div>

            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="space-y-3 pt-4"
            >
              <h2 className="text-3xl font-bold leading-snug">Welcome Back to Learnito</h2>
              <p className="text-lg text-white/90 font-light">Your journey to growth continues.</p>
            </motion.div>

            {/* Subtle accent element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="pt-8"
            >
              <div className="w-20 h-1 bg-white/40 rounded-full mx-auto" />
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-gray-50 to-white"
        >
          <div className="w-full max-w-md">
            {/* Mobile Logo (hidden on desktop) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:hidden text-center space-y-3 pb-8"
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen size={32} className="text-blue-600" strokeWidth={2.5} />
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Learnito
                </h1>
              </div>
              <p className="text-gray-600 text-sm">Welcome back to your learning journey</p>
            </motion.div>

            {/* Card Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-8 rounded-3xl bg-white p-8 sm:p-10 shadow-xl border border-gray-100"
            >
              {/* Title */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
                <p className="text-gray-600 text-sm">Enter your credentials to continue</p>
              </div>

              {/* Form */}
              <LoginForm onSignupClick={onSignupClick} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
