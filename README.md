# HandGesture Template

> A Next-Gen Hand Tracking & Particle Simulation Experiment.
> Built with React, Three.js, MediaPipe, and Web Audio API.

![Hand Gesture Demo](https://via.placeholder.com/800x450?text=HandGesture+Demo)

## Overview

**HandGesture** is an interactive web application that transforms your hand movements into stunning 3D particle visuals. It features a futuristic **Cyber-Interface** with holographic HUDs, voice commands, and physics-based interactions.

## Key Features

### 1. Advanced Hand Tracking
- **Right Hand**: Controls the shape and behavior of the particle system.
- **Left Hand**: Controls **TIME** itself (God Mode).
  - **Closed**: Time Freeze (Particles stop).
  - **Pinch**: Slow Motion (Matrix style).
  - **Open**: Normal Speed.

### 2. 3D Particle Shapes
Switch between different volumetric modes:
- **HEART**: Volumetric, pulsing heart.
- **GALAXY**: Rotating spiral galaxy with a dense core.
- **SOLAR SYSTEM**: Atomic-style planetary orbits.
- **DNA**: Double helix structure.
- **TEXT**: Type anything to turn particles into 3D text.

### 3. JARVIS Voice Control
Control the system with your voice (Click "Voice" button to activate):
- **"Galaxy"**, **"Heart"**, **"Solar"**, **"DNA"** -> Switch modes.
- **"Red"**, **"Blue"**, **"Green"**, **"Gold"** -> Change colors instantly.

### 4. Kinetic Physics
- **Sharkwave ("Force Push")**: Punch forward quickly to trigger a massive shockwave explosion.
- **Space Chaos**: Open your right hand to create turbulence (Starfield mode).
- **Finger Painting**: Use your index finger (`POINT`) to draw trails in 3D space.

### 5. Cyber-Interface
- **Holographic HUD**: Sci-Fi status cards tracking your hand states.
- **Cyber-Cam**: Your video feed is styled as a holographic background.
- **3D Parallax**: The camera reacts to your mouse/head movement for depth.

## Tech Stack
- **Framework**: React + Vite
- **Language**: TypeScript
- **3D Engine**: Three.js
- **Computer Vision**: MediaPipe Hands
- **Styling**: Tailwind CSS
- **Audio**: Web Audio API (Audio Reactive)

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/HandGesture.git

# 2. Enter directory
cd HandGesture

# 3. Install dependencies
npm install

# 4. Run development server
npm run dev
```

## Controls Guide

| Gesture | Hand | Action |
| :--- | :--- | :--- |
| **Pinch** (Index+Thumb) | Right | **Attract** particles to center |
| **Open Hand** | Right | **Chaos/Starfield** mode |
| **Point** (Index Finger) | Right | **3D Painting** (Draw trails) |
| **Closed Fist** | Right | Rotate object |
| **Closed Fist** | Left | **Time Freeze** ⏳ |
| **Pinch** | Left | **Slow Motion** 🐌 |

## Voice Commands Checklist
- "Switch to **Galaxy**"
- "Show me **Heart**"
- "Make it **Red**"
- "Change to **Cyan**"
- "System **Solar**"

---
