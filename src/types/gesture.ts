export interface GestureData {
  found: boolean;
  gesture?: 'OPEN' | 'CLOSED' | 'PINCH' | 'POINT';
  position?: {
    x: number;
    y: number;
    z: number;
  };
  secondHand?: {
    position: { x: number, y: number, z: number };
    found: boolean;
    gesture?: 'OPEN' | 'CLOSED' | 'PINCH' | 'POINT';
  };
  landmarks?: any[];
}

export type ParticleMode = 'HEART' | 'GALAXY' | 'SOLAR' | 'DNA' | 'TEXT';
