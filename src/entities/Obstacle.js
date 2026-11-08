export class Obstacle {
    constructor(x, groundY, type) {
        this.x = x;
        this.type = type;

        const dimensions = {
            rock: { width: 38, height: 34 },
            hurdle: { width: 52, height: 48 },
            spikes: { width: 48, height: 32 }
        };

        const size = dimensions[type];

        this.width = size.width;
        this.height = size.height;
        this.y = groundY - this.height;
    }

    update(dt, speed) {
        this.x -= speed * dt;
    }

    getBounds() {
        return {
            x: this.x + 5,
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 5
        };
    }
}

export class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.animationTime = Math.random() * 5;
    }

    update(dt, speed) {
        this.x -= speed * dt;
        this.animationTime += dt;
    }
}
