import { CONFIG } from "../config.js";

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.groundOffset = 0;
    }

    clear() {
        const ctx = this.ctx;

        const gradient = ctx.createLinearGradient(
            0, 0, 0, CONFIG.HEIGHT
        );

        gradient.addColorStop(0, "#182333");
        gradient.addColorStop(1, "#303743");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    }

    drawBackground() {
        const ctx = this.ctx;

        // Moon
        ctx.fillStyle = "#e2b65b";
        ctx.beginPath();
        ctx.arc(790, 75, 24, 0, Math.PI * 2);
        ctx.fill();

        // Distant mountains
        ctx.fillStyle = "#252e3b";

        ctx.beginPath();
        ctx.moveTo(0, 280);
        ctx.lineTo(150, 155);
        ctx.lineTo(290, 280);
        ctx.lineTo(430, 185);
        ctx.lineTo(590, 280);
        ctx.lineTo(760, 160);
        ctx.lineTo(960, 280);
        ctx.lineTo(960, 335);
        ctx.lineTo(0, 335);
        ctx.fill();

        // Stars
        ctx.fillStyle = "#c6d1df";

        for (let i = 0; i < 35; i++) {
            const x = (i * 137 + 47) % CONFIG.WIDTH;
            const y = (i * 53 + 29) % 145;

            ctx.globalAlpha = 0.35 + (i % 3) * 0.2;
            ctx.fillRect(x, y, 2, 2);
        }

        ctx.globalAlpha = 1;
    }

    drawGround() {
        const ctx = this.ctx;
        const groundY = CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT;

        ctx.fillStyle = "#d6a84b";
        ctx.fillRect(0, groundY, CONFIG.WIDTH, 4);

        ctx.fillStyle = "#222a35";
        ctx.fillRect(
            0,
            groundY + 4,
            CONFIG.WIDTH,
            CONFIG.GROUND_HEIGHT
        );

        // Moving ground markings
        ctx.fillStyle = "#515966";

        for (let i = 0; i < 25; i++) {
            const x = (
                i * 65 - this.groundOffset % 65 + 960
            ) % 960;

            ctx.fillRect(x, groundY + 28, 27, 3);
        }
    }

    drawPlayer(player) {
        const ctx = this.ctx;
        const x = player.x;
        const y = player.y;
        const running = player.grounded;
        const phase = Math.sin(player.animationTime * 17);
        const airborne = !running;

        ctx.save();

        // Shadow aura
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#d4a017";
        ctx.shadowColor = "#d4a017";
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.ellipse(x + 23, y + 30, 29, 33, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Ground shadow
        ctx.fillStyle = "#08090d";
        ctx.globalAlpha = 0.38;
        ctx.beginPath();
        ctx.ellipse(x + 22, player.groundY + 2, 27, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Animated Shadow Yoddha cape
        const capeWave = Math.sin(player.animationTime * 11) * 7;
        const capeFlow = Math.cos(player.animationTime * 7) * 5;

        const capeGradient = ctx.createLinearGradient(
            x - 12, y + 15, x + 30, y + 58
        );
        capeGradient.addColorStop(0, "#34313b");
        capeGradient.addColorStop(0.45, "#111018");
        capeGradient.addColorStop(1, "#030407");

        ctx.fillStyle = capeGradient;
        ctx.beginPath();
        ctx.moveTo(x + 13, y + 18);
        ctx.quadraticCurveTo(
            x + 2, y + 30,
            x - 5 + capeWave, y + 45 + capeFlow
        );
        ctx.lineTo(x + 5 + capeWave, y + 52 + capeFlow);
        ctx.lineTo(x + 15, y + 43);
        ctx.lineTo(x + 24, y + 53 + capeWave * 0.4);
        ctx.lineTo(x + 34, y + 20);
        ctx.closePath();
        ctx.fill();

        // Flowing golden cape trim
        ctx.strokeStyle = "#bd913d";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 13, y + 20);
        ctx.quadraticCurveTo(
            x + 5, y + 34,
            x - 2 + capeWave, y + 47 + capeFlow
        );
        ctx.stroke();

        ctx.strokeStyle = "#70501e";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 17, y + 29);
        ctx.quadraticCurveTo(
            x + 15, y + 42,
            x + 24, y + 49 + capeWave * 0.4
        );
        ctx.stroke();

        // Legs
        ctx.lineCap = "round";
        ctx.lineWidth = 7;
        ctx.strokeStyle = "#17191f";
        ctx.beginPath();

        ctx.moveTo(x + 17, y + 43);
        ctx.lineTo(x + (airborne ? 10 : 14 + phase * 7), y + 56);

        ctx.moveTo(x + 29, y + 43);
        ctx.lineTo(x + (airborne ? 37 : 30 - phase * 7), y + 55);
        ctx.stroke();

        // Gold leg armor
        ctx.strokeStyle = "#bd913d";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 11, y + 50);
        ctx.lineTo(x + 18, y + 52);
        ctx.moveTo(x + 29, y + 49);
        ctx.lineTo(x + 36, y + 51);
        ctx.stroke();

        // Main torso armor
        const armor = ctx.createLinearGradient(x + 8, y + 18, x + 38, y + 46);
        armor.addColorStop(0, "#45434a");
        armor.addColorStop(0.45, "#17191f");
        armor.addColorStop(1, "#08090d");

        ctx.fillStyle = armor;
        ctx.beginPath();
        ctx.moveTo(x + 13, y + 18);
        ctx.lineTo(x + 32, y + 18);
        ctx.lineTo(x + 39, y + 43);
        ctx.lineTo(x + 9, y + 43);
        ctx.closePath();
        ctx.fill();

        // Gold chest armor outline
        ctx.strokeStyle = "#c59a45";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 13, y + 20);
        ctx.lineTo(x + 22, y + 25);
        ctx.lineTo(x + 32, y + 20);
        ctx.stroke();

        // Chest emblem
        ctx.fillStyle = "#d5a83f";
        ctx.beginPath();
        ctx.moveTo(x + 22, y + 26);
        ctx.lineTo(x + 27, y + 33);
        ctx.lineTo(x + 22, y + 39);
        ctx.lineTo(x + 17, y + 33);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#17191f";
        ctx.beginPath();
        ctx.arc(x + 22, y + 33, 2, 0, Math.PI * 2);
        ctx.fill();

        // Shoulder armor
        ctx.fillStyle = "#25252b";
        ctx.beginPath();
        ctx.arc(x + 12, y + 23, 7, Math.PI, Math.PI * 1.9);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + 34, y + 23, 7, Math.PI * 1.1, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#d0a34a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 12, y + 23, 6, Math.PI, Math.PI * 1.9);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x + 34, y + 23, 6, Math.PI * 1.1, Math.PI * 2);
        ctx.stroke();

        // Waist belt
        ctx.fillStyle = "#090a0d";
        ctx.fillRect(x + 10, y + 39, 27, 5);
        ctx.fillStyle = "#d5a83f";
        ctx.fillRect(x + 21, y + 39, 5, 5);

        // Neck
        ctx.fillStyle = "#a56e49";
        ctx.fillRect(x + 19, y + 14, 8, 8);

        // Face
        ctx.fillStyle = "#bd8965";
        ctx.beginPath();
        ctx.arc(x + 24, y + 12, 9, 0, Math.PI * 2);
        ctx.fill();

        // Helmet
        ctx.fillStyle = "#15171d";
        ctx.beginPath();
        ctx.arc(x + 24, y + 10, 11, Math.PI, Math.PI * 2);
        ctx.lineTo(x + 35, y + 12);
        ctx.lineTo(x + 13, y + 12);
        ctx.closePath();
        ctx.fill();

        // Helmet gold crest
        ctx.fillStyle = "#d5a83f";
        ctx.beginPath();
        ctx.moveTo(x + 24, y - 3);
        ctx.lineTo(x + 28, y + 6);
        ctx.lineTo(x + 24, y + 4);
        ctx.lineTo(x + 20, y + 6);
        ctx.closePath();
        ctx.fill();

        // Helmet forehead band
        ctx.strokeStyle = "#d5a83f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 14, y + 9);
        ctx.lineTo(x + 34, y + 9);
        ctx.stroke();

        // Glowing eye
        ctx.fillStyle = "#ffcf55";
        ctx.shadowColor = "#ffae00";
        ctx.shadowBlur = 12;
        ctx.fillRect(x + 29, y + 11, 4, 2);
        ctx.shadowBlur = 0;

        // Sword arm
        ctx.strokeStyle = "#bd8965";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x + 32, y + 25);
        ctx.lineTo(x + 38, y + 31);
        ctx.stroke();

        // Curved golden sword
        ctx.save();
        ctx.translate(x + 39, y + 32);
        const swordSwing = Math.sin(player.animationTime * 10) * 0.12;
        ctx.rotate(-0.35 + swordSwing);

        ctx.strokeStyle = "#d5a83f";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -8);
        ctx.stroke();

        ctx.strokeStyle = "#f1e0a2";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.quadraticCurveTo(13, -18, 9, -37);
        ctx.stroke();

        ctx.strokeStyle = "#a87a2e";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, -7);
        ctx.lineTo(5, -7);
        ctx.stroke();

        ctx.restore();

        // Shadow Power shockwave
        if (player.shadowPowerTime > 0) {
            const progress = 1 - player.shadowPowerTime / 0.7;
            const radius = 35 + progress * 190;
            const alpha = Math.max(0, 1 - progress);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = "#ffd45a";
            ctx.lineWidth = 7 - progress * 4;
            ctx.shadowColor = "#ffb800";
            ctx.shadowBlur = 30;

            ctx.beginPath();
            ctx.arc(
                x + player.width / 2,
                y + player.height / 2,
                radius,
                0,
                Math.PI * 2
            );
            ctx.stroke();

            ctx.restore();
        }

        // Golden sword attack slash
        if (player.attackTime > 0) {
            const progress = 1 - player.attackTime / 0.32;
            const slashAlpha = Math.sin(progress * Math.PI);

            ctx.save();
            ctx.globalAlpha = slashAlpha;
            ctx.translate(x + 40, y + 29);
            ctx.rotate(-0.45 + progress * 0.9);

            ctx.strokeStyle = "#fff0a0";
            ctx.lineWidth = 5;
            ctx.shadowColor = "#ffb800";
            ctx.shadowBlur = 22;

            ctx.beginPath();
            ctx.arc(0, 0, 49, -1.25, 0.85);
            ctx.stroke();

            ctx.strokeStyle = "#d5a83f";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 55, -1.2, 0.65);
            ctx.stroke();

            ctx.restore();
        }

        // Shadow energy sparks
        if (airborne) {
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = "#d5a83f";
            ctx.shadowColor = "#ffcc55";
            ctx.shadowBlur = 10;

            for (let i = 0; i < 3; i++) {
                const sparkX = x - 4 + ((player.animationTime * 45 + i * 13) % 17);
                const sparkY = y + 25 + i * 9;
                ctx.fillRect(sparkX, sparkY, 3, 3);
            }

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }

    drawObstacle(obstacle) {
        const ctx = this.ctx;
        const x = obstacle.x;
        const y = obstacle.y;

        ctx.save();

        if (obstacle.type === "rock") {
            ctx.fillStyle = "#9298a0";
            ctx.beginPath();
            ctx.moveTo(x, y + obstacle.height);
            ctx.lineTo(x + 5, y + 12);
            ctx.lineTo(x + 21, y);
            ctx.lineTo(x + 35, y + 9);
            ctx.lineTo(x + 38, y + obstacle.height);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#b6bbc1";
            ctx.fillRect(x + 12, y + 12, 8, 5);
        }

        if (obstacle.type === "hurdle") {
            ctx.fillStyle = "#a77c32";
            ctx.fillRect(x, y + 10, 52, 10);
            ctx.fillRect(x + 7, y + 17, 8, 31);
            ctx.fillRect(x + 38, y + 17, 8, 31);

            ctx.fillStyle = "#e2b65b";
            ctx.fillRect(x + 2, y + 10, 48, 3);
        }

        if (obstacle.type === "spikes") {
            ctx.fillStyle = "#c7ccd2";

            ctx.beginPath();
            ctx.moveTo(x, y + 32);
            ctx.lineTo(x + 12, y + 3);
            ctx.lineTo(x + 24, y + 32);
            ctx.lineTo(x + 36, y + 3);
            ctx.lineTo(x + 48, y + 32);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#737e8b";
            ctx.fillRect(x, y + 29, 48, 4);
        }

        ctx.restore();
    }

    drawCoin(coin) {
        const ctx = this.ctx;

        const pulse = 0.75 + Math.abs(
            Math.sin(coin.animationTime * 6)
        ) * 0.25;

        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.scale(pulse, 1);

        ctx.fillStyle = "#e2b65b";
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#fff0ad";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius - 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#8a601f";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", 0, 1);

        ctx.restore();
    }

    render(player, obstacles, coins, score, best, coinCount, speed, shadowEffects) {
        this.clear();
        this.drawBackground();

        this.groundOffset += speed / 60;

        this.drawGround();

        for (const coin of coins) {
            this.drawCoin(coin);
        }

        for (const obstacle of obstacles) {
            this.drawObstacle(obstacle);
        }

        this.drawPlayer(player);

        if (shadowEffects) {
            shadowEffects.draw(this.ctx);
        }

        const ctx = this.ctx;

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 15px Arial";
        ctx.textAlign = "left";
        ctx.fillText("BEST: " + best, 20, 30);

        ctx.fillStyle = "#e2b65b";
        ctx.fillText("COINS: " + coinCount, 20, 54);
    }
}
