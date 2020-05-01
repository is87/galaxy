class Planet {
    constructor(distance, radius, planetType, yearLength, degree, name = "") {
        this.distance = distance;
        this.radius = radius;
        this.planetType = planetType;
        this.yearLength = yearLength;
        this.x = 0;
        this.y = 0;
        this.degree = degree;
        this.spin = 0;
        this.name = name;
        this.destroyed = false;
        this.health = this.radius;
        this.satellites = [];
        this.shield = false;
        var hasShield = rand(1, 10);
        if (hasShield == 10) this.shield = true;
    }

    update(starX, starY, timePassed) {
        if (this.destroyed == false) {
            this.degree = this.degree + (360 / this.yearLength) * timePassed;
            this.x = starX + xFromDegree(this.degree) * this.distance;
            this.y = starY + yFromDegree(this.degree) * this.distance;

            this.spin = this.spin + (360 / 5) * timePassed;

            context.beginPath();
            var screenPos = worldToScreen(this.x, this.y);

            var screenPosStar = worldToScreen(starX, starY);
            context.beginPath();
            context.arc(screenPosStar.x, screenPosStar.y, this.distance * GameArea.scale, 0, 2 * Math.PI);
            context.strokeStyle = "#222";
            context.stroke();

            if (this.shield) {
                context.shadowBlur = 5 * GameArea.scale;
                context.shadowColor = "lightblue";
                context.beginPath();
                context.arc(screenPos.x, screenPos.y, (this.radius + 10) * GameArea.scale, 0, 2 * Math.PI);
                context.strokeStyle = "lightblue";
                context.stroke();
                context.shadowBlur = 0;
            }


            if (this.name == "Earth") {
                context.save();
                context.translate(screenPos.x, screenPos.y);
                context.rotate(this.spin * Math.PI / 180);
                context.drawImage(earthImage, - (this.radius * GameArea.scale), - (this.radius * GameArea.scale), (this.radius * GameArea.scale) * 2, (this.radius * GameArea.scale) * 2);
                context.restore();

                var my_gradient = context.createLinearGradient(screenPos.x + xFromDegree(this.degree) * (this.radius * GameArea.scale), screenPos.y + yFromDegree(this.degree) * (this.radius * GameArea.scale), screenPos.x - xFromDegree(this.degree) * (this.radius * GameArea.scale), screenPos.y - yFromDegree(this.degree) * (this.radius * GameArea.scale));
                my_gradient.addColorStop(0.0, "#111111ff");
                my_gradient.addColorStop(0.8, "#11111100");
                context.beginPath();
                context.arc(screenPos.x, screenPos.y, (this.radius * GameArea.scale), 0, 2 * Math.PI, false);
                context.fillStyle = my_gradient;
                context.fill();
                //context.drawImage(image, screenPos.x - this.radius * GameArea.scale, screenPos.y - this.radius * GameArea.scale, this.radius * 2 * GameArea.scale, this.radius * 2 * GameArea.scale);
            }
            else if (this.name == "Mars") {
                context.save();
                context.translate(screenPos.x, screenPos.y);
                context.rotate(this.spin * Math.PI / 180);
                context.drawImage(marsImage, - (this.radius * GameArea.scale), - (this.radius * GameArea.scale), (this.radius * GameArea.scale) * 2, (this.radius * GameArea.scale) * 2);
                context.restore();

                var my_gradient = context.createLinearGradient(screenPos.x + xFromDegree(this.degree) * (this.radius * GameArea.scale), screenPos.y + yFromDegree(this.degree) * (this.radius * GameArea.scale), screenPos.x - xFromDegree(this.degree) * (this.radius * GameArea.scale), screenPos.y - yFromDegree(this.degree) * (this.radius * GameArea.scale));
                my_gradient.addColorStop(0.0, "#111111ff");
                my_gradient.addColorStop(0.8, "#11111100");
                context.beginPath();
                context.arc(screenPos.x, screenPos.y, (this.radius * GameArea.scale), 0, 2 * Math.PI, false);
                context.fillStyle = my_gradient;
                context.fill();
                //context.drawImage(image, screenPos.x - this.radius * GameArea.scale, screenPos.y - this.radius * GameArea.scale, this.radius * 2 * GameArea.scale, this.radius * 2 * GameArea.scale);
            } else {

                context.beginPath();
                context.arc(screenPos.x, screenPos.y, this.radius * GameArea.scale, 0, 2 * Math.PI, false);
                context.fillStyle = this.planetType;
                context.fill();
            }

            for (var j0 = 0; j0 < this.satellites.length; j0++) {
                this.satellites[j0].update(this.x, this.y, timePassed);
            }
        }
    }
}