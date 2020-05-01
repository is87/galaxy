class SolarSystem {
    constructor(x, y, radius, starType, name = "", planets = []) {
        this.x = x;
        this.y = y;
        this.discovered = false;
        //this.radius = radius;
        this.starType = starType;
        starCount[starType]++;
        this.radius = rand(starTypes[starType].minSize * sunSize, starTypes[starType].maxSize * sunSize);
        this.planets = planets;
        this.name = name;
        if (this.name == "") this.name = String.fromCharCode(rand(65, 90)) + String.fromCharCode(rand(65, 90)) + "-" + String.fromCharCode(rand(48, 57)) + String.fromCharCode(rand(48, 57)) + String.fromCharCode(rand(48, 57));
        if (planets.length == 0) {
            var amount = rand(1, 9);
            for (var k = 0; k < amount; k++) {
                planets.push(new Planet(200 * (k + 1) + this.radius, rand(10, 50), colors[rand(0, 5)], rand(20, 60), rand(1, 360), this.name + " " + latinCount[k]));
            }
        }
    }

    get area() {
        return this.calcArea();
    }

    get size() {
        return this.radius;
    }

    calcArea() {
        return this.radius * this.radius * Math.PI;
    }

    update(timePassed) {
        var screenPos = worldToScreen(this.x, this.y);
        context.beginPath();
        context.arc(screenPos.x, screenPos.y, this.radius * GameArea.scale, 0, 2 * Math.PI, false);
        context.fillStyle = starTypes[this.starType].color;
        context.shadowBlur = 50 * GameArea.scale;
        context.shadowColor = starTypes[this.starType].color;
        context.fill();
        context.shadowBlur = 0;
        if (GameArea.scale > 0.02) {
            for (var j = 0; j < this.planets.length; j++) {
                this.planets[j].update(this.x, this.y, timePassed);
            }
        }
    }
}