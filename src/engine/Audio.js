export class AudioManager {
    constructor() {
        this.context = null;
        this.enabled = true;
    }

    unlock() {
        if (!this.enabled) return;

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

    tone(frequency, duration, type = "sine", volume = 0.08) {
        if (!this.enabled || !this.context) return;

        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const now = this.context.currentTime;

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + duration
        );

        oscillator.connect(gain);
        gain.connect(this.context.destination);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    jump() {
        this.tone(390, 0.12, "square", 0.045);
        setTimeout(() => this.tone(560, 0.09, "sine", 0.035), 65);
    }

    coin() {
        this.tone(750, 0.10, "sine", 0.055);
        setTimeout(() => this.tone(1050, 0.13, "sine", 0.04), 75);
    }

    collision() {
        this.tone(150, 0.35, "sawtooth", 0.07);
    }

    pause() {
        this.tone(300, 0.12, "sine", 0.035);
    }

    resume() {
        this.tone(520, 0.12, "sine", 0.035);
    }
}
