export class AudioAnalyzer {
    private context: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    public isReady: boolean = false;

    async init(): Promise<void> {
        try {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 512; // Resolution
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.source = this.context.createMediaStreamSource(stream);
            this.source.connect(this.analyser);
            this.isReady = true;
        } catch (e) {
            console.error("Audio init failed:", e);
            this.isReady = false;
        }
    }

    getFeatures(): { bass: number; mid: number; treble: number } {
        if (!this.isReady || !this.analyser || !this.dataArray) {
            return { bass: 0, mid: 0, treble: 0 };
        }

        this.analyser.getByteFrequencyData(this.dataArray as unknown as Uint8Array);

        const length = this.dataArray.length;
        const bassRange = Math.floor(length * 0.1); // Low freq
        const midRange = Math.floor(length * 0.5);  // Mid freq

        let bassSum = 0;
        let midSum = 0;
        let trebleSum = 0;

        for (let i = 0; i < length; i++) {
            const val = this.dataArray[i] / 255.0;
            if (i < bassRange) bassSum += val;
            else if (i < midRange) midSum += val;
            else trebleSum += val;
        }

        return {
            bass: bassSum / bassRange,
            mid: midSum / (midRange - bassRange),
            treble: trebleSum / (length - midRange)
        };
    }

    dispose() {
        if (this.context) this.context.close();
        if (this.source) this.source.disconnect();
    }
}
