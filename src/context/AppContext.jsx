import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user } = useAuth();

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('sejarah_prefs') || '{}');
      return prefs.darkMode !== undefined ? prefs.darkMode : true;
    } catch { return true; }
  });

  // Bookmarks, progress, and quiz scores — local-first, synced to Supabase
  const [bookmarks, setBookmarks] = useState([]);
  const [progress, setProgress] = useState({});
  const [quizScores, setQuizScores] = useState({});
  const [toasts, setToasts] = useState([]);

  /* ── Sync theme to html attribute ─────────────────────────── */
  useEffect(() => {
    document.documentElement[darkMode ? 'removeAttribute' : 'setAttribute']('data-theme', 'light');
  }, [darkMode]);

  /* ── Load user data from Supabase when logged in ─────────── */
  useEffect(() => {
    if (user && isSupabaseConfigured && supabase) {
      loadUserData();
    } else if (!user) {
      // Fallback: load from localStorage for guest
      try {
        const prefs = JSON.parse(localStorage.getItem('sejarah_prefs') || '{}');
        setBookmarks(prefs.bookmarks || []);
        setProgress(prefs.progress || {});
        setQuizScores(prefs.quizScores || {});
      } catch { /* ignore */ }
    }
  }, [user]);

  /* ── Save guest preferences to localStorage ──────────────── */
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem('sejarah_prefs', JSON.stringify({ darkMode, bookmarks, progress, quizScores }));
      } catch { /* ignore */ }
    }
  }, [darkMode, bookmarks, progress, quizScores, user]);

  const loadUserData = async () => {
    if (!supabase) return;
    try {
      const [bRes, pRes, qRes, profRes] = await Promise.all([
        supabase.from('user_bookmarks').select('materi_id').eq('user_id', user.id),
        supabase.from('user_progress').select('materi_id').eq('user_id', user.id),
        supabase.from('user_quiz_scores').select('quiz_id, score').eq('user_id', user.id),
        supabase.from('user_profiles').select('dark_mode').eq('id', user.id).single(),
      ]);

      if (bRes.data) setBookmarks(bRes.data.map(r => r.materi_id));
      if (pRes.data) {
        const prog = {};
        pRes.data.forEach(r => { prog[r.materi_id] = true; });
        setProgress(prog);
      }
      if (qRes.data) {
        const scores = {};
        qRes.data.forEach(r => { scores[`quiz_${r.quiz_id}`] = r.score; });
        setQuizScores(scores);
      }
      if (profRes.data?.dark_mode !== undefined) {
        setDarkMode(profRes.data.dark_mode);
      }
    } catch (e) {
      console.warn('Failed to load user data from Supabase:', e);
    }
  };

  /* ── Dark Mode ───────────────────────────────────────────── */
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      showToast(next ? 'Mode Gelap Aktif' : 'Mode Terang Aktif', 'gold');
      // Sync dark_mode preference for logged-in users
      if (user && isSupabaseConfigured && supabase) {
        supabase.from('user_profiles')
          .upsert({ id: user.id, dark_mode: next, updated_at: new Date().toISOString() })
          .then(() => {});
      }
      return next;
    });
  };

  /* ── Bookmarks ───────────────────────────────────────────── */
  const toggleBookmark = async (id, judul) => {
    const exists = bookmarks.includes(id);
    if (exists) {
      showToast(`"${judul}" dihapus dari bookmark`, 'danger');
      setBookmarks(prev => prev.filter(item => item !== id));
      if (user && isSupabaseConfigured && supabase) {
        await supabase.from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('materi_id', id);
      }
    } else {
      showToast(`"${judul}" ditambahkan ke bookmark`, 'success');
      setBookmarks(prev => [...prev, id]);
      if (user && isSupabaseConfigured && supabase) {
        await supabase.from('user_bookmarks')
          .insert({ user_id: user.id, materi_id: id });
      }
    }
  };

  /* ── Reading Progress ────────────────────────────────────── */
  const markAsRead = async (id) => {
    if (progress[id]) return;
    setProgress(prev => ({ ...prev, [id]: true }));
    if (user && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_progress')
          .upsert(
            { user_id: user.id, materi_id: id, read_at: new Date().toISOString() },
            { onConflict: 'user_id, materi_id' }
          );
      } catch (e) {
        console.warn('Progress sync warning:', e);
      }
    }
  };

  /* ── Quiz Scores ─────────────────────────────────────────── */
  const saveQuizScore = async (quizId, score) => {
    const key = `quiz_${quizId}`;
    const current = quizScores[key] || 0;
    if (score <= current) return; // only save if new score is higher
    setQuizScores(prev => ({ ...prev, [key]: score }));
    if (user && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_quiz_scores')
          .upsert(
            {
              user_id: user.id,
              quiz_id: String(quizId),
              score: Number(score),
              updated_at: new Date().toISOString()
            },
            { onConflict: 'user_id, quiz_id' }
          );
      } catch (e) {
        console.warn('Quiz score sync warning:', e);
      }
    }
  };

  /* ── Toast Notifications ─────────────────────────────────── */
  const showToast = (message, type = 'gold', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  return (
    <AppContext.Provider value={{
      darkMode,
      toggleDarkMode,
      bookmarks,
      toggleBookmark,
      isBookmarked: id => bookmarks.includes(id),
      progress,
      markAsRead,
      quizScores,
      saveQuizScore,
      toasts,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
