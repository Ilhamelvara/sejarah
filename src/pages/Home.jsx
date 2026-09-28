import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Sparkles,
  BookOpen,
  Landmark,
  HelpCircle,
  Trophy,
  Clock,
  Radio,
  Sword,
  Shield,
  Flame,
  ArrowRight,
  Rocket
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// 3D Particles & Decorative geometry for Hero Background
function HeroCanvasObjects() {
  const pointsRef = useRef();
  const torusRef = useRef();
  const icoRef = useRef();

  // Create 300 random golden particles
  const [particlesPos] = useState(() => {
    const N = 250;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  });

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
    }
    if (torusRef.current) {
      torusRef.current.rotation.z += delta * 0.15;
    }
    if (icoRef.current) {
      icoRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlesPos, 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#c9a84c" size={0.12} transparent opacity={0.5} />
      </points>

      {/* Torus wireframe */}
      <mesh ref={torusRef} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[8, 0.8, 16, 80]} />
        <meshBasicMaterial color="#c9a84c" wireframe transparent opacity={0.08} />
      </mesh>

      {/* Icosahedron wireframe */}
      <mesh ref={icoRef} position={[-15, -5, -10]}>
        <icosahedronGeometry args={[4, 1]} />
        <meshBasicMaterial color="#e8935a" wireframe transparent opacity={0.06} />
      </mesh>
    </>
  );
}

export default function Home() {
  const [timelineItems, setTimelineItems] = useState([]);
  const [stats, setStats] = useState({ materi: 0, artifacts: 0, quiz: 0, eras: 0 });
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/timeline.json`)
      .then(res => res.json())
      .then(data => setTimelineItems(data.slice(0, 8)))
      .catch(() => {});
  }, []);

  // Fetch real registered users count and listen realtime
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const fetchCount = async () => {
      try {
        const { count, error } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });
        if (!error && count !== null) {
          setRegisteredUsersCount(count);
        }
      } catch (e) {
        console.warn('Count fetch notice:', e);
      }
    };

    fetchCount();

    const channel = supabase
      .channel('home-users-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => {
        fetchCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Stats counter animation
  useEffect(() => {
    const targets = { materi: 500, artifacts: 50, quiz: 200, eras: 16 };
    let start = performance.now();
    const duration = 2000;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      setStats({
        materi: Math.round(targets.materi * ease),
        artifacts: Math.round(targets.artifacts * ease),
        quiz: Math.round(targets.quiz * ease),
        eras: Math.round(targets.eras * ease),
      });

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Three.js Background Canvas */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Canvas
            camera={{ position: [0, 0, 30], fov: 60 }}
            gl={{ powerPreference: 'low-power', antialias: false, alpha: true, depth: false }}
            dpr={[1, 1.5]}
          >
            <HeroCanvasObjects />
          </Canvas>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/30 via-primary/80 to-primary pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Platform Edukasi Sejarah #1 Indonesia</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-app-text mb-6 leading-tight">
            Jelajahi Sejarah <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-amber">Indonesia</span>
            <br />
            <span className="text-2xl sm:text-4xl text-text-muted font-normal">dalam Dimensi Baru</span>
          </h1>

          <p className="max-w-2xl text-base sm:text-xl text-text-muted leading-relaxed mb-8">
            Museum 3D virtual, timeline interaktif, materi lengkap, dan kuis seru untuk membuat belajar sejarah jadi pengalaman yang tak terlupakan.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <NavLink to="/materi">
              <Button size="lg" variant="primary" className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>Mulai Belajar</span>
              </Button>
            </NavLink>
            <NavLink to="/museum">
              <Button size="lg" variant="outline" className="flex items-center gap-2">
                <Landmark className="w-5 h-5" />
                <span>Masuk Museum 3D</span>
              </Button>
            </NavLink>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
            <div className="glass-panel p-4 rounded-xl border border-gold/20 text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-gold">{stats.materi}+</div>
              <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">Materi</div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-gold/20 text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-gold">{stats.artifacts}+</div>
              <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">Artefak 3D</div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-gold/20 text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-gold">{stats.quiz}+</div>
              <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">Soal Kuis</div>
            </div>
            <NavLink to="/peringkat" className="glass-panel p-4 rounded-xl border border-gold/30 hover:border-gold/60 transition-colors text-center group bg-gold/5">
              <div className="font-display text-3xl sm:text-4xl font-bold text-gold flex items-center justify-center gap-1.5">
                <span>{registeredUsersCount > 0 ? registeredUsersCount : stats.eras}</span>
                <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block" title="Live Realtime" />
              </div>
              <div className="text-xs text-gold mt-1 uppercase tracking-wider font-semibold group-hover:underline flex items-center justify-center gap-1">
                <span>Pejuang Terdaftar</span>
                <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block" />
              </div>
            </NavLink>
          </div>
        </div>
      </section>

      {/* FITUR UNGGULAN */}
      <section className="py-20 bg-primary-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Fitur Unggulan"
            title="Semua yang Kamu Butuhkan"
            subtitle="Satu platform lengkap untuk belajar sejarah Indonesia dengan cara yang modern dan menyenangkan"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <NavLink to="/museum" className="group">
              <Card className="h-full group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform">
                  <Landmark className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-gold mb-2">Museum 3D</h3>
                <p className="text-text-muted text-xs leading-relaxed">
                  Jelajahi artefak bersejarah dalam tampilan 3D interaktif. Putar dan klik info.
                </p>
              </Card>
            </NavLink>

            <NavLink to="/materi" className="group">
              <Card className="h-full group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-info/15 flex items-center justify-center text-info mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-gold mb-2">20 Bab Materi</h3>
                <p className="text-text-muted text-xs leading-relaxed">
                  Materi lengkap pendudukan Jepang dari latar belakang hingga nilai kemerdekaan.
                </p>
              </Card>
            </NavLink>

            <NavLink to="/materi" className="group">
              <Card className="h-full group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-amber/15 flex items-center justify-center text-amber mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-gold mb-2">Timeline Sejarah</h3>
                <p className="text-text-muted text-xs leading-relaxed">
                  Kronologi peristiwa 1942–1945 dari Perjanjian Kalijati hingga Proklamasi.
                </p>
              </Card>
            </NavLink>

            <NavLink to="/quiz" className="group">
              <Card className="h-full group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-success/15 flex items-center justify-center text-success mb-4 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-gold mb-2">Kuis Interaktif</h3>
                <p className="text-text-muted text-xs leading-relaxed">
                  Uji pemahaman dengan soal pilihan ganda, skor otomatis, dan pembahasan.
                </p>
              </Card>
            </NavLink>

            <NavLink to="/peringkat" className="group">
              <Card className="h-full group-hover:-translate-y-2 transition-transform duration-300 border-gold/30 bg-gold/5">
                <div className="w-12 h-12 rounded-2xl bg-gold/25 flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform shadow-gold">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-gold mb-2">Papan Peringkat</h3>
                <p className="text-text-muted text-xs leading-relaxed">
                  Lihat ranking seluruh pejuang dan raih posisi teratas sebagai Panglima PETA!
                </p>
              </Card>
            </NavLink>
          </div>
        </div>
      </section>

      {/* PREVIEW MUSEUM 3D */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Museum Virtual"
            title="Artefak Bersejarah dalam 3D"
            subtitle="Rasakan pengalaman mengunjungi museum dari rumahmu"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-8 hover:border-gold/50 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gold/15 flex items-center justify-center text-gold mb-4 animate-float">
                <Flame className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-gold text-lg mb-1">Bambu Runcing</h4>
              <p className="text-xs text-text-muted">1944–1945 · Sukamanah & Indramayu</p>
            </Card>

            <Card className="text-center p-8 hover:border-gold/50 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gold/15 flex items-center justify-center text-gold mb-4 animate-float" style={{ animationDelay: '0.5s' }}>
                <Sword className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-gold text-lg mb-1">Katana Guntō PETA</h4>
              <p className="text-xs text-text-muted">1945 · Supriyadi / Blitar</p>
            </Card>

            <Card className="text-center p-8 hover:border-gold/50 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gold/15 flex items-center justify-center text-gold mb-4 animate-float" style={{ animationDelay: '1s' }}>
                <Landmark className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-gold text-lg mb-1">Tugu PETA Blitar</h4>
              <p className="text-xs text-text-muted">14 Feb 1945 · Jawa Timur</p>
            </Card>

            <Card className="text-center p-8 hover:border-gold/50 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gold/15 flex items-center justify-center text-gold mb-4 animate-float" style={{ animationDelay: '1.5s' }}>
                <Radio className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-gold text-lg mb-1">Radio Klandestin</h4>
              <p className="text-xs text-text-muted">1942–1945 · Gerakan Bawah Tanah</p>
            </Card>
          </div>

          <div className="text-center mt-12">
            <NavLink to="/museum">
              <Button size="lg" variant="primary" className="flex items-center gap-2 mx-auto">
                <Landmark className="w-5 h-5" />
                <span>Jelajahi Museum 3D Sektor Penuh</span>
              </Button>
            </NavLink>
          </div>
        </div>
      </section>

      {/* TIMELINE PREVIEW */}
      <section className="py-20 bg-primary-light/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Timeline Sejarah"
            title="Perjalanan Panjang Nusantara"
            subtitle="Dari 1 juta SM hingga era modern — klik titik untuk detail"
          />

          <div className="overflow-x-auto pb-6">
            <div className="flex gap-4 min-w-max px-4">
              {timelineItems.map((item) => (
                <NavLink key={item.id} to="/materi">
                  <div className="glass-panel p-5 rounded-2xl w-64 border border-gold/20 hover:border-gold/60 transition-all hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="font-display text-sm font-bold" style={{ color: item.warna }}>
                        {item.tahun}
                      </span>
                    </div>
                    <h4 className="font-display font-semibold text-app-text text-base mb-1 truncate">
                      {item.judul}
                    </h4>
                    <p className="text-xs text-text-muted line-clamp-2">
                      {item.deskripsi}
                    </p>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <NavLink to="/materi">
              <Button variant="outline" className="flex items-center gap-2 mx-auto">
                <Clock className="w-4 h-4" />
                <span>Lihat Timeline Lengkap</span>
              </Button>
            </NavLink>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-primary">
        <div className="max-w-5xl mx-auto px-4">
          <div className="glass-panel rounded-3xl p-10 sm:p-16 text-center border border-gold/30 bg-gradient-to-r from-gold/10 via-primary/50 to-amber/10 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-4">
              <Rocket className="w-8 h-8" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-app-text mb-4">
              Siap Jelajahi Sejarah?
            </h2>
            <p className="text-text-muted text-base sm:text-lg max-w-xl mx-auto mb-8">
              Bergabunglah dengan ribuan pelajar yang sudah memulai perjalanan belajar sejarah yang lebih menyenangkan
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <NavLink to="/materi">
                <Button size="lg" variant="primary" className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Mulai Belajar Gratis</span>
                </Button>
              </NavLink>
              <NavLink to="/quiz">
                <Button size="lg" variant="outline" className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>Coba Kuis</span>
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
