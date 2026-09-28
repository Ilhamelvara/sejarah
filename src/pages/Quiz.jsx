import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Trophy,
  Medal,
  Award,
  Star,
  RefreshCw,
  BookOpen,
  ChevronRight,
  Sparkles,
  Layers,
  Flame,
  Shield,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { shuffle } from '../lib/utils';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const LEVEL_STYLES = {
  'Mudah': {
    gradient: 'from-emerald-500/20 to-green-600/10',
    border: 'border-emerald-500/40',
    hoverBorder: 'hover:border-emerald-400',
    iconBg: 'bg-emerald-500/20',
    textColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    ringColor: '#4CAF50',
    stars: 1,
  },
  'Sedang': {
    gradient: 'from-amber-500/20 to-yellow-600/10',
    border: 'border-amber-500/40',
    hoverBorder: 'hover:border-amber-400',
    iconBg: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    ringColor: '#FF9800',
    stars: 2,
  },
  'Sulit': {
    gradient: 'from-red-500/20 to-rose-600/10',
    border: 'border-red-500/40',
    hoverBorder: 'hover:border-red-400',
    iconBg: 'bg-red-500/20',
    textColor: 'text-red-400',
    badgeBg: 'bg-red-500/15 border-red-500/30 text-red-400',
    ringColor: '#E53935',
    stars: 3,
  },
  'Extra Sulit': {
    gradient: 'from-purple-500/20 to-violet-600/10',
    border: 'border-purple-500/40',
    hoverBorder: 'hover:border-purple-400',
    iconBg: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    ringColor: '#9C27B0',
    stars: 4,
  },
};

function StarRating({ count, color }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? 'fill-current' : 'opacity-20'}`}
          style={i < count ? { color } : {}}
        />
      ))}
    </span>
  );
}

export default function Quiz() {
  const { quizScores, saveQuizScore } = useApp();

  const [categoriesData, setCategoriesData] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizState, setQuizState] = useState('category'); // 'category' | 'question' | 'result'
  const [answeredCorrectly, setAnsweredCorrectly] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState('Semua');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/quiz.json`)
      .then(res => res.json())
      .then(data => setCategoriesData(data))
      .catch(() => {});
  }, []);

  // Filter by difficulty
  const filteredCategories = useMemo(() => {
    if (difficultyFilter === 'Semua') return categoriesData;
    return categoriesData.filter(c => c.tingkat === difficultyFilter);
  }, [categoriesData, difficultyFilter]);

  // Total stats across all levels
  const totalSoal = useMemo(() => categoriesData.reduce((sum, c) => sum + c.soal.length, 0), [categoriesData]);
  const totalBest = useMemo(() => categoriesData.reduce((sum, c) => sum + (quizScores[`quiz_${c.id}`] || 0), 0), [categoriesData, quizScores]);
  const completedCount = useMemo(() => categoriesData.filter(c => quizScores[`quiz_${c.id}`] !== undefined).length, [categoriesData, quizScores]);

  const handleStartKuis = (cat) => {
    setActiveCategory(cat);
    const randomized = shuffle([...cat.soal]);
    setSoalList(randomized);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setAnsweredCorrectly([]);
    setQuizState('question');
  };

  const handleSelectAnswer = (optionKey) => {
    if (selectedOption) return;
    setSelectedOption(optionKey);

    const currentSoal = soalList[currentIndex];
    const isCorrect = optionKey === currentSoal.jawabanBenar;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setAnsweredCorrectly(prev => [...prev, isCorrect]);
  };

  const handleNextQuestion = () => {
    if (currentIndex < soalList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Final score includes the current question if correct
      const finalScore = score;
      if (activeCategory) {
        saveQuizScore(activeCategory.id, finalScore);
      }
      setQuizState('result');
    }
  };

  const currentSoal = soalList[currentIndex];
  const progressPct = soalList.length ? Math.round(((currentIndex + (selectedOption ? 1 : 0)) / soalList.length) * 100) : 0;

  // Grade evaluation
  const resultPercentage = soalList.length ? Math.round((score / soalList.length) * 100) : 0;
  const gradeInfo = useMemo(() => {
    if (resultPercentage >= 90) return { label: 'Sempurna!', color: '#FFD700', message: 'Luar biasa! Kamu pantas menjadi Panglima PETA!' };
    if (resultPercentage >= 75) return { label: 'Sangat Baik', color: '#4caf82', message: 'Hebat! Tinggal sedikit lagi menuju skor sempurna!' };
    if (resultPercentage >= 60) return { label: 'Baik', color: '#5a9ae8', message: 'Bagus! Baca lagi materinya untuk hasil lebih baik.' };
    if (resultPercentage >= 40) return { label: 'Cukup', color: '#e8935a', message: 'Jangan menyerah! Pelajari ulang materinya.' };
    return { label: 'Perlu Belajar', color: '#e85a5a', message: 'Yuk baca materinya dulu sebelum mencoba lagi!' };
  }, [resultPercentage]);

  const levelStyle = activeCategory ? (LEVEL_STYLES[activeCategory.tingkat] || LEVEL_STYLES['Mudah']) : null;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ═══════════════ 1. CATEGORY SELECTION VIEW ═══════════════ */}
        {quizState === 'category' && (
          <div>
            <SectionHeader
              label="Kuis Interaktif — 20 Bab Materi"
              title="Pilih Kuis Sesuai Babnya"
              subtitle="20 paket kuis berbeda dari setiap bab materi — pilih tingkat kesulitan dan uji pemahaman setiap bab!"
            />

            {/* Total Progress Overview */}
            <div className="glass-panel p-5 rounded-2xl border border-gold/20 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="font-display text-2xl font-black text-gold">{completedCount}/20</div>
                <div className="text-xs text-text-muted">Bab Diselesaikan</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl font-black text-success">{totalBest}</div>
                <div className="text-xs text-text-muted">Total Soal Benar</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl font-black text-app-text">{totalSoal}</div>
                <div className="text-xs text-text-muted">Total Soal Tersedia</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl font-black text-amber-400">{totalSoal > 0 ? Math.round((totalBest / totalSoal) * 100) : 0}%</div>
                <div className="text-xs text-text-muted">Akurasi Keseluruhan</div>
              </div>
            </div>

            {/* Difficulty Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {['Semua', 'Mudah', 'Sedang', 'Sulit', 'Extra Sulit'].map(level => {
                return (
                  <button
                    key={level}
                    onClick={() => setDifficultyFilter(level)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      difficultyFilter === level
                        ? 'bg-gradient-to-r from-gold to-amber text-primary shadow-md'
                        : 'glass-panel border border-white/10 text-text-muted hover:text-app-text hover:border-gold/30'
                    }`}
                  >
                    <span>{level}</span>
                    {level !== 'Semua' && <span className="opacity-75">({categoriesData.filter(c => c.tingkat === level).length})</span>}
                  </button>
                );
              })}
            </div>

            {/* Level Cards Grid — 20 Babs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {filteredCategories.map((cat) => {
                const style = LEVEL_STYLES[cat.tingkat] || LEVEL_STYLES['Mudah'];
                const bestScore = quizScores[`quiz_${cat.id}`] || 0;
                const completed = bestScore > 0;
                const perfect = bestScore >= cat.soal.length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleStartKuis(cat)}
                    className={`group text-left w-full glass-panel rounded-2xl border ${style.border} ${style.hoverBorder} bg-gradient-to-br ${style.gradient} p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer relative overflow-hidden`}
                  >
                    {/* Difficulty badge top-right */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      {perfect && (
                        <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full border border-gold/30 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-gold" />
                          <span>Sempurna</span>
                        </span>
                      )}
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${style.badgeBg}`}>
                        {cat.tingkat}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl ${style.iconBg} flex items-center justify-center text-gold shrink-0 group-hover:scale-110 transition-transform`}>
                        <HelpCircle className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-display font-bold text-lg ${style.textColor} mb-1 truncate`}>
                          {cat.kategori}
                        </h3>
                        <p className="text-xs text-text-muted leading-relaxed line-clamp-2 mb-3">
                          {cat.deskripsi}
                        </p>

                        <div className="flex items-center justify-between gap-3">
                          {/* Star rating for difficulty */}
                          <StarRating count={style.stars} color={cat.warna} />

                          {/* Score & count */}
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-text-muted">
                              {cat.soal.length} Soal
                            </span>
                            {completed && (
                              <span className={`font-bold ${style.textColor}`}>
                                Skor: {bestScore}/{cat.soal.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Score History */}
            <Card className="p-6 border border-gold/20">
              <h3 className="font-display text-sm font-bold text-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-gold" />
                <span>Skor Terbaik Kamu</span>
              </h3>
              {Object.keys(quizScores).length === 0 ? (
                <p className="text-sm text-text-muted">Belum ada riwayat kuis. Pilih tingkatan dan mulai bermain!</p>
              ) : (
                <div className="divide-y divide-white/5 text-sm">
                  {categoriesData.map(cat => {
                    const key = `quiz_${cat.id}`;
                    const val = quizScores[key];
                    if (val === undefined) return null;
                    const pct = Math.round((val / cat.soal.length) * 100);
                    return (
                      <div key={key} className="py-3 flex items-center justify-between gap-3">
                        <span className="text-app-text font-medium flex items-center gap-2 truncate">
                          <HelpCircle className="w-4 h-4 text-gold shrink-0" />
                          <span className="truncate">{cat.kategori}</span>
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.warna }} />
                          </div>
                          <Badge variant="gold">{val}/{cat.soal.length}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ═══════════════ 2. QUESTION ACTIVE VIEW ═══════════════ */}
        {quizState === 'question' && currentSoal && levelStyle && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold ${levelStyle.badgeBg}`}>
                  {activeCategory.tingkat}
                </span>
                <span className="text-sm text-text-muted font-medium">
                  Soal {currentIndex + 1} / {soalList.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="gold">Skor: {score}</Badge>
                <Button size="sm" variant="ghost" onClick={() => setQuizState('category')} className="flex items-center gap-1">
                  <X className="w-4 h-4" />
                  <span>Keluar</span>
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${activeCategory.warna}99, ${activeCategory.warna})`,
                }}
              />
            </div>

            {/* Mini answer trail */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {soalList.map((_, i) => {
                let dotClass = 'w-3 h-3 rounded-full border transition-all ';
                if (i < answeredCorrectly.length) {
                  dotClass += answeredCorrectly[i] ? 'bg-success border-success/50' : 'bg-danger border-danger/50';
                } else if (i === currentIndex) {
                  dotClass += `border-2 animate-pulse`;
                  dotClass += ` border-[${activeCategory.warna}]`;
                } else {
                  dotClass += 'bg-secondary/60 border-white/10';
                }
                return <span key={i} className={dotClass} style={i === currentIndex ? { borderColor: activeCategory.warna } : {}} />;
              })}
            </div>

            {/* Question Card */}
            <Card className={`p-8 border ${levelStyle.border} bg-gradient-to-br ${levelStyle.gradient}`}>
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-gold" />
                <span className={`text-xs font-bold uppercase tracking-wider ${levelStyle.textColor}`}>
                  {activeCategory.tingkat} — Pertanyaan #{currentIndex + 1}
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-app-text leading-relaxed">
                {currentSoal.pertanyaan}
              </h2>
            </Card>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {['A', 'B', 'C', 'D'].map((letter) => {
                const text = currentSoal.pilihan[letter];
                const isSelected = selectedOption === letter;
                const isCorrectAnswer = letter === currentSoal.jawabanBenar;

                let optionStyle = 'border-white/10 hover:border-gold/40 hover:bg-surface/50 text-app-text';
                if (selectedOption) {
                  if (isCorrectAnswer) {
                    optionStyle = 'border-success bg-success/15 text-success shadow-sm shadow-success/10';
                  } else if (isSelected) {
                    optionStyle = 'border-danger bg-danger/15 text-danger';
                  } else {
                    optionStyle = 'border-white/5 opacity-40 text-text-muted';
                  }
                }

                return (
                  <button
                    key={letter}
                    onClick={() => handleSelectAnswer(letter)}
                    disabled={!!selectedOption}
                    className={`w-full text-left p-4 rounded-xl border glass-panel transition-all flex items-center gap-4 text-sm sm:text-base font-medium cursor-pointer ${optionStyle}`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-bold text-gold text-sm border border-gold/20 shrink-0">
                      {letter}
                    </span>
                    <span className="flex-1">{text}</span>
                    {selectedOption && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
                    {selectedOption && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-danger shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation Box (Pembahasan) */}
            {selectedOption && (
              <div
                className={`p-6 rounded-2xl border animate-fade-in ${
                  selectedOption === currentSoal.jawabanBenar
                    ? 'bg-success/10 border-success/30 text-app-text'
                    : 'bg-danger/10 border-danger/30 text-app-text'
                }`}
              >
                <div
                  className={`font-display font-bold text-sm mb-2 flex items-center gap-1.5 ${
                    selectedOption === currentSoal.jawabanBenar ? 'text-success' : 'text-danger'
                  }`}
                >
                  {selectedOption === currentSoal.jawabanBenar ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Jawaban Benar!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Jawaban Salah</span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-text-muted">
                  <strong className="text-app-text">Jawaban benar: {currentSoal.jawabanBenar}. {currentSoal.pilihan[currentSoal.jawabanBenar]}</strong>
                  <br /><br />
                  {currentSoal.pembahasan}
                </p>
              </div>
            )}

            {/* Next Button */}
            {selectedOption && (
              <div className="text-right">
                <Button size="lg" variant="primary" onClick={handleNextQuestion} className="flex items-center gap-2 ml-auto">
                  <span>{currentIndex < soalList.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil'}</span>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ 3. RESULT VIEW ═══════════════ */}
        {quizState === 'result' && activeCategory && levelStyle && (
          <Card className={`text-center p-8 sm:p-12 border ${levelStyle.border} max-w-lg mx-auto bg-gradient-to-b ${levelStyle.gradient}`}>
            {/* Level badge */}
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-bold mb-4 ${levelStyle.badgeBg}`}>
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{activeCategory.kategori}</span>
            </span>

            {/* Score Ring */}
            <div
              className="w-36 h-36 rounded-full border-[5px] mx-auto flex flex-col items-center justify-center mb-6 shadow-2xl transition-all"
              style={{ borderColor: gradeInfo.color }}
            >
              <span className="font-display text-4xl font-black text-app-text">{score}</span>
              <span className="text-xs text-text-muted font-medium">/ {soalList.length} Soal</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1" style={{ color: gradeInfo.color }}>
              {gradeInfo.label}
            </h2>
            <p className="text-gold font-bold text-xl mb-1">{resultPercentage}%</p>
            <p className="text-text-muted text-sm mb-3">{gradeInfo.message}</p>

            {/* Answer trail summary */}
            <div className="flex items-center justify-center gap-1.5 mb-6 flex-wrap">
              {answeredCorrectly.map((correct, i) => (
                <span
                  key={i}
                  className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                    correct ? 'bg-success/30 text-success border border-success/50' : 'bg-danger/30 text-danger border border-danger/50'
                  }`}
                >
                  {i + 1}
                </span>
              ))}
            </div>

            {/* Star rating for this level */}
            <div className="flex items-center justify-center gap-1 mb-6">
              <span className="text-xs text-text-muted mr-2">Kesulitan:</span>
              <StarRating count={levelStyle.stars} color={activeCategory.warna} />
            </div>

            <div className="flex flex-col gap-3">
              <Button size="lg" variant="primary" onClick={() => handleStartKuis(activeCategory)} className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <span>Ulangi Kuis Ini</span>
              </Button>
              <Button size="lg" variant="outline" onClick={() => setQuizState('category')} className="flex items-center justify-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Pilih Tingkat Lain</span>
              </Button>
              <NavLink to="/peringkat">
                <Button size="lg" variant="ghost" className="w-full flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>Lihat Peringkat</span>
                </Button>
              </NavLink>
              <NavLink to="/materi">
                <Button size="lg" variant="ghost" className="w-full flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Pelajari Materi Lagi</span>
                </Button>
              </NavLink>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
