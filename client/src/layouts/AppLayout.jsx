import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../features/auth/authSlice';
import { selectCurrentUser } from '../features/auth/authSelectors';
import { FiLayout, FiBox, FiShuffle, FiTool, FiLogOut, FiUser, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import gsap from 'gsap';

export const AppLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);

  const mobileSidebarRef = useRef(null);
  const mobileBackdropRef = useRef(null);
  const mainContentRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Close mobile sidebar on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Dynamic Page Title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/assets')) return 'Enterprise Assets';
    if (path.includes('/transfers')) return 'Resource Transfers';
    if (path.includes('/maintenance')) return 'Asset Maintenance';
    return 'AssetFlow Hub';
  };

  // GSAP animation for mobile sidebar drawer
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (isMobileOpen) {
        gsap.set(mobileSidebarRef.current, { x: 0 });
        gsap.set(mobileBackdropRef.current, { opacity: 0.5, visibility: 'visible' });
      } else {
        gsap.set(mobileSidebarRef.current, { x: '-100%' });
        gsap.set(mobileBackdropRef.current, { opacity: 0, visibility: 'hidden' });
      }
      return;
    }

    const ctx = gsap.context(() => {
      if (isMobileOpen) {
        gsap.to(mobileBackdropRef.current, {
          autoAlpha: 0.5,
          duration: 0.25,
          ease: 'power2.out',
        });
        gsap.to(mobileSidebarRef.current, {
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(mobileBackdropRef.current, {
          autoAlpha: 0,
          duration: 0.25,
          ease: 'power2.in',
        });
        gsap.to(mobileSidebarRef.current, {
          x: '-100%',
          duration: 0.3,
          ease: 'power2.in',
        });
      }
    });

    return () => ctx.revert();
  }, [isMobileOpen]);

  // GSAP subtle page content reveal animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(mainContentRef.current, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(mainContentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power1.out' }
      );
    });

    return () => ctx.revert();
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiLayout },
    { name: 'Assets', path: '/assets', icon: FiBox },
    { name: 'Transfers', path: '/transfers', icon: FiShuffle },
    { name: 'Maintenance', path: '/maintenance', icon: FiTool },
  ];

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full bg-slate-900 text-white">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-650 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <span className="text-white font-bold text-lg tracking-wider">AF</span>
            </div>
            <div>
              <h1 className="text-base font-bold leading-none tracking-tight text-white m-0">AssetFlow</h1>
              <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Enterprise</span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-350">
              <FiUser className="h-5 w-5" />
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-205 truncate m-0">{user?.name || 'User Profile'}</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border tracking-wider ${getRoleColor(user?.role)}`}>
                  {user?.role || 'Guest'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout button at bottom of sidebar */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-2.5 w-full px-4 py-2.5 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 border border-slate-700 hover:border-red-900/50 text-slate-300 text-sm font-semibold rounded-xl transition-all duration-150 cursor-pointer"
        >
          <FiLogOut className="h-4.5 w-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 1. Desktop Sidebar (Always visible on lg screen) */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-slate-800">
        <SidebarContent />
      </aside>

      {/* 2. Mobile Drawer Backdrop */}
      <div
        ref={mobileBackdropRef}
        onClick={() => setIsMobileOpen(false)}
        className="fixed inset-0 bg-slate-950 opacity-0 z-40 lg:hidden pointer-events-none"
        style={{ visibility: 'hidden' }}
      ></div>

      {/* 3. Mobile Sidebar Drawer */}
      <div
        ref={mobileSidebarRef}
        className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden transform -translate-x-full shadow-2xl"
      >
        <div className="h-full relative">
          <SidebarContent />
          <button
            onClick={() => setIsMobileOpen(false)}
            className="absolute top-4 right-[-3rem] p-2 bg-slate-900 text-slate-200 hover:text-white rounded-r-lg border-y border-r border-slate-800 focus:outline-none cursor-pointer"
            aria-label="Close menu"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 4. Main Body Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 shadow-sm z-30">
          <div className="flex items-center space-x-3">
            {/* Hamburger Button for mobile */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Open menu"
            >
              <FiMenu className="h-5.5 w-5.5" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-slate-850 m-0 tracking-tight leading-none">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Desktop / Mobile Top Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left text-xs leading-none">
                  <p className="font-semibold text-slate-700 m-0">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user?.role || 'Guest'}</p>
                </div>
                <FiChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  <div
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="fixed inset-0 z-40"
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-700 truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-red-650 hover:bg-red-50 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <FiLogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
          <div ref={mainContentRef} className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
