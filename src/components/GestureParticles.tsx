import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ParticleSystem } from '../utils/ParticleSystem';
import { HandTracker } from '../utils/HandTracker';
import { AudioAnalyzer } from '../utils/AudioAnalyzer';
import type { GestureData, ParticleMode } from '../types/gesture';
import { VoiceControl } from '../utils/VoiceControl';
import ControlMenu from './ControlMenu';

export default function GestureParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null);
  const voiceControlRef = useRef<VoiceControl | null>(null);

  const [currentMode, setCurrentMode] = useState<ParticleMode>('HEART');
  const [gestureStatus, setGestureStatus] = useState<string>('System Online');
  const [showStatus, setShowStatus] = useState(false);
  const [leftGestureStatus, setLeftGestureStatus] = useState<string>('');
  const [showLeftStatus, setShowLeftStatus] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!containerRef.current || !videoRef.current) return;

    const container = containerRef.current;
    const videoElement = videoRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.5;
    bloomPass.threshold = 0.1;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const particleSystem = new ParticleSystem(scene);
    particleSystemRef.current = particleSystem;
    particleSystem.setMode('HEART');

    audioAnalyzerRef.current = new AudioAnalyzer();

    voiceControlRef.current = new VoiceControl();
    voiceControlRef.current.setCallback((command, type) => {
      if (type === 'MODE') {
        const mode = command as ParticleMode;
        setCurrentMode(mode);
        particleSystem.setMode(mode);
      } else if (type === 'COLOR') {
        const color = new THREE.Color(parseInt(command));
        particleSystem.setColor(color);
      }
    });

    const handTracker = new HandTracker(videoElement);
    let currentGestureState: GestureData = { found: false, gesture: 'OPEN', position: { x: 0, y: 0, z: 0 } };

    handTracker.on((data) => {
      currentGestureState = data;

      if (data.found && data.gesture) {
        setShowStatus(true);
        setGestureStatus(`Gesture: ${data.gesture}`);
      } else {
        setShowStatus(false);
      }

      if (data.secondHand?.found && data.secondHand.gesture) {
        setShowLeftStatus(true);
        setLeftGestureStatus(data.secondHand.gesture);
      } else {
        setShowLeftStatus(false);
      }
    });

    handTracker.start();

    const clock = new THREE.Clock();
    const targetCameraPos = { x: 0, y: 0 };

    function animate() {
      requestAnimationFrame(animate);
      const dt = clock.getDelta();

      if (window.mouseX !== undefined) {
        targetCameraPos.x = window.mouseX * 1.5;
        targetCameraPos.y = window.mouseY * 1.5;
        camera.position.x += (targetCameraPos.x - camera.position.x) * 0.05;
        camera.position.y += (targetCameraPos.y - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
      }

      let audioFeatures = undefined;
      if (audioAnalyzerRef.current?.isReady) audioFeatures = audioAnalyzerRef.current.getFeatures();

      particleSystem.update(dt, currentGestureState, audioFeatures);
      composer.render();
    }

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    window.mouseX = 0;
    window.mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      window.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      window.mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      particleSystem.dispose();
      audioAnalyzerRef.current?.dispose();
      voiceControlRef.current?.stop();
      container.removeChild(renderer.domElement);
      renderer.dispose();
      particleSystemRef.current = null;
    };
  }, []);

  const handleModeChange = (mode: ParticleMode) => handleModeChangeInternal(mode);

  const handleModeChangeInternal = (mode: ParticleMode) => {
    setCurrentMode(mode);
    if (particleSystemRef.current) particleSystemRef.current.setMode(mode);
  };

  const enableAudio = async () => {
    if (audioAnalyzerRef.current) {
      await audioAnalyzerRef.current.init();
      setIsAudioEnabled(audioAnalyzerRef.current.isReady);
    }
  };

  const toggleVoice = () => {
    if (voiceControlRef.current) {
      const active = !isVoiceActive;
      if (active) voiceControlRef.current.start();
      else voiceControlRef.current.stop();
      setIsVoiceActive(active);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (particleSystemRef.current && inputText.trim()) {
      particleSystemRef.current.setText(inputText.toUpperCase());
      setCurrentMode('TEXT');
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-black via-slate-900 to-black text-white font-['Outfit'] select-none">
      <div ref={containerRef} className="absolute top-0 left-0 w-full h-full z-[1]" />
      <video
        ref={videoRef}
        id="input-video"
        className="absolute top-0 left-0 w-full h-full object-cover -scale-x-100 opacity-60 pointer-events-none mix-blend-screen filter hue-rotate-180 contrast-125 brightness-75 select-none z-0"
        playsInline
      />

      <div className="absolute top-6 left-6 z-30 flex flex-col gap-3">
        <div className="flex gap-2">
          <button
            onClick={enableAudio}
            disabled={isAudioEnabled}
            className={`px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 transition-all font-bold tracking-wider ${isAudioEnabled
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
          >
            {isAudioEnabled ? '🎵' : '🔇 Audio'}
          </button>

          <button
            onClick={toggleVoice}
            className={`px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 transition-all font-bold tracking-wider ${isVoiceActive
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
              : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
          >
            {isVoiceActive ? '🎙️ Listening...' : '🎙️ Voice'}
          </button>
        </div>

        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            type="text"
            maxLength={8}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="TYPE HERE..."
            className="w-32 bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-sm font-bold tracking-widest outline-none focus:border-cyan-500/50 transition-colors uppercase placeholder:text-white/30"
          />
          <button
            type="submit"
            className="px-3 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 rounded-xl text-cyan-300 font-bold transition-all"
          >
            GO
          </button>
        </form>
      </div>

      <div className="absolute top-6 right-6 z-20 pointer-events-none group">
        <div className={`relative px-6 py-4 transition-all duration-500 mb-4 ${showStatus ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md -skew-x-12 border-r-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]"></div>
          <div className="absolute top-0 right-0 w-16 h-[2px] bg-cyan-400"></div>
          <div className="absolute bottom-0 left-0 w-16 h-[2px] bg-cyan-400"></div>

          <div className="relative flex items-center gap-4 -skew-x-12">
            <div className="relative transform skew-x-12">
              <div className={`text-4xl transition-transform duration-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] ${gestureStatus.includes('CLOSED') ? 'scale-90' : gestureStatus.includes('PINCH') ? 'scale-95' : 'scale-100'}`}>
                {gestureStatus.includes('CLOSED') ? '✊' : gestureStatus.includes('PINCH') ? '🤏' : '✋'}
              </div>
            </div>

            <div className="flex flex-col transform skew-x-12">
              <span className="text-[10px] font-bold text-cyan-500/80 uppercase tracking-[0.2em] mb-1">
                SYSTEM :: RIGHT_HAND
              </span>
              <span className={`text-lg font-bold font-mono tracking-wider transition-colors ${gestureStatus.includes('CLOSED') ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : gestureStatus.includes('PINCH') ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]' : 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`}>
                {gestureStatus.includes('CLOSED') ? 'FORMING' : gestureStatus.includes('PINCH') ? 'ATTRACT' : gestureStatus.includes('OPEN') ? 'CHAOS' : 'SEARCHING...'}
              </span>
            </div>
          </div>
        </div>

        <div className={`relative px-6 py-4 transition-all duration-500 ${showLeftStatus ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md -skew-x-12 border-r-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]"></div>
          <div className="absolute top-0 right-0 w-16 h-[2px] bg-amber-500"></div>
          <div className="absolute bottom-0 left-0 w-16 h-[2px] bg-amber-500"></div>

          <div className="relative flex items-center gap-4 -skew-x-12">
            <div className="relative transform skew-x-12">
              <div className={`text-4xl transition-transform duration-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] ${leftGestureStatus.includes('CLOSED') ? 'scale-90' : leftGestureStatus.includes('PINCH') ? 'scale-95' : 'scale-100'}`}>
                {leftGestureStatus.includes('CLOSED') ? '⏳' : leftGestureStatus.includes('PINCH') ? '🤚' : '🖐'}
              </div>
            </div>

            <div className="flex flex-col transform skew-x-12">
              <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-[0.2em] mb-1">
                CHRONO :: LEFT_HAND
              </span>
              <span className={`text-lg font-bold font-mono tracking-wider transition-colors ${leftGestureStatus.includes('CLOSED') ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : leftGestureStatus.includes('PINCH') ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]'}`}>
                {leftGestureStatus.includes('CLOSED') ? 'TIME FREEZE' : leftGestureStatus.includes('PINCH') ? 'SLOW MOTION' : leftGestureStatus.includes('OPEN') ? 'NORMAL FLOW' : 'SCANNING...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ControlMenu
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onColorChange={(color) => {
          if (particleSystemRef.current) particleSystemRef.current.setColor(color);
        }}
      />
    </div>
  );
}

declare global {
  interface Window {
    mouseX: number;
    mouseY: number;
  }
}
