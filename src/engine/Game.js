import { CONFIG } from "../config.js";
import { Renderer } from "./Renderer.js";
import { Input } from "./Input.js";
import { Player } from "../entities/Player.js";
import { Obstacle, Coin } from "../entities/Obstacle.js";
import { Collision } from "../systems/Collision.js";
import { Score } from "../systems/Score.js";
import { AudioSystem } from "../systems/Audio.js";
import ShadowEffects from "../systems/ShadowEffects.js";

export class Game {
    constructor(canvas, callbacks = {}) {
        this.renderer = new Renderer(canvas);
        this.input = new Input();
        this.callbacks = callbacks;
        this.audio = new AudioSystem();
        this.shadowEffects = new ShadowEffects();
        this.player = new Player();
        this.score = new Score();
        this.obstacles = [];
        this.coins = [];
        this.running = false;
        this.paused = false;
        this.lastTime = 0;
        this.speed = 330;
        this.obstacleTimer = 1.2;
        this.coinTimer = 1.5;
        this.attackRequested = false;
        this.shadowPowerRequested = false;
        this.shadowPowerCooldown = 0;
        this.shadowPowerTime = 0;
        this.attackHandler = (event) => {
            if (event.code === "KeyQ") {
                if (!event.repeat) this.shadowPowerRequested = true;
            }

            if (event.code === "KeyX" || event.code === "KeyJ") {
                if (!event.repeat) this.attackRequested = true;
            }
        };
        window.addEventListener("keydown", this.attackHandler);

        this.frame = this.frame.bind(this);
    }

    start() {
        this.audio.unlock();

        this.player = new Player();
        this.shadowEffects = new ShadowEffects();
        this.score.reset();
        this.obstacles = [];
        this.coins = [];
        this.speed = 330;
        this.obstacleTimer = 1.2;
        this.coinTimer = 1.5;
        this.running = true;
        this.paused = false;
        this.lastTime = 0;

        this.callbacks.onStats?.(this.getStats());
        requestAnimationFrame(this.frame);
    }

    getStats() {
        return {
            score: this.score.current,
            best: this.score.best,
            coins: this.score.coins
        };
    }

    gameOver() {
        if (!this.running) return;

        this.audio.collision();
        this.audio.gameOver();

        this.running = false;
        this.paused = false;
        this.callbacks.onGameOver?.(this.getStats());
    }

    update(dt) {
        if (this.input.consume("Escape")) {
            this.paused = !this.paused;

            if (this.paused) {
                this.audio.pause();
            } else {
                this.audio.resume();
            }

            this.callbacks.onPause?.(this.paused);
        }

        if (this.paused) {
            if (this.input.consume("Space")) {
                this.paused = false;
                this.audio.resume();
                this.callbacks.onPause?.(false);
            }
            return;
        }

        if (
            this.input.consume("Space") ||
            this.input.consume("ArrowUp")
        ) {
            if (this.player.jump()) {
                this.audio.jump();
                this.shadowEffects.burst(
                    this.player.x + this.player.width / 2,
                    this.player.y + this.player.height
                );
            }
        }

        this.score.update(dt);

        this.speed = Math.min(
            330 + this.score.current * 0.45,
            720
        );

        const wasGrounded = this.player.grounded;
        this.player.update(dt);

        this.shadowPowerCooldown = Math.max(0, this.shadowPowerCooldown - dt);
        this.shadowPowerTime = Math.max(0, this.shadowPowerTime - dt);

        if (this.shadowPowerRequested) {
            if (this.shadowPowerCooldown <= 0) {
                this.shadowPowerTime = 0.7;
                this.shadowPowerCooldown = 5;

                this.shadowEffects.burst(
                    this.player.x + this.player.width / 2,
                    this.player.y + this.player.height / 2,
                    36
                );
            }
            this.shadowPowerRequested = false;
        }

        if (this.attackRequested) {
            this.player.attackTime = 0.32;
            this.attackRequested = false;
        }

        this.player.attackTime = Math.max(
            0,
            (this.player.attackTime || 0) - dt
        );

        if (!wasGrounded && this.player.grounded) {
            this.shadowEffects.burst(
                this.player.x + this.player.width / 2,
                this.player.groundY,
                22
            );
        }

        this.shadowEffects.update(dt);

        const groundY = CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT;

        this.obstacleTimer -= dt;

        if (this.obstacleTimer <= 0) {
            const types = ["rock", "hurdle", "spikes"];
            const type = types[
                Math.floor(Math.random() * types.length)
            ];

            this.obstacles.push(
                new Obstacle(CONFIG.WIDTH + 20, groundY, type)
            );

            this.obstacleTimer = 1.15 + Math.random() * 0.95;
        }

        this.coinTimer -= dt;

        if (this.coinTimer <= 0) {
            const coinY = groundY - (75 + Math.random() * 85);

            this.coins.push(
                new Coin(CONFIG.WIDTH + 20, coinY)
            );

            this.coinTimer = 1.4 + Math.random() * 1.4;
        }

        for (const obstacle of this.obstacles) {
            obstacle.update(dt, this.speed);

            if (
                this.shadowPowerTime > 0 &&
                obstacle.x > this.player.x - 100 &&
                obstacle.x < this.player.x + 260
            ) {
                obstacle.destroyed = true;
                this.shadowEffects.burst(
                    obstacle.x + obstacle.width / 2,
                    obstacle.y + obstacle.height / 2,
                    18
                );
                continue;
            }

            if (
                this.player.attackTime > 0 &&
                obstacle.x > this.player.x &&
                obstacle.x < this.player.x + this.player.width + 85
            ) {
                obstacle.destroyed = true;
                this.shadowEffects.burst(
                    obstacle.x + obstacle.width / 2,
                    obstacle.y + obstacle.height / 2,
                    12
                );
                continue;
            }

            if (
                Collision.rectangle(
                    this.player.getBounds(),
                    obstacle.getBounds()
                )
            ) {
                this.gameOver();
                return;
            }
        }

        this.obstacles = this.obstacles.filter(
            obstacle => !obstacle.destroyed && obstacle.x + obstacle.width > 0
        );

        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];

            coin.update(dt, this.speed);

            if (
                Collision.circleRectangle(
                    coin,
                    this.player.getBounds()
                )
            ) {
                this.score.collectCoin();
                this.audio.coin();
                this.coins.splice(i, 1);
            } else if (coin.x + coin.radius < 0) {
                this.coins.splice(i, 1);
            }
        }

        this.callbacks.onStats?.(this.getStats());
    }

    render() {
        this.renderer.render(
            this.player,
            this.obstacles,
            this.coins,
            this.score.current,
            this.score.best,
            this.score.coins,
            this.speed,
            this.shadowEffects
        );
    }

    frame(timestamp) {
        if (!this.running) return;

        const dt = this.lastTime === 0
            ? 0
            : Math.min((timestamp - this.lastTime) / 1000, 0.05);

        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        if (this.running) {
            requestAnimationFrame(this.frame);
        }
    }
}
