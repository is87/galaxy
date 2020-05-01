class Ship {
    constructor(x = 0, y = 0, speedX = 0, speedY, direction = 0) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.direction = direction;
        this.size = shipSize;
        this.shield = 100;
        this.energy = 100;
        this.orbit = new Object();
        this.orbit.target = null;
        this.orbit.distance = null;
        this.orbit.degree = null;
        this.orbit.revolution = null;
    }

    get speed() {
        return Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
    }

    changeShield(nr) {
        this.shield += nr;
        if (this.shield > 100) this.shield = 100;
        if (this.shield < 0) this.shield = 0;
    }

    changeEnergy(nr) {
        this.energy += nr;
        if (this.energy > 100) this.energy = 100;
        if (this.energy < 0) this.energy = 0;
    }

    update(timePassed) {
        var wasShipCharging = shipCharging;
        shipCharging = false;
        if (currentSystem != null) {
            for (var z = 0; z < currentSystem.planets.length; z++) {
                var pl = currentSystem.planets[z];
                var dX = Math.abs(this.x - pl.x);
                var dY = Math.abs(this.y - pl.y);
                var dist = Math.sqrt(dX * dX + dY * dY);
                if (dist < pl.radius) {
                    this.changeShield(-10);
                    if (gp != undefined) {
                        gp = navigator.getGamepads();
                        var gamepad = gp[0];
                        if (gamepad.vibrationActuator) {
                            gamepad.vibrationActuator.playEffect("dual-rumble", {
                                duration: 500,
                                strongMagnitude: 1.0,
                                weakMagnitude: 0
                            });
                        }
                    }
                    var collisionDirection = Math.atan2(this.y - pl.y, this.x - pl.x) * 180 / Math.PI;
                    this.x += xFromDegree(collisionDirection) * 5;
                    this.y += yFromDegree(collisionDirection) * 5;
                    this.speedX = xFromDegree(collisionDirection) * 2;
                    this.speedY = yFromDegree(collisionDirection) * 2;
                }
            }
            var dX = Math.abs(this.x - currentSystem.x);
            var dY = Math.abs(this.y - currentSystem.y);
            var dist = Math.sqrt(dX * dX + dY * dY);
            if (dist < currentSystem.radius) {
                this.changeShield(-30);
                if (gp != undefined) {
                    gp = navigator.getGamepads();
                    var gamepad = gp[0];
                    if (gamepad.vibrationActuator) {
                        gamepad.vibrationActuator.playEffect("dual-rumble", {
                            duration: 1500,
                            strongMagnitude: 1.0,
                            weakMagnitude: 0
                        });
                    }
                }
                var collisionDirection = Math.atan2(this.y - currentSystem.y, this.x - currentSystem.x) * 180 / Math.PI;
                //this.x += xFromDegree(collisionDirection) * 5;
                //this.y += yFromDegree(collisionDirection) * 5;
                this.speedX = xFromDegree(collisionDirection) * 2;
                this.speedY = yFromDegree(collisionDirection) * 2;
            } else if (dist < currentSystem.radius + 200) {
                shipCharging = true;
                if (wasShipCharging == false) addToLog("Star is recharging ship's batteries");
                this.changeEnergy(secondsPassed * 5);
            }
        }
        if (this.orbit.target == null) {
            this.x += this.speedX;
            this.y += this.speedY;
        }else{
            this.orbit.degree = this.orbit.degree + (360 / this.orbit.revolution) * timePassed;
            //console.log(this.orbit.degree);
            //console.log(timePassed);
            this.x = this.orbit.target.x + xFromDegree(this.orbit.degree) * (this.orbit.target.radius + this.orbit.distance);
            this.y = this.orbit.target.y + yFromDegree(this.orbit.degree) * (this.orbit.target.radius + this.orbit.distance);
            this.direction = this.direction + (360 / this.orbit.revolution) * timePassed;
            //this.x = this.orbit.target.x + this.orbit.distance;
            //this.y = this.orbit.target.y + this.orbit.distance;
        }

        var screenPos = worldToScreen(this.x, this.y);

        //context.translate(screenPos.x, screenPos.y);
        //context.rotate(toRadian(this.direction));
        //context.translate(-screenPos.x, -screenPos.y);
        context.shadowBlur = 5 * GameArea.scale;
        context.shadowColor = "lightblue";
        context.beginPath();
        context.fillStyle = "#ccc";
        context.moveTo(screenPos.x + xFromDegree(this.direction + 0) * shipSize * GameArea.scale, screenPos.y + yFromDegree(this.direction + 0) * shipSize * GameArea.scale);
        context.lineTo(screenPos.x + xFromDegree(this.direction + 150) * shipSize * GameArea.scale, screenPos.y + yFromDegree(this.direction + 150) * shipSize * GameArea.scale);
        context.lineTo(screenPos.x + xFromDegree(this.direction + 210) * shipSize * GameArea.scale, screenPos.y + yFromDegree(this.direction + 210) * shipSize * GameArea.scale);
        context.fill();

        if (GameArea.scale < 0.3) {
            context.shadowBlur = 2;
            context.beginPath();
            //context.arc(screenPos.x, screenPos.y, 5, 0, 2 * Math.PI);
            context.moveTo(screenPos.x + xFromDegree(this.direction + 0) * 5, screenPos.y + yFromDegree(this.direction + 0) * 5);
            context.lineTo(screenPos.x + xFromDegree(this.direction + 150) * 5, screenPos.y + yFromDegree(this.direction + 150) * 5);
            context.lineTo(screenPos.x + xFromDegree(this.direction + 210) * 5, screenPos.y + yFromDegree(this.direction + 210) * 5);
            context.lineTo(screenPos.x + xFromDegree(this.direction + 0) * 5, screenPos.y + yFromDegree(this.direction + 0) * 5);
            context.strokeStyle = "lightblue";
            context.stroke();
        }
        context.shadowBlur = 0;
    }
}