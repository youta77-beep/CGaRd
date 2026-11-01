import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, KeyRound, Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { verifyDeveloperCredentials } from '../auth/developerAuth';

interface DeveloperLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export const DeveloperLoginModal: React.FC<DeveloperLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError(null);
      setIsSubmitting(false);
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your workspace email.');
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setError('Please enter the password.');
      setIsSubmitting(false);
      return;
    }

    const isValid = verifyDeveloperCredentials(trimmedEmail, password);

    if (isValid) {
      onLoginSuccess(trimmedEmail);
      onClose();
    } else {
      setError('Invalid email or password. Access is restricted to authorized CGaRd Workspace accounts.');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dev-login-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-[#2C3E50] border border-[#A87B4E]/40 rounded-2xl shadow-2xl overflow-hidden text-[#F5F2EB]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#3D2817] border-b border-[#A87B4E]/30">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#A87B4E]/25 border border-[#A87B4E]/50 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#A87B4E]" />
                </div>
                <div>
                  <h3 id="dev-login-title" className="text-sm font-extrabold text-white">
                    CGaRd Workspace Login
                  </h3>
                  <p className="text-[10px] text-[#F5F2EB]/60">Authorized workspace access only</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-[#F5F2EB]/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-start space-x-2"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="dev-email" className="block text-xs font-bold text-[#F5F2EB]/90">
                  Workspace Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A87B4E] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    ref={emailInputRef}
                    id="dev-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="developer@example.com"
                    autoComplete="email"
                    required
                    className="w-full bg-[#1e2b37] text-xs text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#A87B4E]/30 focus:border-[#A87B4E] focus:outline-none placeholder-[#F5F2EB]/40 transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="dev-password" className="block text-xs font-bold text-[#F5F2EB]/90">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#A87B4E] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="dev-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter developer password"
                    autoComplete="current-password"
                    required
                    className="w-full bg-[#1e2b37] text-xs text-white pl-9 pr-10 py-2.5 rounded-xl border border-[#A87B4E]/30 focus:border-[#A87B4E] focus:outline-none placeholder-[#F5F2EB]/40 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#F5F2EB]/60 hover:text-white transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#F5F2EB]/70 hover:text-white hover:bg-white/5 border border-transparent transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#A87B4E] hover:opacity-90 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
