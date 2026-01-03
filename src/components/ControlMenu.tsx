import * as THREE from 'three';
import type { ParticleMode } from '../types/gesture';

interface ControlMenuProps {
    currentMode: ParticleMode;
    onModeChange: (mode: ParticleMode) => void;
    onColorChange: (color: THREE.Color) => void;
}

export default function ControlMenu({ currentMode, onModeChange, onColorChange }: ControlMenuProps) {
    const handleColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        onColorChange(new THREE.Color(hex));
    };

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <div className="backdrop-blur-md bg-black/30 border border-white/10 rounded-xl px-2 py-2 shadow-2xl">
                <nav className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-1">
                        <ModeButton
                            label="Heart"
                            active={currentMode === 'HEART'}
                            onClick={() => onModeChange('HEART')}
                        />
                        <ModeButton
                            label="Galaxy"
                            active={currentMode === 'GALAXY'}
                            onClick={() => onModeChange('GALAXY')}
                        />
                        <ModeButton
                            label="Solar"
                            active={currentMode === 'SOLAR'}
                            onClick={() => onModeChange('SOLAR')}
                        />
                        <ModeButton
                            label="DNA"
                            active={currentMode === 'DNA'}
                            onClick={() => onModeChange('DNA')}
                        />
                    </div>

                    <div className="w-px h-6 bg-white/10" />

                    <ColorPicker onColorChange={handleColorInput} />
                </nav>
            </div>
        </div>
    );
}

interface ModeButtonProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

function ModeButton({ label, active, onClick }: ModeButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
        relative px-5 py-2 rounded-lg text-xs font-medium uppercase tracking-wider
        transition-all duration-200
        ${active
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }
      `}
            aria-label={label}
        >
            {label}

            {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-px bg-white" />
            )}
        </button>
    );
}

interface ColorPickerProps {
    onColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ColorPicker({ onColorChange }: ColorPickerProps) {
    return (
        <label className="group relative flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all duration-200 hover:bg-white/5 rounded-lg">
            <div className="relative w-5 h-5 rounded border border-white/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600" />
            </div>

            <span className="text-xs font-medium uppercase tracking-wider text-white/50 group-hover:text-white/80 transition-colors duration-200">
                Color
            </span>

            <input
                type="color"
                defaultValue="#00ffff"
                onChange={onColorChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
        </label>
    );
}