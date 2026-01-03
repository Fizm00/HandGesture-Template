export type VoiceCommandCallback = (command: string, type: 'MODE' | 'COLOR') => void;

export class VoiceControl {
    private recognition: any;
    private isListening: boolean = false;
    private onCommand: VoiceCommandCallback | null = null;
    private silenceTimer: any = null;

    constructor() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new window.webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event: any) => {
                const last = event.results.length - 1;
                const transcript = event.results[last][0].transcript.trim().toLowerCase();
                this.processCommand(transcript);
                this.resetSilenceTimer();
            };

            this.recognition.onerror = (event: any) => {
                if (event.error === 'not-allowed') {
                    this.stop();
                }
            };

            this.recognition.onend = () => {
                if (this.isListening) {
                    try {
                        this.recognition.start();
                    } catch {
                    }
                }
            };
        } else {
            console.warn('Web Speech API not supported');
        }
    }

    setCallback(cb: VoiceCommandCallback) {
        this.onCommand = cb;
    }

    start() {
        if (!this.recognition) return;
        this.isListening = true;
        try {
            this.recognition.start();
        } catch {
        }
    }

    stop() {
        if (!this.recognition) return;
        this.isListening = false;
        this.recognition.stop();
    }

    toggle() {
        if (this.isListening) this.stop();
        else this.start();
        return !this.isListening;
    }

    isActive() {
        return this.isListening;
    }

    private processCommand(text: string) {
        if (!this.onCommand) return;

        if (text.includes('heart') || text.includes('love')) this.onCommand('HEART', 'MODE');
        else if (text.includes('galaxy') || text.includes('spiral')) this.onCommand('GALAXY', 'MODE');
        else if (text.includes('solar') || text.includes('system') || text.includes('planet')) this.onCommand('SOLAR', 'MODE');
        else if (text.includes('dna') || text.includes('genetic')) this.onCommand('DNA', 'MODE');
        else if (text.includes('chaos') || text.includes('storm')) this.onCommand('OPEN', 'MODE');

        else if (text.includes('red') || text.includes('crimson')) this.onCommand('0xff0000', 'COLOR');
        else if (text.includes('blue') || text.includes('cyan') || text.includes('azure')) this.onCommand('0x00ffff', 'COLOR');
        else if (text.includes('green') || text.includes('emerald')) this.onCommand('0x00ff00', 'COLOR');
        else if (text.includes('yellow') || text.includes('gold')) this.onCommand('0xffff00', 'COLOR');
        else if (text.includes('white') || text.includes('bright')) this.onCommand('0xffffff', 'COLOR');
        else if (text.includes('purple') || text.includes('violet')) this.onCommand('0x9900ff', 'COLOR');
        else if (text.includes('orange')) this.onCommand('0xff8800', 'COLOR');
        else if (text.includes('pink')) this.onCommand('0xff0088', 'COLOR');
    }

    private resetSilenceTimer() {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
    }
}
