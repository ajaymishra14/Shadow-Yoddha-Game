export class AudioSystem {
    constructor() {
        this.context = null;
        this.muted = false;
    }

    unlock() {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        if (!this.context) {
            this.context = new AudioContextClass();
        }

        if (this.context.state === "suspended") {
            this.context.resume();
        }
    }

    tone(frequency, duration, type = "sine", volume = 0.04,
         delay = 0, endFrequency = null) {
        if (!this.context || this.muted) return;

        const now = this.context.currentTime + delay;
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now);

        if (endFrequency !== null) {
            oscillator.frequency.exponentialRampToValueAtTime(
                Math.max(1, endFrequency),
                now + duration
            );
        }

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        oscillator.connect(gain);
        gain.connect(this.context.destination);

        oscillator.start(now);
        oscillator.stop(now + duration + 0.02);
    }

    jump() {
        this.tone(390, 0.12, "square", 0.035, 0, 620);
        this.tone(620, 0.09, "sine", 0.025, 0.08, 800);
    }

    coin() {
        this.tone(740, 0.10, "sine", 0.045);
        this.tone(990, 0.14, "sine", 0.04, 0.09);
        this.tone(1250, 0.12, "sine", 0.025, 0.17);
    }

    collision() {
        this.tone(180, 0.28, "sawtooth", 0.055, 0, 55);
    }

    gameOver() {
        this.tone(420, 0.22, "triangle", 0.04, 0, 300);
        this.tone(300, 0.28, "triangle", 0.04, 0.23, 190);
        this.tone(190, 0.45, "sawtooth", 0.025, 0.51, 85);
    }

    pause() {
        this.tone(380, 0.12, "sine", 0.03, 0, 250);
    }

    resume() {
        this.tone(300, 0.10, "sine", 0.03, 0, 520);
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
}
