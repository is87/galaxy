class Laser {
    constructor(x, y, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.created = gameTime;
        this.active = true;
    }

    update(timePassed) {
        if (this.active) {
            if (currentSystem != null) {
                for (var z = 0; z < currentSystem.planets.length; z++) {
                    var pl = currentSystem.planets[z];
                    var dX = Math.abs(this.x - pl.x);
                    var dY = Math.abs(this.y - pl.y);
                    var dist = Math.sqrt(dX * dX + dY * dY);
                    if (dist < pl.radius) {
                        this.active = false;
                        pl.health -= 1;
                        if (pl.health <= 0) {
                            addToLog(currentSystem.planets[z].name + " destroyed");
                            currentSystem.planets.splice(z, 1);
                        }
                    }
                }
                var dX = Math.abs(this.x - currentSystem.x);
                var dY = Math.abs(this.y - currentSystem.y);
                var dist = Math.sqrt(dX * dX + dY * dY);
                if (dist < currentSystem.radius) {
                    this.active = false;
                }
            }
            this.x += this.speedX;
            this.y += this.speedY;

            var screenPos = worldToScreen(this.x, this.y);

            context.beginPath();
            context.fillStyle = "#f00";
            context.fillRect(screenPos.x - 1 * GameArea.scale, screenPos.y - 1 * GameArea.scale, 2 * GameArea.scale, 2 * GameArea.scale);
            if ((gameTime - this.created) > 2) lasers.shift();
        }
    }
}