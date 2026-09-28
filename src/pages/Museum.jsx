import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Landmark,
  RotateCcw,
  Radio,
  Sword,
  Shield,
  Sparkles,
  Clock,
  MapPin,
  Box,
  MousePointer
} from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

// 1. Bambu Runcing Mesh Component (Sukamanah & Indramayu)
function BambuMesh({ data, onSelect }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
      groupRef.current.position.y = (data.posisi?.y || 0) + Math.sin(Date.now() * 0.002) * 0.12;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[data.posisi.x, data.posisi.y, data.posisi.z]}
      scale={data.skala || 1}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onSelect(data); }}
      cursor="pointer"
    >
      {/* Floating Label */}
      <Html position={[0, 2.8, 0]} center distanceFactor={15}>
        <div className="bg-primary/90 text-gold text-xs font-display px-3 py-1 rounded-full border border-gold/40 shadow-lg whitespace-nowrap pointer-events-none">
          {data.nama}
        </div>
      </Html>

      {/* Bamboo Main Stalk (3 segments) */}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, i * 0.9 - 0.9, 0]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.075, 0.85, 12]} />
            <meshStandardMaterial
              color={hovered ? '#7aa33f' : '#5e822d'}
              roughness={0.6}
              emissive="#3d571a"
              emissiveIntensity={hovered ? 0.3 : 0.05}
            />
          </mesh>
          {/* Bamboo Joint Ring */}
          <mesh position={[0, 0.42, 0]}>
            <torusGeometry args={[0.08, 0.018, 8, 16]} />
            <meshStandardMaterial color="#443217" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Sharpened Spearhead Tip */}
      <mesh position={[0, 1.8, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.07, 0.6, 12]} />
        <meshStandardMaterial color="#d4b46a" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Red & White Ribbon Pita Perjuangan */}
      <mesh position={[0, 1.35, 0.08]} rotation={[0.2, 0.3, -0.4]}>
        <boxGeometry args={[0.22, 0.08, 0.02]} />
        <meshStandardMaterial color="#d32f2f" />
      </mesh>
      <mesh position={[0, 1.28, 0.08]} rotation={[0.2, 0.3, -0.4]}>
        <boxGeometry args={[0.22, 0.08, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// 2. Pedang Katana / Guntō PETA Mesh Component (Supriyadi / Daidan Blitar)
function KatanaMesh({ data, onSelect }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.position.y = (data.posisi?.y || 0) + Math.sin(Date.now() * 0.002 + 1) * 0.12;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[data.posisi.x, data.posisi.y, data.posisi.z]}
      scale={data.skala || 1}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onSelect(data); }}
      cursor="pointer"
    >
      <Html position={[0, 2.6, 0]} center distanceFactor={15}>
        <div className="bg-primary/90 text-gold text-xs font-display px-3 py-1 rounded-full border border-gold/40 shadow-lg whitespace-nowrap pointer-events-none">
          {data.nama}
        </div>
      </Html>

      {/* Blade (Polished Steel Curve) */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[Math.sin(i * 0.15) * 0.08, i * 0.4 - 0.2, 0]}
          rotation={[0, 0, -i * 0.05]}
        >
          <boxGeometry args={[0.07, 0.42, 0.02]} />
          <meshStandardMaterial
            color="#e8ecf2"
            metalness={0.95}
            roughness={0.1}
            emissive="#ffffff"
            emissiveIntensity={hovered ? 0.5 : 0.1}
          />
        </mesh>
      ))}

      {/* Tsuba (Guard Kuningan Emas) */}
      <mesh position={[0, -0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 16]} />
        <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Handle (Tsuka Kulit & Lilitan Emas) */}
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.055, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Kashira Cap */}
      <mesh position={[0, -1.27, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#d4a017" metalness={0.9} />
      </mesh>

      {/* Scabbard / Saya beside blade */}
      <mesh position={[0.2, 0.2, -0.05]} rotation={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.06, 0.05, 1.9, 10]} />
        <meshStandardMaterial color="#2b1810" roughness={0.3} />
      </mesh>
    </group>
  );
}

// 3. Monumen Tugu PETA Blitar Mesh Component
function TuguMesh({ data, onSelect }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
      groupRef.current.position.y = (data.posisi?.y || 0) + Math.sin(Date.now() * 0.002 + 2) * 0.12;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[data.posisi.x, data.posisi.y, data.posisi.z]}
      scale={data.skala || 1}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onSelect(data); }}
      cursor="pointer"
    >
      <Html position={[0, 2.7, 0]} center distanceFactor={15}>
        <div className="bg-primary/90 text-gold text-xs font-display px-3 py-1 rounded-full border border-gold/40 shadow-lg whitespace-nowrap pointer-events-none">
          {data.nama}
        </div>
      </Html>

      {/* Tiered Base Pedestal */}
      <mesh position={[0, -1.4, 0]}>
        <boxGeometry args={[1.6, 0.25, 1.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[0, -1.15, 0]}>
        <boxGeometry args={[1.2, 0.25, 1.2]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[0.9, 0.25, 0.9]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>

      {/* Main Obelisk Pillar */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.25, 0.45, 2.1, 4]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.4}
          metalness={0.3}
          emissive="#c9a84c"
          emissiveIntensity={hovered ? 0.4 : 0.08}
        />
      </mesh>

      {/* Gold Emblem Star */}
      <mesh position={[0, 0.5, 0.32]}>
        <octahedronGeometry args={[0.18]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Flaming Torch Bowl on Top */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.3, 0.15, 0.2, 12]} />
        <meshStandardMaterial color="#c9a84c" metalness={0.8} />
      </mesh>
      {/* Glowing Eternal Flame */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial
          color="#ff7b00"
          emissive="#ff3d00"
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

// 4. Mandau Pusaka Dayak Mesh Component (Pang Suma - Kalimantan Barat)
function MandauMesh({ data, onSelect }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
      groupRef.current.position.y = (data.posisi?.y || 0) + Math.sin(Date.now() * 0.002 + 3) * 0.12;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[data.posisi.x, data.posisi.y + 0.2, data.posisi.z]}
      scale={data.skala || 1}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onSelect(data); }}
      cursor="pointer"
    >
      <Html position={[0, 2.6, 0]} center distanceFactor={15}>
        <div className="bg-primary/90 text-gold text-xs font-display px-3 py-1 rounded-full border border-gold/40 shadow-lg whitespace-nowrap pointer-events-none">
          {data.nama}
        </div>
      </Html>

      {/* Mandau Blade (Widening curved tip) */}
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, -0.05]}>
        <boxGeometry args={[0.16, 1.4, 0.03]} />
        <meshStandardMaterial
          color="#cfd8dc"
          metalness={0.9}
          roughness={0.2}
          emissive="#d4a017"
          emissiveIntensity={hovered ? 0.5 : 0.1}
        />
      </mesh>

      {/* Carved Antler Hilt (Hulu Tanduk) */}
      <mesh position={[0.04, -0.55, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.06, 0.08, 0.55, 8]} />
        <meshStandardMaterial color="#e0d6c3" roughness={0.7} />
      </mesh>
      {/* Hulu Beak Motif */}
      <mesh position={[0.2, -0.75, 0]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.07, 0.35, 6]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.6} />
      </mesh>

      {/* Wooden Kumpang Scabbard with Red Binding */}
      <mesh position={[-0.22, 0.3, 0.05]} rotation={[0, 0, 0.04]}>
        <boxGeometry args={[0.18, 1.3, 0.06]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.6} />
      </mesh>
      <mesh position={[-0.22, 0.6, 0.08]}>
        <boxGeometry args={[0.2, 0.15, 0.04]} />
        <meshStandardMaterial color="#b71c1c" />
      </mesh>
    </group>
  );
}

// 5. Radio Klandestin Bawah Tanah Mesh Component (Sjahrir / Menteng 31)
function RadioMesh({ data, onSelect }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
      groupRef.current.position.y = (data.posisi?.y || 0) + Math.sin(Date.now() * 0.002 + 4) * 0.12;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[data.posisi.x, data.posisi.y, data.posisi.z]}
      scale={data.skala || 1}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onSelect(data); }}
      cursor="pointer"
    >
      <Html position={[0, 2.5, 0]} center distanceFactor={15}>
        <div className="bg-primary/90 text-gold text-xs font-display px-3 py-1 rounded-full border border-gold/40 shadow-lg whitespace-nowrap pointer-events-none">
          {data.nama}
        </div>
      </Html>

      {/* Wooden Radio Body Box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.0, 1.3, 0.9]} />
        <meshStandardMaterial
          color="#3e2723"
          roughness={0.5}
          emissive="#d4a017"
          emissiveIntensity={hovered ? 0.3 : 0.05}
        />
      </mesh>

      {/* Speaker Fabric Grill */}
      <mesh position={[-0.45, 0, 0.46]}>
        <boxGeometry args={[0.85, 0.95, 0.02]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.9} />
      </mesh>

      {/* Frequency Tuning Dial Window (Glowing Warm Light) */}
      <mesh position={[0.48, 0.22, 0.46]}>
        <boxGeometry args={[0.75, 0.42, 0.02]} />
        <meshStandardMaterial
          color="#ffb74d"
          emissive="#ff9800"
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Brass Tuning Knobs */}
      <mesh position={[0.28, -0.3, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.65, -0.3, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Antenna Rod */}
      <mesh position={[-0.8, 1.0, -0.2]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.018, 0.018, 1.4, 8]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.95} />
      </mesh>
    </group>
  );
}

// Floor & Lighting Component
function MuseumEnvironment() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 7]} intensity={2.0} castShadow />
      <pointLight position={[0, 8, 0]} color="#c9a84c" intensity={3} distance={20} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0d1b2a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Circular Platform */}
      <mesh position={[0, -1.95, 0]}>
        <cylinderGeometry args={[12, 12, 0.15, 64]} />
        <meshStandardMaterial color="#162032" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Gold Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, 0]}>
        <torusGeometry args={[12, 0.05, 8, 128]} />
        <meshStandardMaterial color="#c9a84c" emissive="#8B6914" emissiveIntensity={0.4} />
      </mesh>
    </>
  );
}

// Main Museum Component
export default function Museum() {
  const [artifacts, setArtifacts] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const controlsRef = useRef();

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/museum.json`)
      .then(res => res.json())
      .then(d => setArtifacts(d))
      .catch(() => {});
  }, []);

  const handleSelectArtifact = (artifact) => {
    setSelectedArtifact(artifact);
  };

  const handleFocus = (idx) => {
    setActiveIdx(idx);
    const art = artifacts[idx];
    if (art && controlsRef.current) {
      controlsRef.current.target.set(art.posisi.x, art.posisi.y, art.posisi.z);
      controlsRef.current.update();
    }
  };

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.object.position.set(0, 5, 18);
      controlsRef.current.update();
    }
  };

  return (
    <div className="pt-20 h-screen flex flex-col relative overflow-hidden bg-primary">
      {/* Top Bar */}
      <div className="absolute top-24 left-4 right-4 z-20 flex items-center justify-between glass-panel px-6 py-3 rounded-2xl border border-gold/20">
        <span className="font-display font-bold text-gold text-xs sm:text-sm tracking-widest uppercase flex items-center gap-2">
          <Landmark className="w-4 h-4 text-gold" />
          <span>Museum 3D Perlawanan Pendudukan Jepang (1942–1945)</span>
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleResetCamera} className="flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Kamera</span>
          </Button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full">
        <Canvas
          camera={{ position: [0, 5, 18], fov: 60 }}
          gl={{ antialias: true, powerPreference: 'default' }}
          dpr={[1, 1.5]}
        >
          <MuseumEnvironment />

          {artifacts.map((art) => {
            if (art.bentuk === 'bambu') return <BambuMesh key={art.id} data={art} onSelect={handleSelectArtifact} />;
            if (art.bentuk === 'katana') return <KatanaMesh key={art.id} data={art} onSelect={handleSelectArtifact} />;
            if (art.bentuk === 'tugu') return <TuguMesh key={art.id} data={art} onSelect={handleSelectArtifact} />;
            if (art.bentuk === 'mandau') return <MandauMesh key={art.id} data={art} onSelect={handleSelectArtifact} />;
            if (art.bentuk === 'radio') return <RadioMesh key={art.id} data={art} onSelect={handleSelectArtifact} />;
            return null;
          })}

          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={35}
            maxPolarAngle={Math.PI * 0.75}
            autoRotate
            autoRotateSpeed={0.4}
          />
        </Canvas>
      </div>

      {/* Control Hints Overlay */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 glass-panel px-4 py-2 rounded-full text-center text-xs text-text-muted border border-gold/20 pointer-events-none hidden sm:flex items-center gap-3">
        <span className="flex items-center gap-1"><MousePointer className="w-3.5 h-3.5 text-gold" /> Drag: Putar</span>
        <span>|</span>
        <span>Scroll: Zoom</span>
        <span>|</span>
        <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-gold" /> Klik Artefak untuk Detail Info</span>
      </div>

      {/* Bottom Artifact Navigation Bar */}
      <div className="absolute bottom-6 left-4 right-4 z-20 flex items-center justify-center gap-2 overflow-x-auto py-2">
        {artifacts.map((art, idx) => (
          <button
            key={art.id}
            onClick={() => handleFocus(idx)}
            className={`glass-panel px-4 py-2 rounded-xl text-xs font-display flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeIdx === idx
                ? 'border-gold text-gold bg-gold/20 shadow-gold'
                : 'border-white/10 text-text-muted hover:text-app-text'
            }`}
          >
            <span>
              {art.bentuk === 'bambu' && <Shield className="w-3.5 h-3.5 text-gold" />}
              {art.bentuk === 'katana' && <Sword className="w-3.5 h-3.5 text-gold" />}
              {art.bentuk === 'tugu' && <Landmark className="w-3.5 h-3.5 text-gold" />}
              {art.bentuk === 'mandau' && <Sword className="w-3.5 h-3.5 text-amber-500" />}
              {art.bentuk === 'radio' && <Radio className="w-3.5 h-3.5 text-cyan-400" />}
            </span>
            <span>{art.nama}</span>
          </button>
        ))}
      </div>

      {/* Popup Modal Detail */}
      <Modal
        isOpen={!!selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
        title={selectedArtifact ? selectedArtifact.nama : ''}
      >
        {selectedArtifact && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-secondary/60 p-4 rounded-xl border border-gold/15">
              <div>
                <span className="text-text-muted flex items-center gap-1 mb-0.5"><Clock className="w-3 h-3 text-gold" /> Periode</span>
                <span className="font-semibold text-gold">{selectedArtifact.periode}</span>
              </div>
              <div>
                <span className="text-text-muted flex items-center gap-1 mb-0.5"><MapPin className="w-3 h-3 text-gold" /> Asal</span>
                <span className="font-semibold text-app-text">{selectedArtifact.asal}</span>
              </div>
              <div>
                <span className="text-text-muted flex items-center gap-1 mb-0.5"><Box className="w-3 h-3 text-gold" /> Material</span>
                <span className="font-semibold text-app-text">{selectedArtifact.material || '-'}</span>
              </div>
              <div>
                <span className="text-text-muted flex items-center gap-1 mb-0.5"><Landmark className="w-3 h-3 text-gold" /> Koleksi</span>
                <span className="font-semibold text-app-text">{selectedArtifact.koleksi || '-'}</span>
              </div>
            </div>

            <p className="text-sm text-app-text leading-relaxed">
              {selectedArtifact.deskripsi}
            </p>

            {selectedArtifact.fakta && (
              <div className="bg-gold/10 p-4 rounded-xl border border-gold/30">
                <h4 className="font-display font-bold text-gold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>Fakta Menarik</span>
                </h4>
                <ul className="space-y-1 text-xs text-app-text">
                  {selectedArtifact.fakta.map((fact, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gold">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
