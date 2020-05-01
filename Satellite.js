class Satellite {
    constructor(distance, radius, yearLength, degree) {
        this.distance = distance;
        this.radius = radius;
        this.yearLength = yearLength;
        this.x = 0;
        this.y = 0;
        this.degree = degree;
        this.destroyed = false;
        this.health = this.radius;
    }

    update(planetX, planetY, timePassed) {
        if (this.destroyed == false) {
            this.degree = this.degree + (360 / this.yearLength) * timePassed;
            this.x = planetX + xFromDegree(this.degree) * this.distance;
            this.y = planetY + yFromDegree(this.degree) * this.distance;

            context.beginPath();
            var screenPos = worldToScreen(this.x, this.y);

            var screenPosPlanet = worldToScreen(planetX, planetY);
            context.beginPath();
            context.arc(screenPosPlanet.x, screenPosPlanet.y, this.distance * GameArea.scale, 0, 2 * Math.PI);
            context.strokeStyle = "#151515";
            context.stroke();

            context.beginPath();
            context.arc(screenPos.x, screenPos.y, this.radius * GameArea.scale, 0, 2 * Math.PI, false);
            context.fillStyle = "#999";
            context.fill();
        }
    }
}