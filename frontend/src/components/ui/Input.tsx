import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface InputProps {
  label: string;
  type?: string;
  name?: string;
  placeholder?: string;
  icon?: LucideIcon;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  name,
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  return (
    <div className="flex w-full flex-col items-start gap-2 text-left">
      <label className="text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <div className="relative w-full">
        {Icon && (
          <motion.div
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            animate={{ color: error ? '#ef4444' : '#9ca3af' }}
            transition={{ duration: 0.2 }}
          >
            <Icon size={18} />
          </motion.div>
        )}
        <input
          type={type}
          name={name}
          id={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full rounded-lg bg-white border text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${Icon ? 'pl-11 pr-4 py-3' : 'px-4 py-3'} ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          } ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400'}`}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
