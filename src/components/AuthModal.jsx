import React, { useState } from 'react';
import {
  Landmark,
  X,
  LogIn,
  UserPlus,
  Settings,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const { signIn, signUp, isSupabaseConfigured } = useAuth();
  const { showToast } = useApp();

  const [tab, setTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  if (!isOpen) return null;

  const resetForms = () => {
    setError('');
    setLoginEmail(''); setLoginPassword('');
    setRegName(''); setRegEmail(''); setRegPassword(''); setRegConfirm('');
    setRegSuccess(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env terlebih dahulu.');
      return;
    }
    setError(''); setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      showToast('Berhasil masuk!', 'success');
      handleClose();
    } catch (err) {
      if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
        setError('Gagal terhubung ke Supabase (DNS Error). Aktifkan Secure DNS (Google 8.8.8.8 / Cloudflare) di setelan browser Chrome kamu.');
      } else {
        setError(err.message || 'Gagal masuk. Periksa email dan password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env terlebih dahulu.');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Password tidak cocok.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    setError(''); setLoading(true);
    try {
      await signUp(regEmail, regPassword, regName);
      setRegSuccess(true);
    } catch (err) {
      if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
        setError('Gagal terhubung ke domain Supabase (DNS Error: ERR_NAME_NOT_RESOLVED). Aktifkan Secure DNS (Google 8.8.8.8 / Cloudflare) di setelan browser Chrome kamu.');
      } else {
        setError(err.message || 'Gagal mendaftar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-md"
      onClick={handleClose}
    >
      <div
        className="glass-panel w-full max-w-md rounded-2xl border border-gold/30 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/15 bg-secondary/50">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-gold" />
            <span className="font-display font-bold text-gold tracking-wide">SEJARAH.ID</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-app-text hover:bg-surface/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gold/15">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold font-display tracking-wider transition-colors flex items-center justify-center gap-2 ${
              tab === 'login'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-text-muted hover:text-app-text'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk</span>
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold font-display tracking-wider transition-colors flex items-center justify-center gap-2 ${
              tab === 'register'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-text-muted hover:text-app-text'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar Baru</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Supabase Not Configured Warning */}
          {!isSupabaseConfigured && (
            <div className="mb-4 p-4 rounded-xl bg-amber/10 border border-amber/30 text-amber text-xs leading-relaxed flex items-start gap-2.5">
              <Settings className="w-4 h-4 text-amber shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Supabase Belum Dikonfigurasi</span>
                Isi file <code className="bg-secondary/70 px-1 rounded">.env</code> dengan URL dan Anon Key Supabase-mu terlebih dahulu untuk mengaktifkan autentikasi pengguna.
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  className="w-full bg-secondary/70 border border-gold/20 rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none focus:border-gold placeholder:text-text-dim"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-secondary/70 border border-gold/20 rounded-xl px-4 py-3 pr-12 text-sm text-app-text focus:outline-none focus:border-gold placeholder:text-text-dim"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-gold text-xs"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold to-amber text-primary font-bold py-3 rounded-xl text-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Akun</span>
                  </>
                )}
              </button>
              <p className="text-xs text-center text-text-muted">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-gold hover:underline font-semibold"
                >
                  Daftar sekarang
                </button>
              </p>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && !regSuccess && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full bg-secondary/70 border border-gold/20 rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none focus:border-gold placeholder:text-text-dim"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  className="w-full bg-secondary/70 border border-gold/20 rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none focus:border-gold placeholder:text-text-dim"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    className="w-full bg-secondary/70 border border-gold/20 rounded-xl px-4 py-3 pr-12 text-sm text-app-text focus:outline-none focus:border-gold placeholder:text-text-dim"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-gold text-xs"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Konfirmasi Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={regConfirm}
                  onChange={e => setRegConfirm(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full bg-secondary/70 border border-gold/20 rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none focus:border-gold placeholder:text-text-dim"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold to-amber text-primary font-bold py-3 rounded-xl text-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Buat Akun Baru</span>
                  </>
                )}
              </button>
              <p className="text-xs text-center text-text-muted">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-gold hover:underline font-semibold"
                >
                  Masuk di sini
                </button>
              </p>
            </form>
          )}

          {/* REGISTER SUCCESS */}
          {tab === 'register' && regSuccess && (
            <div className="text-center py-8 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <MailCheck className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-bold text-gold">Cek Email Kamu!</h3>
              <p className="text-sm text-text-muted leading-relaxed max-w-xs">
                Kami mengirimkan email konfirmasi ke <strong className="text-app-text">{regEmail}</strong>.
                Klik link di email tersebut untuk mengaktifkan akun kamu.
              </p>
              <button
                onClick={() => { setTab('login'); setRegSuccess(false); }}
                className="mt-2 text-sm text-gold hover:underline font-semibold flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Kembali ke halaman masuk</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
