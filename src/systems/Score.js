const STORAGE_KEY = "offlineRunnerBestScore";

export class Score {
    constructor() {
        this.current = 0;
        this.coins = 0;
        this.elapsed = 0;

        this.best = this.loadBest();
    }

    loadBest() {
        try {
            const value = Number(localStorage.getItem(STORAGE_KEY));
            return Number.isFinite(value) && value >= 0 ? value : 0;
        } catch {
            return 0;
        }
    }

    reset() {
        this.current = 0;
        this.coins = 0;
        this.elapsed = 0;
    }

    update(dt) {
        this.elapsed += dt;

        const distancePoints = Math.floor(this.elapsed * 10);

        this.current = distancePoints + this.coins * 50;

        this.saveNewRecord();
    }

    collectCoin() {
        this.coins++;
        this.current = Math.floor(this.elapsed * 10) + this.coins * 50;

        this.saveNewRecord();
    }

    saveNewRecord() {
        if (this.current <= this.best) return;

        this.best = this.current;

        try {
            localStorage.setItem(STORAGE_KEY, String(this.best));
        } catch (error) {
            console.warn("Unable to save high score:", error);
        }
    }
}
