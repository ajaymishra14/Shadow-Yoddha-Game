export class Input {
    constructor() {
        this.keys = new Set();
        this.pressed = new Set();

        window.addEventListener("keydown", event => {
            if (["Space", "ArrowUp", "Escape"].includes(event.code)) {
                event.preventDefault();
            }

            if (!this.keys.has(event.code)) {
                this.pressed.add(event.code);
            }

            this.keys.add(event.code);
        });

        window.addEventListener("keyup", event => {
            this.keys.delete(event.code);
        });

        // Mobile and tablet touch controls
        const canvas = document.getElementById("gameCanvas");

        if (canvas) {
            canvas.style.touchAction = "none";

            canvas.addEventListener("pointerdown", event => {
                if (event.pointerType === "touch") {
                    event.preventDefault();
                    this.pressed.add("Space");
                }
            });
        }

        window.addEventListener("blur", () => {
            this.keys.clear();
            this.pressed.clear();
        });
    }

    consume(key) {
        if (!this.pressed.has(key)) return false;

        this.pressed.delete(key);
        return true;
    }

    isPressed(key) {
        return this.keys.has(key);
    }
}
