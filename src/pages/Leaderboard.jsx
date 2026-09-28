import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Trophy,
  Medal,
  Crown,
  Award,
  Shield,
  Sparkles,
  RefreshCw,
  Search,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  Loader2,
  Rocket,
  Flame,
  CheckCircle2,
  Landmark
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Leaderboard() {
  const { user } = useAuth();
  const { quizScores, progress } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('total');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [realtimeUsers, setRealtimeUsers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [tableMissing, setTableMissing] = useState(false);

  // Calculate local user stats
  const localTotalScore = useMemo(() => {
    return Object.values(quizScores).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  }, [quizScores]);

  const localMateriCount = useMemo(() => {
    return Object.keys(progress).length;
  }, [progress]);

  const currentUserName = user?.user_metadata?.full_name || (user ? user.email.split('@')[0] : 'Kamu (Tamu)');
  const currentUserAvatar = currentUserName[0]?.toUpperCase() || 'U';

  // Fetch real leaderboard data from Supabase
  const fetchLeaderboardData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch all profiles
      const { data: profiles, error: pErr } = await supabase
        .from('user_profiles')
        .select('id, full_name, created_at, updated_at');

      if (pErr) {
        if (pErr.code === 'PGRST205' || pErr.message?.includes('schema cache') || pErr.message?.includes('not find the table')) {
          setTableMissing(true);
        }
        console.warn('Realtime profiles fetch notice:', pErr.message);
      } else {
        setTableMissing(false);
      }

      // 2. Fetch all quiz scores
      const { data: scores } = await supabase
        .from('user_quiz_scores')
        .select('user_id, quiz_id, score, updated_at');

      // 3. Fetch all progress records
      const { data: progressRecords } = await supabase
        .from('user_progress')
        .select('user_id, materi_id');

      if (profiles && profiles.length > 0) {
        // Map data per user
        const mappedUsers = profiles.map(profile => {
          const userScores = scores ? scores.filter(s => s.user_id === profile.id) : [];
          const userProg = progressRecords ? progressRecords.filter(p => p.user_id === profile.id) : [];

          const scoresObj = { total: 0, mudah: 0, sedang: 0, sulit: 0, 'extra-sulit': 0 };
          userScores.forEach(s => {
            const scoreVal = Number(s.score) || 0;
            scoresObj.total += scoreVal;
            const qId = String(s.quiz_id);
            if (qId.startsWith('bab-')) {
              const babNum = parseInt(qId.replace('bab-', ''), 10);
              if (babNum <= 5) scoresObj.mudah += scoreVal;
              else if (babNum <= 10) scoresObj.sedang += scoreVal;
              else if (babNum <= 15) scoresObj.sulit += scoreVal;
              else scoresObj['extra-sulit'] += scoreVal;
            } else if (scoresObj[qId] !== undefined) {
              scoresObj[qId] += scoreVal;
            }
          });

          // Points calculation: 100 pts per correct quiz + 10 pts per read materi
          const materiCount = userProg.length;
          const points = (scoresObj.total * 100) + (materiCount * 10);

          let role = 'Prajurit Relawan';
          let badge = 'Pejuang Baru';
          let level = 'Kadet';

          if (points >= 1200) {
            role = 'Panglima PETA';
            badge = 'Master Sejarah';
            level = 'Veteran Perang';
          } else if (points >= 800) {
            role = 'Perwira Sukamanah';
            badge = 'Ksatria Tangguh';
            level = 'Shodancho Peleton';
          } else if (points >= 400) {
            role = 'Pejuang Klandestin';
            badge = 'Kader Pergerakan';
            level = 'Budancho Regu';
          } else if (points >= 100) {
            role = 'Laskar Bambu Runcing';
            badge = 'Pejuang Pemula';
            level = 'Prajurit Muda';
          }

          const isMe = user && user.id === profile.id;
          const displayName = isMe
            ? (user?.user_metadata?.full_name || profile.full_name || user.email?.split('@')[0])
            : (profile.full_name || `Pejuang-${profile.id.substring(0, 5)}`);

          return {
            id: profile.id,
            name: displayName,
            avatar: displayName[0]?.toUpperCase() || 'U',
            role,
            badge,
            level,
            materiCount,
            scores: scoresObj,
            points,
            isCurrentUser: isMe,
            joined: profile.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '2026'
          };
        });

        setRealtimeUsers(mappedUsers);
        setLastUpdated(new Date());
      } else if (!pErr) {
        setRealtimeUsers([]);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.warn('Realtime leaderboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial Fetch and Supabase Realtime Subscription Setup
  useEffect(() => {
    fetchLeaderboardData();

    if (!isSupabaseConfigured || !supabase) return;

    // Listen to real-time changes across all users on Supabase
    const channel = supabase
      .channel('realtime-leaderboard-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_quiz_scores' }, () => {
        fetchLeaderboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_progress' }, () => {
        fetchLeaderboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => {
        fetchLeaderboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboardData]);

  const computeLevelScores = (scoresMap) => {
    const res = { total: 0, mudah: 0, sedang: 0, sulit: 0, 'extra-sulit': 0 };
    Object.entries(scoresMap).forEach(([key, val]) => {
      const qId = key.replace('quiz_', '');
      const num = Number(val) || 0;
      res.total += num;
      if (qId.startsWith('bab-')) {
        const b = parseInt(qId.replace('bab-', ''), 10);
        if (b <= 5) res.mudah += num;
        else if (b <= 10) res.sedang += num;
        else if (b <= 15) res.sulit += num;
        else res['extra-sulit'] += num;
      } else if (res[qId] !== undefined) {
        res[qId] += num;
      }
    });
    return res;
  };

  // Combine real database users with guest/offline user if not already in list
  const leaderboardList = useMemo(() => {
    let list = [...realtimeUsers];
    const myLevelScores = computeLevelScores(quizScores);

    // If current user is logged in, ensure their entry is present or updated
    if (user) {
      const idx = list.findIndex(u => u.id === user.id);
      const points = (localTotalScore * 100) + (localMateriCount * 10);

      const meObj = {
        id: user.id,
        name: currentUserName,
        avatar: currentUserAvatar,
        role: points >= 1200 ? 'Panglima PETA' : points >= 600 ? 'Perwira Sukamanah' : 'Pejuang Kemerdekaan',
        badge: points >= 1200 ? 'Master Sejarah' : points >= 600 ? 'Ksatria Tangguh' : 'Pejuang Aktif',
        level: points >= 1200 ? 'Veteran Perang' : 'Prajurit Muda',
        materiCount: Math.max(localMateriCount, idx >= 0 ? list[idx].materiCount : 0),
        scores: {
          total: Math.max(localTotalScore, idx >= 0 ? list[idx].scores.total : 0),
          mudah: Math.max(myLevelScores.mudah, idx >= 0 ? list[idx].scores.mudah : 0),
          sedang: Math.max(myLevelScores.sedang, idx >= 0 ? list[idx].scores.sedang : 0),
          sulit: Math.max(myLevelScores.sulit, idx >= 0 ? list[idx].scores.sulit : 0),
          'extra-sulit': Math.max(myLevelScores['extra-sulit'], idx >= 0 ? list[idx].scores['extra-sulit'] : 0),
        },
        points: Math.max(points, idx >= 0 ? list[idx].points : 0),
        isCurrentUser: true,
        joined: 'Sekarang'
      };

      if (idx >= 0) {
        list[idx] = { ...list[idx], ...meObj };
      } else {
        list.push(meObj);
      }
    } else {
      // Guest user session preview
      const guestPoints = (localTotalScore * 100) + (localMateriCount * 10);
      if (guestPoints > 0 || list.length === 0) {
        const guestObj = {
          id: 'guest-preview',
          name: 'Kamu (Tamu - Belum Masuk)',
          avatar: 'T',
          role: 'Pejuang Tamu',
          badge: 'Sesi Lokal',
          level: 'Kadet Siswa',
          materiCount: localMateriCount,
          scores: myLevelScores,
          points: guestPoints,
          isCurrentUser: true,
          isGuest: true,
          joined: 'Sesi Ini'
        };
        list.push(guestObj);
      }
    }

    // Sort descending based on chosen category or total points
    return list.sort((a, b) => {
      const valA = categoryFilter === 'total' ? a.points : (a.scores[categoryFilter] || 0);
      const valB = categoryFilter === 'total' ? b.points : (b.scores[categoryFilter] || 0);
      return valB - valA;
    });
  }, [realtimeUsers, user, currentUserName, currentUserAvatar, localTotalScore, localMateriCount, quizScores, categoryFilter]);

  // Search filtered list
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return leaderboardList;
    const q = searchQuery.toLowerCase();
    return leaderboardList.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.badge.toLowerCase().includes(q)
    );
  }, [leaderboardList, searchQuery]);

  // Current user's ranking position
  const currentUserRank = useMemo(() => {
    const idx = leaderboardList.findIndex(u => u.isCurrentUser);
    return idx >= 0 ? idx + 1 : 1;
  }, [leaderboardList]);

  // Top podium participants
  const top1 = leaderboardList[0];
  const top2 = leaderboardList[1];
  const top3 = leaderboardList[2];

  const categoryLabels = {
    total: 'Skor Total & Poin',
    mudah: 'Tingkat Mudah',
    sedang: 'Tingkat Sedang',
    sulit: 'Tingkat Sulit',
    'extra-sulit': 'Extra Sulit'
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeader
          label="Live Database Realtime"
          title="Papan Peringkat Pejuang Sejarah"
          subtitle="Data skor dan peringkat seluruh pejuang diperbarui secara live dan realtime dari database Supabase."
        />

        {/* Realtime Status Indicator Bar */}
        <div className="flex items-center justify-between gap-4 mb-6 px-4 py-2.5 rounded-2xl glass-panel border border-gold/20 text-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <span className={`w-2.5 h-2.5 rounded-full ${tableMissing ? 'bg-amber animate-ping' : 'bg-success animate-pulse'}`} />
            <span>Koneksi Realtime Database: <strong className={tableMissing ? 'text-amber font-semibold' : 'text-success font-semibold'}>{tableMissing ? 'Tabel Belum Dibuat di SQL' : 'Aktif (Live)'}</strong></span>
            <span className="text-text-dim">· Total {realtimeUsers.length} Pejuang Terdaftar</span>
          </div>
          <button
            onClick={() => { setLoading(true); fetchLeaderboardData(); }}
            className="flex items-center gap-1.5 text-gold hover:underline cursor-pointer font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data ({lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})</span>
          </button>
        </div>

        {/* Database Tables Setup Reminder Banner */}
        {tableMissing && (
          <div className="mb-8 p-5 rounded-2xl bg-amber/10 border-2 border-amber/40 text-amber text-xs leading-relaxed shadow-lg">
            <div className="flex items-center gap-2 font-bold text-sm text-amber mb-1.5">
              <AlertTriangle className="w-4 h-4 text-amber shrink-0" />
              <span>Tabel Profil Database Belum Dibuat di Supabase</span>
            </div>
            <p className="mb-3 text-app-text">
              User sudah berhasil mendaftar di Supabase Auth, namun tabel <code className="bg-secondary/80 px-1.5 py-0.5 rounded text-gold font-mono">user_profiles</code> belum dieksekusi di database SQL.
            </p>
            <div className="bg-secondary/90 p-3 rounded-xl border border-amber/30 text-[11px] text-text-muted font-sans space-y-1">
              <p className="font-semibold text-gold">Petunjuk Memunculkan Pendaftar Secara Realtime:</p>
              <p>1. Buka Supabase Dashboard &gt; <strong>SQL Editor</strong>.</p>
              <p>2. Salin isi file <code className="text-amber font-mono">server/supabase_schema.sql</code> di proyek ini.</p>
              <p>3. Paste dan klik tombol <strong>Run</strong>. Data seluruh pendaftar akan langsung sinkron dan muncul otomatis di sini secara Live!</p>
            </div>
          </div>
        )}

        {/* Current User Live Card */}
        <div className="mb-12 glass-panel p-6 sm:p-8 rounded-3xl border-2 border-gold/40 bg-gradient-to-r from-gold/15 via-primary/80 to-amber/15 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-gold/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gold via-gold-light to-amber flex items-center justify-center text-primary font-display font-black text-2xl sm:text-3xl shadow-gold">
                  {currentUserAvatar}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary px-2.5 py-0.5 rounded-full border border-gold text-[11px] font-bold text-gold shadow-md">
                  #{currentUserRank}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-app-text">
                    {currentUserName}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 font-medium">
                    {user ? 'Akun Terdaftar' : 'Tamu'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-muted mt-1">
                  Status: <strong className="text-gold">{localTotalScore >= 10 ? 'Panglima PETA' : 'Pejuang Kemerdekaan'}</strong> · Database Status: <span className="text-success font-semibold">Tersinkronisasi Realtime</span>
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full md:w-auto text-center">
              <div className="glass-panel px-4 py-3 rounded-2xl border border-gold/20">
                <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Peringkat</div>
                <div className="font-display text-xl sm:text-2xl font-black text-gold">#{currentUserRank}</div>
              </div>
              <div className="glass-panel px-4 py-3 rounded-2xl border border-gold/20">
                <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Skor Kuis</div>
                <div className="font-display text-xl sm:text-2xl font-black text-app-text">{localTotalScore}</div>
              </div>
              <div className="glass-panel px-4 py-3 rounded-2xl border border-gold/20">
                <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Materi Dibaca</div>
                <div className="font-display text-xl sm:text-2xl font-black text-success">{localMateriCount}/20</div>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <NavLink to="/quiz">
                <Button size="md" variant="primary" className="w-full flex items-center justify-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Main Kuis</span>
                </Button>
              </NavLink>
              <NavLink to="/materi">
                <Button size="md" variant="outline" className="w-full flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Baca Materi</span>
                </Button>
              </NavLink>
            </div>
          </div>
        </div>

        {/* TOP 3 PODIUM SECTION (Dynamic) */}
        {leaderboardList.length > 0 && (
          <div className="mb-14">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-gold bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20 inline-flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-gold" />
                <span>Posisi Teratas Saat Ini</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-end">

              {/* 2nd Place (Silver) */}
              {top2 ? (
                <div className="order-2 md:order-1 glass-panel p-6 rounded-3xl border border-slate-400/40 bg-gradient-to-b from-slate-400/10 to-primary text-center hover:-translate-y-2 transition-transform duration-300 shadow-xl flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-400/20 flex items-center justify-center text-slate-300 mb-2">
                    <Medal className="w-6 h-6" />
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-primary font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-slate-300">
                    {top2.avatar}
                  </div>
                  <h4 className="font-display font-bold text-app-text text-lg truncate mb-0.5 w-full">{top2.name}</h4>
                  <p className="text-xs text-text-muted mb-3">{top2.role}</p>
                  <div className="bg-slate-500/20 py-2 px-4 rounded-xl border border-slate-400/30 text-sm font-display font-black text-slate-300 w-full">
                    {categoryFilter === 'total' ? `${top2.points.toLocaleString()} Poin` : `Skor: ${top2.scores[categoryFilter] || 0}`}
                  </div>
                  <div className="mt-3 text-[11px] text-text-dim flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{top2.materiCount} Materi Selesai</span>
                  </div>
                </div>
              ) : (
                <div className="order-2 md:order-1 glass-panel p-6 rounded-3xl border border-dashed border-slate-400/20 text-center opacity-60 flex flex-col items-center">
                  <Medal className="w-6 h-6 text-slate-400 mb-2" />
                  <div className="w-14 h-14 rounded-full bg-surface border border-white/10 flex items-center justify-center mx-auto mb-2 text-text-dim text-lg">?</div>
                  <p className="text-xs text-text-muted">Menunggu pejuang ke-2 mendaftar</p>
                </div>
              )}

              {/* 1st Place (Gold Champion) */}
              {top1 && (
                <div className="order-1 md:order-2 glass-panel p-8 rounded-3xl border-2 border-gold bg-gradient-to-b from-gold/20 via-primary to-amber/10 text-center -translate-y-4 hover:-translate-y-6 transition-transform duration-300 shadow-2xl relative flex flex-col items-center">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-gold animate-bounce">
                    <Crown className="w-8 h-8 fill-gold text-gold" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold mb-2 mt-2">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold via-gold-light to-amber text-primary font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-gold border-4 border-gold">
                    {top1.avatar}
                  </div>
                  <h4 className="font-display font-bold text-gold text-xl truncate mb-0.5 w-full">{top1.name}</h4>
                  <p className="text-xs text-gold-light/80 mb-3">{top1.role} · {top1.badge}</p>
                  <div className="bg-gold/25 py-2.5 px-4 rounded-xl border border-gold/50 text-base font-display font-black text-gold shadow-sm w-full">
                    {categoryFilter === 'total' ? `${top1.points.toLocaleString()} Poin Juara` : `Skor: ${top1.scores[categoryFilter] || 0}`}
                  </div>
                  <div className="mt-3 text-xs text-text-muted flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-gold" />
                    <span>{top1.materiCount} Materi Selesai</span>
                  </div>
                </div>
              )}

              {/* 3rd Place (Bronze) */}
              {top3 ? (
                <div className="order-3 md:order-3 glass-panel p-6 rounded-3xl border border-amber-700/40 bg-gradient-to-b from-amber-700/10 to-primary text-center hover:-translate-y-2 transition-transform duration-300 shadow-xl flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-700/20 flex items-center justify-center text-amber-500 mb-2">
                    <Medal className="w-6 h-6" />
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-amber-600">
                    {top3.avatar}
                  </div>
                  <h4 className="font-display font-bold text-app-text text-lg truncate mb-0.5 w-full">{top3.name}</h4>
                  <p className="text-xs text-text-muted mb-3">{top3.role}</p>
                  <div className="bg-amber-800/20 py-2 px-4 rounded-xl border border-amber-700/30 text-sm font-display font-black text-amber-500 w-full">
                    {categoryFilter === 'total' ? `${top3.points.toLocaleString()} Poin` : `Skor: ${top3.scores[categoryFilter] || 0}`}
                  </div>
                  <div className="mt-3 text-[11px] text-text-dim flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{top3.materiCount} Materi Selesai</span>
                  </div>
                </div>
              ) : (
                <div className="order-3 md:order-3 glass-panel p-6 rounded-3xl border border-dashed border-amber-700/20 text-center opacity-60 flex flex-col items-center">
                  <Medal className="w-6 h-6 text-amber-700 mb-2" />
                  <div className="w-14 h-14 rounded-full bg-surface border border-white/10 flex items-center justify-center mx-auto mb-2 text-text-dim text-lg">?</div>
                  <p className="text-xs text-text-muted">Menunggu pejuang ke-3 mendaftar</p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* CONTROLS: Category Tabs & Search Bar */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-gold/20 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold font-display transition-all cursor-pointer ${
                  categoryFilter === key
                    ? 'bg-gradient-to-r from-gold to-amber text-primary shadow-md font-bold'
                    : 'bg-surface/60 text-text-muted hover:text-app-text hover:bg-surface border border-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              placeholder="Cari nama pejuang..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/70 border border-gold/20 rounded-xl pl-9 pr-4 py-2 text-xs text-app-text focus:outline-none focus:border-gold placeholder:text-text-dim"
            />
          </div>
        </div>

        {/* FULL REALTIME LEADERBOARD TABLE */}
        <div className="glass-panel rounded-3xl border border-gold/20 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/80 border-b border-gold/15 text-xs text-gold uppercase tracking-wider font-display">
                <tr>
                  <th className="py-4 px-6 text-center w-16">Rank</th>
                  <th className="py-4 px-6">Pejuang</th>
                  <th className="py-4 px-6 hidden sm:table-cell">Gelar / Role</th>
                  <th className="py-4 px-6 text-center hidden md:table-cell">Materi Selesai</th>
                  <th className="py-4 px-6 text-right font-bold">
                    {categoryFilter === 'total' ? 'Total Poin' : 'Skor Kategori'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gold mb-2" />
                      Memuat data realtime dari database...
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-muted">
                      <Landmark className="w-8 h-8 text-gold/40 mx-auto mb-2" />
                      Belum ada pejuang terdaftar. Jadilah yang pertama dengan mendaftar akun!
                    </td>
                  </tr>
                ) : (
                  filteredList.map((player, idx) => {
                    const isSelf = player.isCurrentUser;
                    const rankNum = idx + 1;

                    return (
                      <tr
                        key={player.id}
                        className={`transition-colors ${
                          isSelf
                            ? 'bg-gold/15 border-l-4 border-l-gold font-semibold'
                            : 'hover:bg-surface/40'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-6 text-center">
                          {rankNum === 1 && <Trophy className="w-5 h-5 text-gold inline" />}
                          {rankNum === 2 && <Medal className="w-5 h-5 text-slate-300 inline" />}
                          {rankNum === 3 && <Medal className="w-5 h-5 text-amber-600 inline" />}
                          {rankNum > 3 && (
                            <span className="font-display font-bold text-text-muted">
                              #{rankNum}
                            </span>
                          )}
                        </td>

                        {/* Player Name & Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-primary shadow-sm ${
                              rankNum === 1 ? 'bg-gradient-to-br from-gold to-amber' :
                              rankNum === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                              rankNum === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                              'bg-surface border border-gold/30 text-gold'
                            }`}>
                              {player.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-display font-bold ${isSelf ? 'text-gold' : 'text-app-text'}`}>
                                  {player.name}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] bg-gold/20 text-gold border border-gold/30 px-2 py-0.5 rounded-full">
                                    Kamu
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                                <Sparkles className="w-3 h-3 text-gold" />
                                <span>{player.badge}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role / Level */}
                        <td className="py-4 px-6 hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary/80 border border-gold/15 text-text-muted">
                            <Shield className="w-3.5 h-3.5 text-gold" />
                            <span>{player.role}</span>
                          </span>
                        </td>

                        {/* Materi Count */}
                        <td className="py-4 px-6 text-center hidden md:table-cell">
                          <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-lg border border-success/20 inline-flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{player.materiCount}/20 Selesai</span>
                          </span>
                        </td>

                        {/* Score */}
                        <td className="py-4 px-6 text-right">
                          <div className="font-display font-black text-base text-gold">
                            {categoryFilter === 'total'
                              ? `${player.points.toLocaleString()} Pts`
                              : `${player.scores[categoryFilter] || 0} Soal Benar`
                            }
                          </div>
                          {categoryFilter === 'total' && (
                            <div className="text-[11px] text-text-muted">
                              {player.scores.total} Kuis Benar
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Publish Ready Notification Card */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto p-8 border border-gold/30 bg-gradient-to-r from-gold/10 via-primary/50 to-amber/10">
            <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-3">
              <Rocket className="w-7 h-7" />
            </div>
            <h3 className="font-display text-xl font-bold text-gold mb-2">
              Sistem Peringkat Siap untuk Publish!
            </h3>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              Papan peringkat ini terhubung secara <strong>Realtime ke Supabase</strong>. Ketika aplikasi Anda dipublikasikan dan user baru mendaftar atau menyelesaikan kuis, skor dan peringkat mereka akan langsung muncul seketika tanpa perlu me-refresh halaman!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <NavLink to="/quiz">
                <Button variant="primary" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Coba Kerjakan Kuis</span>
                </Button>
              </NavLink>
              <NavLink to="/materi">
                <Button variant="outline" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Baca 20 Bab Materi</span>
                </Button>
              </NavLink>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
