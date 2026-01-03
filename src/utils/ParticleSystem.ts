import * as THREE from 'three';
import type { ParticleMode, GestureData } from '../types/gesture';
import { TextShape } from './TextShape';

interface Position {
  x: number;
  y: number;
  z: number;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private count: number = 8000;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Points;
  private velocities: Position[] = [];
  private physicsVelocities: Position[] = [];
  private heartPositions: Position[] = [];
  private galaxyPositions: Position[] = [];
  private solarPositions: Position[] = [];
  private dnaPositions: Position[] = [];
  private textPositions: Position[] = [];
  private paintingPositions: Position[] = [];
  private starfieldPositions: Position[] = [];
  private paintingCursor: number = 0;
  private mode: ParticleMode = 'HEART';
  private targetColor: THREE.Color = new THREE.Color(0xffffff);
  private targetRotation: { x: number, y: number } = { x: 0, y: 0 };
  private currentRotation: { x: number, y: number } = { x: 0, y: 0 };
  private previousHandPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private baseColor: THREE.Color = new THREE.Color(0xffffff);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.count * 3);
    const scales = new Float32Array(this.count);
    const colors = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      scales[i] = Math.random() * 1.5 + 0.5;

      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 1.0;
      colors[i * 3 + 2] = 1.0;

      this.velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      });

      this.physicsVelocities.push({ x: 0, y: 0, z: 0 });
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        attribute float aScale;
        attribute vec3 aColor;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = aColor;
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          modelPosition.y += sin(uTime + position.x * 0.5) * 0.05;
          modelPosition.x += cos(uTime + position.y * 0.5) * 0.05;
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
          gl_Position = projectedPosition;
          float pulse = 1.0 + sin(uTime * 2.0 + position.x * 10.0) * 0.1;
          gl_PointSize = uSize * aScale * pulse;
          gl_PointSize *= (1.0 / -viewPosition.z);
          vAlpha = 1.0 / (1.0 + length(viewPosition.xyz) * 0.05);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float distance = length(coord);
          if (distance > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
          alpha = pow(alpha, 2.0) * vAlpha;
          vec3 finalColor = mix(vColor, uColor, 0.7);
          float center = 1.0 - smoothstep(0.0, 0.2, distance);
          finalColor += vec3(center * 0.4);
          gl_FragColor = vec4(finalColor, alpha * 0.95);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 45.0 },
        uColor: { value: new THREE.Color(1, 1, 1) }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.generateHeartShape();
    this.generateGalaxyShape();
    this.generateSolarSystemShape();
    this.generateDNAShape();

    this.starfieldPositions = [];
    for (let i = 0; i < this.count; i++) {
      this.starfieldPositions.push({
        x: (Math.random() - 0.5) * 50,
        y: (Math.random() - 0.5) * 30,
        z: (Math.random() - 0.5) * 30
      });
    }

    for (let i = 0; i < this.count; i++) {
      const p = { x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 20, z: (Math.random() - 0.5) * 20 };
      this.textPositions.push(p);
      this.paintingPositions.push(p);
    }
  }

  private generateGalaxyShape(): void {
    this.galaxyPositions = [];
    const arms = 4;
    const colors = this.geometry.attributes.aColor.array as Float32Array;
    for (let i = 0; i < this.count; i++) {
      if (i < this.count * 0.3) {
        const r = Math.pow(Math.random(), 2) * 2.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        this.galaxyPositions.push({
          x: r * Math.sin(phi) * Math.cos(theta),
          y: r * Math.sin(phi) * Math.sin(theta) * 0.5,
          z: r * Math.cos(phi) * 0.25
        });
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.7 + Math.random() * 0.3; colors[i * 3 + 2] = 0.3 + Math.random() * 0.2;
      } else {
        const armIndex = i % arms;
        const radius = 2.5 + Math.random() * 10;
        const angle = (Math.PI * 2 * armIndex) / arms + (radius * 0.6);
        const x = Math.cos(angle) * (radius + (Math.random() - 0.5));
        const y = Math.sin(angle) * (radius + (Math.random() - 0.5));
        const z = (Math.random() - 0.5) * (0.6 / Math.sqrt(radius * 0.3));
        this.galaxyPositions.push({ x, y, z });
        const blueness = 0.5 + (radius / 12) * 0.5;
        colors[i * 3] = 0.6; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = blueness + Math.random() * 0.3;
      }
    }
  }

  private generateSolarSystemShape(): void {
    this.solarPositions = [];
    const colors = this.geometry.attributes.aColor.array as Float32Array;
    for (let i = 0; i < this.count; i++) {
      let x, y, z;
      if (Math.random() < 0.2) {
        const r = Math.pow(Math.random(), 3) * 2.0;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.2;
      } else {
        const radius = 3.0 + Math.random() * 15.0;
        const angle = Math.random() * Math.PI * 2;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        z = (Math.random() - 0.5) * 0.2;
        colors[i * 3] = 0.5; colors[i * 3 + 1] = 0.6; colors[i * 3 + 2] = 0.7;
      }
      this.solarPositions.push({ x, y, z });
    }
  }

  private generateHeartShape(): void {
    this.heartPositions = [];
    const colors = this.geometry.attributes.aColor.array as Float32Array;
    for (let i = 0; i < this.count; i++) {
      const t = Math.random() * Math.PI * 2;
      const depthScale = Math.pow(Math.random(), 1 / 2.5);
      const xBase = 16 * Math.pow(Math.sin(t), 3);
      const yBase = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      const x = xBase * depthScale * 0.24;
      const y = yBase * depthScale * 0.24;
      const z = (Math.random() - 0.5) * 5.0 * depthScale * 0.45;
      this.heartPositions.push({ x, y, z });
      const intensity = 0.7 + depthScale * 0.3;
      colors[i * 3] = intensity; colors[i * 3 + 1] = 0.1; colors[i * 3 + 2] = 0.3;
    }
  }

  private generateDNAShape(): void {
    this.dnaPositions = [];
    const colors = this.geometry.attributes.aColor.array as Float32Array;
    for (let i = 0; i < this.count; i++) {
      const t = (i / this.count) * Math.PI * 10;
      const y = ((i / this.count) - 0.5) * 15;
      const isStrand2 = i % 2 === 0;
      const angleOffset = isStrand2 ? Math.PI : 0;
      const x = Math.cos(t + angleOffset) * 3.5 + (Math.random() - 0.5) * 0.3;
      const z = Math.sin(t + angleOffset) * 3.5 + (Math.random() - 0.5) * 0.3;
      this.dnaPositions.push({ x, y: y + (Math.random() - 0.5) * 0.3, z });
      if (isStrand2) { colors[i * 3] = 0.2; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1.0; }
      else { colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.2; colors[i * 3 + 2] = 0.8; }
    }
  }

  setMode(mode: ParticleMode): void {
    this.mode = mode;
  }

  setColor(color: THREE.Color): void {
    this.baseColor.copy(color);
    this.targetColor.copy(color);
  }

  setText(text: string): void {
    const positions = TextShape.generatePositions(text, this.count);
    for (let i = 0; i < this.count; i++) {
      if (i < positions.length) this.textPositions[i] = positions[i];
      else this.textPositions[i] = { x: (Math.random() - 0.5) * 50, y: (Math.random() - 0.5) * 50, z: (Math.random() - 0.5) * 50 };
    }
    this.setMode('TEXT');
  }

  triggerShockwave(center: { x: number, y: number, z: number }): void {
    const force = 2.0;
    for (let i = 0; i < this.count; i++) {
      const p = this.geometry.attributes.position;
      const px = p.getX(i);
      const py = p.getY(i);
      const pz = p.getZ(i);

      const dx = px - center.x;
      const dy = py - center.y;
      const dz = pz - center.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;

      const nx = dx / dist;
      const ny = dy / dist;
      const nz = dz / dist;

      this.physicsVelocities[i].x += nx * force;
      this.physicsVelocities[i].y += ny * force;
      this.physicsVelocities[i].z += nz * force;
    }
  }

  update(dt: number, gestureState: GestureData, audioFeatures?: { bass: number, mid: number, treble: number }): void {
    let timeScale = 1.0;

    if (gestureState.secondHand?.found && gestureState.secondHand.gesture) {
      const g2 = gestureState.secondHand.gesture;
      if (g2 === 'CLOSED') timeScale = 0.0;
      else if (g2 === 'PINCH') timeScale = 0.1;
      else if (g2 === 'OPEN') timeScale = 1.0;
    }

    const scaledDt = dt * timeScale;
    this.material.uniforms.uTime.value += scaledDt;

    if (audioFeatures) {
      const baseSize = 45.0;
      const pulse = 1.0 + audioFeatures.bass * 2.5;
      this.material.uniforms.uSize.value = baseSize * pulse;
      if (audioFeatures.treble > 0.55) {
        const bright = new THREE.Color(this.targetColor).offsetHSL(0, 0, 0.4);
        this.material.uniforms.uColor.value.lerp(bright, 0.4);
      }
    } else {
      this.material.uniforms.uSize.value = 45.0;
    }

    const positions = this.geometry.attributes.position.array as Float32Array;
    let targetArr: Position[] | null = null;
    let isPhysicsActive = false;
    let attractMode = false;
    let chaosMode = false;
    let paintingMode = false;

    if (this.mode === 'HEART') targetArr = this.heartPositions;
    else if (this.mode === 'GALAXY') targetArr = this.galaxyPositions;
    else if (this.mode === 'SOLAR') targetArr = this.solarPositions;
    else if (this.mode === 'DNA') targetArr = this.dnaPositions;
    else if (this.mode === 'TEXT') targetArr = this.textPositions;

    const handPos = new THREE.Vector3(0, 0, 0);
    if (gestureState?.position) {
      handPos.x = (gestureState.position.x - 0.5) * -15;
      handPos.y = (0.5 - gestureState.position.y) * 12;
      handPos.z = 0;

      if (gestureState.found) {
        const vx = (handPos.x - this.previousHandPos.x) / dt;
        const vy = (handPos.y - this.previousHandPos.y) / dt;
        const speed = Math.sqrt(vx * vx + vy * vy);

        if (speed > 150 && !paintingMode) {
          this.triggerShockwave(handPos);
        }
      }
      this.previousHandPos.copy(handPos);
    }

    if (gestureState?.found && gestureState.position) {
      this.targetColor.copy(this.baseColor);

      if (gestureState.gesture === 'PINCH') {
        isPhysicsActive = true; attractMode = true;
      } else if (gestureState.gesture === 'OPEN') {
        isPhysicsActive = true; chaosMode = true;
      } else if (gestureState.gesture === 'POINT') {
        paintingMode = true;
        isPhysicsActive = true;

        const batchSize = 20;
        for (let k = 0; k < batchSize; k++) {
          this.paintingCursor = (this.paintingCursor + 1) % this.count;
          const p = this.paintingPositions[this.paintingCursor];
          p.x = handPos.x + (Math.random() - 0.5) * 0.5;
          p.y = handPos.y + (Math.random() - 0.5) * 0.5;
          p.z = handPos.z + (Math.random() - 0.5) * 0.5;
        }
      } else if (gestureState.gesture === 'CLOSED') {
        const handX = gestureState.position.x;
        const handY = gestureState.position.y;
        this.targetRotation.y = (handX - 0.5) * Math.PI * 2.0;
        this.targetRotation.x = (handY - 0.5) * Math.PI * 2.0;
      }
    } else {
      this.targetRotation.x *= 0.95;
      this.targetRotation.y *= 0.95;
      this.targetColor.copy(this.baseColor);
    }

    this.material.uniforms.uColor.value.lerp(this.targetColor, 0.1);
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.1;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.1;
    this.mesh.rotation.x = this.currentRotation.x;
    this.mesh.rotation.y = this.currentRotation.y;

    const time = this.material.uniforms.uTime.value;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const px = positions[i3];
      const py = positions[i * 3 + 1];
      const pz = positions[i * 3 + 2];

      let tx = 0, ty = 0, tz = 0;
      let useTarget = false;
      let isStarfield = false;

      if (paintingMode) {
        const t = this.paintingPositions[i];
        tx = t.x; ty = t.y; tz = t.z;
        useTarget = true;
      } else if (chaosMode) {
        isStarfield = true;
        const t = this.starfieldPositions[i];
        const range = 2.0;
        const driftX = Math.sin(time * 0.3 + i * 0.1) * range + Math.cos(time * 0.1 + i * 0.5) * range;
        const driftY = Math.cos(time * 0.2 + i * 0.2) * range + Math.sin(time * 0.4 + i) * range;
        const driftZ = Math.sin(time * 0.35 + i * 1.5) * range;

        tx = t.x + driftX;
        ty = t.y + driftY;
        tz = t.z + driftZ;
        useTarget = true;
      } else if (targetArr) {
        const t = targetArr[i];
        const driftX = Math.sin(time * 0.3 + i * 0.05) * 0.15;
        const driftY = Math.cos(time * 0.3 + i * 0.05) * 0.15;
        const driftZ = Math.sin(time * 0.5 + i * 0.1) * 0.12;
        tx = t.x + driftX;
        ty = t.y + driftY;
        tz = t.z + driftZ;
        useTarget = true;
      }

      if (useTarget) {
        const springStrength = isStarfield ? 0.01 : 0.05;
        this.physicsVelocities[i].x += (tx - px) * springStrength;
        this.physicsVelocities[i].y += (ty - py) * springStrength;
        this.physicsVelocities[i].z += (tz - pz) * springStrength;
      }

      if (isPhysicsActive && !chaosMode && !paintingMode) {
        const dx = px - handPos.x;
        const dy = py - handPos.y;
        const dz = pz - handPos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;

        if (attractMode && dist < 12) {
          const f = 0.3 / dist;
          this.physicsVelocities[i].x -= dx * f;
          this.physicsVelocities[i].y -= dy * f;
          this.physicsVelocities[i].z -= dz * f;
        }
      }

      const damping = isStarfield ? 0.90 : 0.92;
      this.physicsVelocities[i].x *= damping;
      this.physicsVelocities[i].y *= damping;
      this.physicsVelocities[i].z *= damping;

      positions[i3] += this.physicsVelocities[i].x;
      positions[i3 + 1] += this.physicsVelocities[i].y;
      positions[i3 + 2] += this.physicsVelocities[i].z;
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.mesh);
  }
}