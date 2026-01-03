import { Hands } from '@mediapipe/hands';
import type { Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import type { GestureData } from '../types/gesture';

export class HandTracker {
  private videoElement: HTMLVideoElement;
  private hands: Hands;
  private callbacks: ((data: GestureData) => void)[] = [];
  private camera: Camera | null = null;

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.hands.onResults(this.onResults.bind(this));
  }

  start(): void {
    if (this.camera) return;

    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: this.videoElement });
      },
      width: 1280,
      height: 720
    });

    this.camera.start();
  }

  private onResults(results: Results): void {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      // Primary Hand
      const landmarks = results.multiHandLandmarks[0];
      const gesture = this.detectGesture(landmarks);
      const handCenter = this.getHandCenter(landmarks);

      // Secondary Hand (if any)
      let secondHandData = undefined;
      if (results.multiHandLandmarks.length > 1) {
        const landmarks2 = results.multiHandLandmarks[1];
        const center2 = this.getHandCenter(landmarks2);
        const gesture2 = this.detectGesture(landmarks2);
        secondHandData = {
          found: true,
          gesture: gesture2,
          position: center2
        };
      }

      this.emit({
        found: true,
        gesture: gesture,
        position: handCenter,
        secondHand: secondHandData,
        landmarks: landmarks
      });
    } else {
      this.emit({ found: false });
    }
  }

  private detectGesture(landmarks: any[]): 'OPEN' | 'CLOSED' | 'PINCH' | 'POINT' {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const palmCenter = landmarks[9];

    const pinchDist = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2)
    );

    const tips = [middleTip, ringTip, pinkyTip];
    let closedFingers = 0;
    tips.forEach(tip => {
      const distToPalm = Math.sqrt(
        Math.pow(tip.x - palmCenter.x, 2) + Math.pow(tip.y - palmCenter.y, 2)
      );
      if (distToPalm < 0.15) closedFingers++;
    });

    const indexDistToPalm = Math.sqrt(
      Math.pow(indexTip.x - palmCenter.x, 2) + Math.pow(indexTip.y - palmCenter.y, 2)
    );

    if (pinchDist < 0.05 && closedFingers <= 1) {
      return 'PINCH';
    }

    if (closedFingers >= 2) { // Allow slightly loose fist
      if (indexDistToPalm > 0.15) {
        return 'POINT';
      }
      if (indexDistToPalm < 0.12) {
        return 'CLOSED';
      }
    }

    return 'OPEN';
  }

  private getHandCenter(landmarks: any[]): { x: number; y: number; z: number } {
    const mcp = landmarks[9];
    return { x: mcp.x, y: mcp.y, z: mcp.z };
  }

  on(callback: (data: GestureData) => void): void {
    this.callbacks.push(callback);
  }

  private emit(data: GestureData): void {
    this.callbacks.forEach(cb => cb(data));
  }
}
