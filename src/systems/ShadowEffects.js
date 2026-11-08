export default class ShadowEffects {
    constructor() {
        this.particles = [];
    }

    burst(x, y, count = 18) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 45 + Math.random() * 150;

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 35,
                life: 0.65 + Math.random() * 0.3,
                maxLife: 0.95,
                size: 2 + Math.random() * 4
            });
        }
    }

    update(dt) {
        this.particles = this.particles.filter(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 180 * dt;
            p.life -= dt;

            return p.life > 0;
        });
    }

    draw(ctx) {
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillStyle = "#e2b65b";
            ctx.shadowColor = "#ffcc33";
            ctx.shadowBlur = 15;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
