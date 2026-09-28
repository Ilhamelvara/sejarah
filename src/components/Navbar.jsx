import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Landmark,
  Home,
  BookOpen,
  Sparkles,
  HelpCircle,
  Trophy,
  Info,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useApp();
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [userDropdown, setUserDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUserDropdown(false);
    } catch (e) {
      console.error(e);
    }
  };

  const openLogin = () => { setAuthTab('login'); setAuthModalOpen(true); setMobileOpen(false); };
  const openRegister = () => { setAuthTab('register'); setAuthModalOpen(true); setMobileOpen(false); };

  const navLinks = [
    { to: '/', label: 'Beranda', icon: Home },
    { to: '/materi', label: 'Materi', icon: BookOpen },
    { to: '/museum', label: 'Museum 3D', icon: Landmark },
    { to: '/quiz', label: 'Kuis', icon: HelpCircle },
    { to: '/peringkat', label: 'Peringkat', icon: Trophy },
    { to: '/about', label: 'Tentang', icon: Info },
  ];

  // Get display name from user metadata or email
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarLetter = displayName[0]?.toUpperCase() || 'U';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'glass-panel py-3 shadow-lg border-b border-gold/20'
            : 'bg-primary/80 backdrop-blur-md py-4 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 text-gold font-display font-bold text-xl tracking-wider hover:opacity-90 transition-opacity shrink-0"
          >
            <Landmark className="w-6 h-6 text-gold" />
            <span className="hidden sm:block">SEJARAH.ID</span>
          </NavLink>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => {
              const IconComp = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gold/20 text-gold border border-gold/30 shadow-sm'
                        : 'text-text-muted hover:text-app-text hover:bg-surface/50'
                    }`
                  }
                >
                  <IconComp className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleFullscreen}
              className="hidden sm:flex p-2 rounded-lg bg-surface/60 hover:bg-surface border border-gold/20 text-gold transition-colors text-sm items-center"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-surface/60 hover:bg-surface border border-gold/20 text-gold transition-colors text-sm flex items-center"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth Buttons / User Avatar */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-amber flex items-center justify-center text-primary font-bold text-sm border-2 border-gold/50 hover:border-gold transition-all"
                  title={displayName}
                >
                  {avatarLetter}
                </button>

                {/* Dropdown */}
                {userDropdown && (
                  <div className="absolute right-0 top-12 w-56 glass-panel rounded-2xl border border-gold/25 shadow-2xl py-2 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gold/15">
                      <p className="text-sm font-bold text-app-text truncate">{displayName}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={openLogin}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-gold hover:bg-surface/50 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </button>
                <button
                  onClick={openRegister}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold to-amber text-primary text-sm font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg bg-surface/60 hover:bg-surface border border-gold/20 text-gold transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-gold rounded transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`w-full h-0.5 bg-gold rounded transition-opacity duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`w-full h-0.5 bg-gold rounded transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden pt-20 bg-primary/97 backdrop-blur-xl flex flex-col">
          <div className="flex flex-col p-6 gap-3 overflow-y-auto flex-1">
            {navLinks.map((link) => {
              const IconComp = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3 transition-all ${
                      isActive
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'text-app-text hover:bg-surface/50'
                    }`
                  }
                >
                  <IconComp className="w-5 h-5 text-gold" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}

            {/* Mobile Auth Divider */}
            <div className="border-t border-gold/15 pt-4 mt-2 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold/10 border border-gold/20">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-amber flex items-center justify-center text-primary font-bold text-sm">
                      {avatarLetter}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-app-text">{displayName}</p>
                      <p className="text-xs text-text-muted truncate max-w-[160px]">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-danger bg-danger/10 border border-danger/20 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openLogin}
                    className="w-full px-4 py-3 rounded-xl bg-surface/60 border border-gold/20 text-app-text text-sm font-semibold hover:bg-surface flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-gold" />
                    <span>Masuk</span>
                  </button>
                  <button
                    onClick={openRegister}
                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-gold to-amber text-primary text-sm font-bold hover:brightness-110 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Daftar Akun Baru</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => { setAuthModalOpen(false); setUserDropdown(false); }}
        defaultTab={authTab}
      />

      {/* Close dropdown when clicking outside */}
      {userDropdown && (
        <div className="fixed inset-0 z-30" onClick={() => setUserDropdown(false)} />
      )}
    </>
  );
}
