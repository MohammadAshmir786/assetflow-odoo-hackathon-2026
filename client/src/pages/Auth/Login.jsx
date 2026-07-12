import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from '../../features/auth/authThunks';
import { clearAuthError } from '../../features/auth/authSlice';
import { selectIsAuthenticated } from '../../features/auth/authSelectors';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiX } from 'react-icons/fi';
import gsap from 'gsap';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // GSAP entrance animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set([leftPanelRef.current, rightPanelRef.current], { opacity: 1, x: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(leftPanelRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
      );
      gsap.fromTo(rightPanelRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 }
      );
    });

    return () => ctx.revert();
  }, []);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    if (!email) {
      setValidationError('Email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setValidationError('Password is required.');
      return false;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    dispatch(login({ email, password }));
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setValidationError('');
    dispatch(clearAuthError());
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      {/* Left Panel: Branding / Visuals */}
      <div
        ref={leftPanelRef}
        className="w-full md:w-1/2 bg-slate-900 text-white flex flex-col justify-between p-8 md:p-12 relative overflow-hidden"
      >
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950 z-0"></div>
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] z-0"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span className="text-white font-bold text-xl tracking-wider">AF</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight text-white m-0">AssetFlow</h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Enterprise</span>
          </div>
        </div>

        {/* Feature Descriptions */}
        <div className="relative z-10 my-auto py-12 max-w-md">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/60 border border-indigo-900/50 px-3 py-1 rounded-full">
            Enterprise Asset Management
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-6 tracking-tight leading-tight">
            Streamline your resources in real-time.
          </h2>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed">
            Monitor deployments, coordinate maintenance cycles, and authorize asset transfers across departments from one consolidated system.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} AssetFlow Systems. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Form */}
      <div
        ref={rightPanelRef}
        className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white z-10"
      >
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back! Please enter your system credentials.
            </p>
          </div>

          {/* Validation or Backend error alerts */}
          {(validationError || error) && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start space-x-3 text-xs leading-relaxed animate-fadeIn">
              <FiAlertCircle className="h-5 w-5 text-red-650 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-955">Authentication Alert</p>
                <p className="mt-0.5">{validationError || error}</p>
              </div>
              <button
                onClick={() => {
                  setValidationError('');
                  dispatch(clearAuthError());
                }}
                className="text-red-400 hover:text-red-600 p-0.5 rounded-lg transition-colors cursor-pointer"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiMail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="input-field pl-10"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiLock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center py-2.5 focus:ring-offset-white cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Quick Fill Accounts */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 text-center">
              Quick-Fill Demo Credentials
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickFill('admin@assetflow.demo', 'Demo@123')}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Admin
              </button>
              <button
                onClick={() => handleQuickFill('manager@assetflow.demo', 'Demo@123')}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Manager
              </button>
              <button
                onClick={() => handleQuickFill('employee1@assetflow.demo', 'Demo@123')}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
