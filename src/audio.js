export class AudioManager {
    constructor(muted = false) {
        this.muted = muted;
        this.audioContext = null;
        this.sounds = {};
        this.initAudio();
    }
    
    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.generateSounds();
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }
    
    generateSounds() {
        // Generate flap sound - quick chirp
        this.sounds.flap = this.generateTone(300, 0.1, 'square', [
            { time: 0, frequency: 300, volume: 0.3 },
            { time: 0.05, frequency: 400, volume: 0.2 },
            { time: 0.1, frequency: 350, volume: 0 }
        ]);
        
        // Generate score sound - pleasant chime
        this.sounds.score = this.generateTone(500, 0.3, 'sine', [
            { time: 0, frequency: 500, volume: 0.2 },
            { time: 0.1, frequency: 600, volume: 0.3 },
            { time: 0.2, frequency: 800, volume: 0.2 },
            { time: 0.3, frequency: 1000, volume: 0 }
        ]);
        
        // Generate hit sound - harsh impact
        this.sounds.hit = this.generateNoise(0.4, [
            { time: 0, volume: 0.4, cutoff: 2000 },
            { time: 0.1, volume: 0.3, cutoff: 1000 },
            { time: 0.2, volume: 0.1, cutoff: 500 },
            { time: 0.4, volume: 0, cutoff: 100 }
        ]);
    }
    
    generateTone(frequency, duration, waveType, envelope) {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            
            // Calculate frequency and volume from envelope
            let freq = frequency;
            let volume = 0;
            
            for (let j = 0; j < envelope.length - 1; j++) {
                const current = envelope[j];
                const next = envelope[j + 1];
                
                if (time >= current.time && time <= next.time) {
                    const t = (time - current.time) / (next.time - current.time);
                    freq = current.frequency + (next.frequency - current.frequency) * t;
                    volume = current.volume + (next.volume - current.volume) * t;
                    break;
                }
            }
            
            // Generate wave
            const sample = time * freq * Math.PI * 2;
            let wave = 0;
            
            switch (waveType) {
                case 'sine':
                    wave = Math.sin(sample);
                    break;
                case 'square':
                    wave = Math.sign(Math.sin(sample));
                    break;
                case 'sawtooth':
                    wave = 2 * (sample / (2 * Math.PI) - Math.floor(sample / (2 * Math.PI) + 0.5));
                    break;
            }
            
            data[i] = wave * volume;
        }
        
        return buffer;
    }
    
    generateNoise(duration, envelope) {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            
            // Calculate volume and filter cutoff from envelope
            let volume = 0;
            let cutoff = 1000;
            
            for (let j = 0; j < envelope.length - 1; j++) {
                const current = envelope[j];
                const next = envelope[j + 1];
                
                if (time >= current.time && time <= next.time) {
                    const t = (time - current.time) / (next.time - current.time);
                    volume = current.volume + (next.volume - current.volume) * t;
                    cutoff = current.cutoff + (next.cutoff - current.cutoff) * t;
                    break;
                }
            }
            
            // Generate filtered white noise
            let noise = (Math.random() - 0.5) * 2;
            
            // Simple low-pass filter simulation
            const filterAmount = Math.min(cutoff / 5000, 1);
            noise *= filterAmount;
            
            data[i] = noise * volume;
        }
        
        return buffer;
    }
    
    playSound(soundName) {
        if (this.muted || !this.audioContext || !this.sounds[soundName]) return;
        
        try {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[soundName];
            source.connect(this.audioContext.destination);
            source.start();
        } catch (error) {
            console.warn('Failed to play sound:', error);
        }
    }
    
    playFlap() {
        this.playSound('flap');
    }
    
    playScore() {
        this.playSound('score');
    }
    
    playHit() {
        this.playSound('hit');
    }
    
    setMuted(muted) {
        this.muted = muted;
    }
    
    // Resume audio context on user interaction
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}