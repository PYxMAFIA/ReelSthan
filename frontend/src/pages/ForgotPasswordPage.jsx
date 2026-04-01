import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader } from 'lucide-react';
import api from '../lib/api.js';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/auth/forget-password', { email: email.trim() }, {
        skipGlobalError: true // Handle errors locally for better UX
      });
      toast.success(data?.message || 'Password reset link sent to your email', {
        duration: 5000,
      });
      setSubmitted(true);
    } catch (err) {
      // Enhanced error handling for email service failures
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        toast.error('Request timed out. Email service may be unavailable. Please try again later.', {
          duration: 5000,
        });
      } else if (err.response?.status === 503 || err.response?.status === 500) {
        toast.error('Email service is currently unavailable. Please try again after some time.', {
          duration: 6000,
          icon: '⚠️',
        });
      } else if (err.response?.status === 429) {
        toast.error('Too many attempts. Please wait a few minutes before trying again.', {
          duration: 5000,
        });
      } else {
        const errorMsg = err?.response?.data?.message || 'Failed to send reset email. Please try again.';
        toast.error(errorMsg, {
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden px-4">

      {/* Subtle background effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full z-10">
        {/* Back to login link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Main Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full mb-4">
              <Mail className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
            <p className="text-gray-400">
              {submitted
                ? "Check your email for reset instructions"
                : "No worries, we'll send you reset instructions"
              }
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none text-white placeholder-gray-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Sending...
                  </>
                ) : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <div className="text-sm">
                  <p className="font-medium mb-1">Email sent!</p>
                  <p className="text-emerald-400/80">
                    If you don't see the email, check your spam folder.
                  </p>
                </div>
              </div>

              {/* Resend Button */}
              <button
                onClick={() => {
                  setSubmitted(false);
                }}
                className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              >
                Resend Email
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Link */}
        {!submitted && (
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Remember your password?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
