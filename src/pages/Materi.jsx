import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  Zap,
  Sword,
  Shield,
  BarChart3,
  Flag,
  Bookmark,
  Share2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Pin,
  Key,
  Check,
  Search,
  Folder,
  Clock,
  Sparkles,
  BookOpen,
  Landmark
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { highlightText } from '../lib/utils';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import SectionHeader from '../components/ui/SectionHeader';

const KATEGORI = [
  { id: 1, nama: 'Latar Belakang & Propaganda', icon: FileText, warna: '#D4A017' },
  { id: 2, nama: 'Penyebab & Strategi Perlawanan', icon: Zap, warna: '#FF6B35' },
  { id: 3, nama: 'Perlawanan Bersenjata Daerah', icon: Sword, warna: '#e85a5a' },
  { id: 4, nama: 'PETA & Gerakan Bawah Tanah', icon: Shield, warna: '#2196F3' },
  { id: 5, nama: 'Dampak & Analisis Sejarah', icon: BarChart3, warna: '#9C27B0' },
  { id: 6, nama: 'Nilai Juang & Kesimpulan', icon: Flag, warna: '#4CAF50' },
];

export default function Materi() {
  const { progress, markAsRead, toggleBookmark, isBookmarked, showToast } = useApp();

  const [data, setData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [currentId, setCurrentId] = useState(1);
  const [activeCategory, setActiveCategory] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageError, setImageError] = useState(false);

  // Timeline state
  const [timelineFilter, setTimelineFilter] = useState('semua');
  const [selectedTimeline, setSelectedTimeline] = useState(null);

  // Fetch data
  useEffect(() => {
    fetch('/data/materi.json')
      .then(res => res.json())
      .then(d => {
        setData(d);
        if (d.length > 0) setCurrentId(d[0].id);
      })
      .catch(err => console.error(err));

    fetch('/data/timeline.json')
      .then(res => res.json())
      .then(t => setTimelineData(t.sort((a, b) => a.tahunSort - b.tahunSort)))
      .catch(err => console.error(err));
  }, []);

  // Active item
  const currentMateri = useMemo(() => {
    return data.find(m => m.id === currentId) || data[0];
  }, [data, currentId]);

  // Mark active materi as read
  useEffect(() => {
    if (currentMateri) {
      markAsRead(currentMateri.id);
      setImageError(false);
    }
  }, [currentMateri, markAsRead]);

  // Filtered list for sidebar
  const filteredData = useMemo(() => {
    let result = [...data];
    if (activeCategory !== 'semua') {
      result = result.filter(m => m.kategoriId === Number(activeCategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        m =>
          m.judul.toLowerCase().includes(q) ||
          m.ringkasan.toLowerCase().includes(q) ||
          m.periode.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, activeCategory, searchQuery]);

  // Progress calculation
  const totalRead = Object.keys(progress).length;
  const readPct = data.length ? Math.min(Math.round((totalRead / data.length) * 100), 100) : 0;

  // Navigation handlers
  const currentIndexInFiltered = filteredData.findIndex(m => m.id === currentId);
  const prevMateri = filteredData[currentIndexInFiltered - 1];
  const nextMateri = filteredData[currentIndexInFiltered + 1];

  const handleShare = () => {
    if (navigator.share && currentMateri) {
      navigator.share({
        title: `SEJARAH.ID — ${currentMateri.judul}`,
        text: `Belajar sejarah Indonesia: ${currentMateri.judul}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link disalin ke clipboard!', 'gold');
    }
  };

  // Filtered timeline
  const filteredTimeline = useMemo(() => {
    if (timelineFilter === 'semua') return timelineData;
    return timelineData.filter(item => item.era.includes(timelineFilter));
  }, [timelineData, timelineFilter]);

  return (
    <div className="pt-24 min-h-screen">
      {/* MATERI MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-140px)]">

          {/* SIDEBAR (3 columns on LG) */}
          <aside className="lg:col-span-4 xl:col-span-3 glass-panel p-6 rounded-2xl h-fit lg:sticky lg:top-24 border border-gold/20 flex flex-col gap-6">

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                placeholder="Cari materi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/70 border border-gold/20 rounded-xl pl-9 pr-4 py-2 text-sm text-app-text focus:outline-none focus:border-gold placeholder:text-text-dim"
              />
            </div>

            {/* Kategori Filters */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveCategory('semua')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeCategory === 'semua'
                    ? 'bg-gold/20 text-gold border border-gold/30'
                    : 'text-text-muted hover:bg-surface/50 hover:text-app-text'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-gold" />
                  <span>Semua Materi</span>
                </span>
                <Badge variant="gold">{data.length}</Badge>
              </button>

              {KATEGORI.map(cat => {
                const count = data.filter(m => m.kategoriId === cat.id).length;
                if (!count) return null;
                const IconComp = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeCategory === cat.id
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'text-text-muted hover:bg-surface/50 hover:text-app-text'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <IconComp className="w-4 h-4 shrink-0 text-gold" />
                      <span className="truncate">{cat.nama}</span>
                    </span>
                    <Badge variant="gold">{count}</Badge>
                  </button>
                );
              })}
            </div>

            {/* List Materi */}
            <div className="border-t border-gold/15 pt-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim mb-2">
                Daftar Materi ({filteredData.length})
              </span>

              {filteredData.length === 0 ? (
                <div className="text-center py-6 text-text-muted text-xs">
                  <Search className="w-6 h-6 mx-auto mb-1 text-text-dim" />
                  Materi tidak ditemukan
                </div>
              ) : (
                filteredData.map(m => {
                  const kat = KATEGORI.find(k => k.id === m.kategoriId);
                  const IconComp = kat?.icon || BookOpen;
                  const isRead = progress[m.id];
                  const isBookm = isBookmarked(m.id);
                  const active = m.id === currentId;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setCurrentId(m.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 ${
                        active
                          ? 'bg-gold/15 text-gold border border-gold/30 shadow-sm'
                          : 'hover:bg-surface/50 text-app-text'
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full justify-between">
                        <span className="text-sm font-semibold truncate flex-1">
                          {highlightText(m.judul, searchQuery)}
                        </span>
                        <div className="flex items-center gap-1 text-xs">
                          {isBookm && <Bookmark className="w-3.5 h-3.5 text-gold fill-gold" title="Tersimpan" />}
                          {isRead && <Check className="w-3.5 h-3.5 text-success" title="Sudah Dibaca" />}
                        </div>
                      </div>
                      <div className="text-[11px] text-text-muted flex items-center gap-1.5">
                        <IconComp className="w-3 h-3 text-gold" />
                        <span>{m.tahun}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* MAIN READER (8 columns on LG) */}
          <main className="lg:col-span-8 xl:col-span-9 glass-panel p-6 sm:p-10 rounded-2xl border border-gold/20 flex flex-col justify-between">
            {currentMateri ? (
              <div>
                {/* Learning Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-text-muted mb-1.5 font-medium">
                    <span>Progress Belajar</span>
                    <span>{totalRead}/{data.length} Materi ({readPct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-gold to-amber transition-all duration-500 rounded-full"
                      style={{ width: `${readPct}%` }}
                    />
                  </div>
                </div>

                {/* Hero Image / Banner */}
                <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden mb-6 border border-gold/20 bg-secondary flex items-center justify-center">
                  {!imageError ? (
                    <img
                      src={currentMateri.gambar}
                      alt={currentMateri.gambarAlt || currentMateri.judul}
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gold">
                      <Landmark className="w-12 h-12 text-gold" />
                      <span className="text-xs text-text-muted font-display uppercase tracking-widest">
                        {currentMateri.periode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Metadata Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="gold">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{currentMateri.periode}</span>
                    </span>
                  </Badge>
                  <Badge variant="info">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{currentMateri.tahun}</span>
                    </span>
                  </Badge>
                  <Badge variant="amber">
                    <span className="flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      <span>{currentMateri.sumber}</span>
                    </span>
                  </Badge>
                </div>

                {/* Title & Summary */}
                <h1 className="font-display text-2xl sm:text-4xl font-bold text-app-text mb-3 leading-tight">
                  {currentMateri.judul}
                </h1>
                <p className="text-base sm:text-lg text-text-muted italic mb-6 leading-relaxed border-l-2 border-gold pl-4 py-1">
                  {currentMateri.ringkasan}
                </p>

                <div className="h-px bg-gold/15 w-full my-6" />

                {/* Content Paragraphs */}
                <div className="space-y-4 text-app-text leading-relaxed text-sm sm:text-base">
                  {currentMateri.konten.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* Key Points Card */}
                {currentMateri.poinPenting && (
                  <div className="mt-8 p-6 rounded-2xl bg-gold/10 border border-gold/30">
                    <h4 className="font-display font-bold text-gold text-base mb-3 flex items-center gap-2">
                      <Key className="w-4 h-4 text-gold" />
                      <span>Poin Penting</span>
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-app-text">
                      {currentMateri.poinPenting.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Toolbar actions */}
                <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-gold/15">
                  <Button
                    variant={isBookmarked(currentMateri.id) ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => toggleBookmark(currentMateri.id, currentMateri.judul)}
                    className="flex items-center gap-1.5"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>{isBookmarked(currentMateri.id) ? 'Tersimpan' : 'Simpan Bookmark'}</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleShare} className="flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan</span>
                  </Button>
                  <NavLink to="/quiz">
                    <Button variant="outline" size="sm" className="border-gold/40 text-gold hover:bg-gold/10 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>Kuis Bab Ini</span>
                    </Button>
                  </NavLink>
                </div>

                {/* Navigation Next/Prev */}
                <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gold/15">
                  {prevMateri ? (
                    <Button variant="outline" size="sm" onClick={() => setCurrentId(prevMateri.id)} className="flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" />
                      <span>{prevMateri.judul.substring(0, 20)}...</span>
                    </Button>
                  ) : <div />}

                  {nextMateri ? (
                    <Button variant="primary" size="sm" onClick={() => setCurrentId(nextMateri.id)} className="flex items-center gap-1">
                      <span>{nextMateri.judul.substring(0, 20)}...</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <NavLink to="/quiz">
                      <Button variant="primary" size="sm" className="flex items-center gap-1">
                        <HelpCircle className="w-4 h-4" />
                        <span>Coba Kuis</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </NavLink>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-text-muted">Pilih materi untuk membaca</div>
            )}
          </main>
        </div>
      </div>

      {/* TIMELINE SECTION AT BOTTOM */}
      <section className="py-16 bg-primary-light/60 border-t border-gold/15 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Timeline Interaktif"
            title="Kronologi Sejarah Indonesia"
            subtitle="Klik setiap peristiwa untuk membaca detail peristiwa lengkap"
          />

          {/* Era Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {['semua', ...new Set(timelineData.map(t => t.era))].map(era => (
              <Button
                key={era}
                size="sm"
                variant={timelineFilter === era ? 'primary' : 'ghost'}
                onClick={() => setTimelineFilter(era)}
              >
                {era === 'semua' ? 'Semua Peristiwa' : era}
              </Button>
            ))}
          </div>

          {/* Timeline Vertical Layout */}
          <div className="relative max-w-4xl mx-auto py-8">
            {/* Center Vertical Line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gold/30 hidden md:block" />

            <div className="space-y-8">
              {filteredTimeline.map((item, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col md:flex-row items-center gap-4 ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Content Card */}
                    <div className="w-full md:w-1/2">
                      <Card
                        onClick={() => setSelectedTimeline(item)}
                        className="cursor-pointer hover:border-gold/60 transition-all hover:scale-105"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display font-bold text-sm" style={{ color: item.warna }}>
                            {item.tahun}
                          </span>
                          <Badge variant="gold">{item.era}</Badge>
                        </div>
                        <h4 className="font-display font-bold text-app-text text-base mb-1">
                          {item.judul}
                        </h4>
                        <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                          {item.deskripsi}
                        </p>
                      </Card>
                    </div>

                    {/* Dot Indicator */}
                    <div
                      onClick={() => setSelectedTimeline(item)}
                      className="w-10 h-10 rounded-full border-2 border-gold bg-primary flex items-center justify-center text-sm z-10 cursor-pointer shadow-gold hover:scale-125 transition-transform text-gold"
                      style={{ borderColor: item.warna }}
                      title={item.judul}
                    >
                      <Clock className="w-4 h-4" />
                    </div>

                    {/* Spacer for two-column desktop balance */}
                    <div className="hidden md:block w-1/2" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE DETAIL MODAL */}
      <Modal
        isOpen={!!selectedTimeline}
        onClose={() => setSelectedTimeline(null)}
        title="Detail Peristiwa Sejarah"
      >
        {selectedTimeline && (
          <div className="flex flex-col gap-4 text-center sm:text-left">
            <div className="text-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-2">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <Badge variant="gold">{selectedTimeline.era}</Badge>
              </div>
            </div>

            <h3 className="font-display font-bold text-2xl text-gold">
              {selectedTimeline.judul}
            </h3>
            <p className="text-xs text-text-muted font-mono flex items-center gap-1.5 justify-center sm:justify-start">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              <span>{selectedTimeline.tahun}</span>
            </p>

            <p className="text-sm text-text-muted italic border-l-2 border-gold pl-3 py-1 text-left">
              {selectedTimeline.deskripsi}
            </p>

            <p className="text-sm text-app-text leading-relaxed text-left">
              {selectedTimeline.detail}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
