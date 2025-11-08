import React from 'react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Page Content */}
      <main>{children}</main>

      {/* Decorative Elements */}
      <motion.div
        className="fixed top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"
        animate={{ x: [0, 50, 0], y: [0, 50, 0] }}
        transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed bottom-0 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"
        animate={{ x: [0, -50, 0], y: [0, -50, 0] }}
        transition={{ duration: 35, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      />
    </div>
  );
};
