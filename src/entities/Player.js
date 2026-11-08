import { CONFIG } from "../config.js";

export class Player {
    constructor() {
        this.width = 42;
        this.height = 58;
        this.x = 125;
        this.groundY = CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT;
        this.y = this.groundY - this.height;

        this.velocityY = 0;
        this.gravity = 1900;
        this.jumpForce = -660;

        this.grounded = true;
        this.jumpsUsed = 0;
        this.maxJumps = 2;
        this.animationTime = 0;
    }

    jump() {
        if (this.jumpsUsed >= this.maxJumps) return false;

        this.jumpsUsed++;
        this.velocityY = this.jumpForce * (this.jumpsUsed === 2 ? 0.9 : 1);
        this.grounded = false;

        return true;
    }

    update(dt) {
        this.animationTime += dt;

        if (!this.grounded) {
            this.velocityY += this.gravity * dt;
            this.y += this.velocityY * dt;

            if (this.y + this.height >= this.groundY) {
                this.y = this.groundY - this.height;
                this.velocityY = 0;
                this.grounded = true;
                this.jumpsUsed = 0;
            }
        }
    }

    getBounds() {
        return {
            x: this.x + 7,
            y: this.y + 5,
            width: this.width - 13,
            height: this.height - 7
        };
    }
}
