export class Collision {

    static rectangle(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    static circleRectangle(circle, rectangle) {
        const closestX = Math.max(
            rectangle.x,
            Math.min(circle.x, rectangle.x + rectangle.width)
        );

        const closestY = Math.max(
            rectangle.y,
            Math.min(circle.y, rectangle.y + rectangle.height)
        );

        const dx = circle.x - closestX;
        const dy = circle.y - closestY;

        return (
            dx * dx + dy * dy <
            circle.radius * circle.radius
        );
    }
}
