let canvas;
let context;
let secondsPassed;
let oldTimeStamp;
let totalTime = 0;
let fps;
let systemsDrawn;
let systems = [];
let lasers = [];
let latinCount = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
let shipLog = [];
let sunSize = 100;
let starCount = [0, 0, 0, 0, 0, 0, 0];
let lastMessage = "";
let GameArea = {};
GameArea.x = 0;
GameArea.y = 0;
GameArea.scale = 1;
let G = 2;
let currentSystem = null;
let previousSystem = null;
let shipSize = 5;
let shipEnergy = 100;
let shipShield = 100;
let shipCharging = false;
var gp;
let canPlaceProbe = true;
let backgroundStars = [];
var colors = ["green", "darkblue", "brown", "orange", "cyan", "purple"];
var starTypes = [
    { "type": "O", "color": "blue", "minSize": 6.6, "maxSize": 10 },
    { "type": "B", "color": "lightblue", "minSize": 1.8, "maxSize": 6.6 },
    { "type": "A", "color": "white", "minSize": 1.4, "maxSize": 1.8 },
    { "type": "F", "color": "lightyellow", "minSize": 1.15, "maxSize": 1.4 },
    { "type": "G", "color": "yellow", "minSize": 0.96, "maxSize": 1.15 },
    { "type": "K", "color": "orange", "minSize": 0.7, "maxSize": 0.96 },
    { "type": "M", "color": "red", "minSize": 0.4, "maxSize": 0.7 }
]
let earthImage = new Image();
earthImage.src = "planet21.png";
let marsImage = new Image();
marsImage.src = "planet02.png";

window.addEventListener("gamepadconnected", function (e) {
    gp = navigator.getGamepads()[e.gamepad.index];
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        gp.index, gp.id,
        gp.buttons.length, gp.axes.length);
    console.log(gp.buttons[12].pressed);
});

class Laser {
    constructor(x, y, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.created = totalTime;
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
            if ((totalTime - this.created) > 2000) lasers.shift();
        }
    }
}

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
        this.x += this.speedX;
        this.y += this.speedY;

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

                var my_gradient = context.createLinearGradient(screenPos.x+xFromDegree(this.degree) * (this.radius * GameArea.scale), screenPos.y+yFromDegree(this.degree) * (this.radius * GameArea.scale), screenPos.x-xFromDegree(this.degree) * (this.radius * GameArea.scale), screenPos.y-yFromDegree(this.degree) * (this.radius * GameArea.scale));
                my_gradient.addColorStop(0.0, "#000000ff");
                my_gradient.addColorStop(0.8, "#00000000");
                context.beginPath();
                context.arc(screenPos.x, screenPos.y, (this.radius * GameArea.scale)-1, 0, 2 * Math.PI, false);
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

                var my_gradient = context.createLinearGradient(screenPos.x+xFromDegree(this.degree) * (this.radius * GameArea.scale), screenPos.y+yFromDegree(this.degree) * (this.radius * GameArea.scale), screenPos.x-xFromDegree(this.degree) * (this.radius * GameArea.scale), screenPos.y-yFromDegree(this.degree) * (this.radius * GameArea.scale));
                my_gradient.addColorStop(0.0, "#000000ff");
                my_gradient.addColorStop(0.8, "#00000000");
                context.beginPath();
                context.arc(screenPos.x, screenPos.y, (this.radius * GameArea.scale)-1, 0, 2 * Math.PI, false);
                context.fillStyle = my_gradient;
                context.fill();
                //context.drawImage(image, screenPos.x - this.radius * GameArea.scale, screenPos.y - this.radius * GameArea.scale, this.radius * 2 * GameArea.scale, this.radius * 2 * GameArea.scale);
            }else{
                
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

window.onload = init;

function init() {
    canvas = document.createElement("canvas");
    canvas.width = window.innerWidth - 30;
    canvas.height = window.innerHeight - 30;
    context = canvas.getContext("2d");
    document.body.insertBefore(canvas, document.body.childNodes[0]);

    //background
    for (var i = 0; i < 2000; i++) {
        var starArr = [];
        starArr[0] = rand(0, canvas.width * 2) - canvas.width / 2;
        starArr[1] = rand(0, canvas.height) * 2 - canvas.height / 2;
        backgroundStars.push(starArr);
    }


    plans = [];
    plans.push(new Planet(300, 20, "yellow", rand(20, 60), rand(1, 360), "Mercury"));
    plans.push(new Planet(500, 20, "red", rand(20, 60), rand(1, 360), "Venus"));
    plans.push(new Planet(700, 50, "blue", rand(20, 60), rand(1, 360), "Earth"));
    plans.push(new Planet(900, 40, "red", rand(20, 60), rand(1, 360), "Mars"));
    plans.push(new Planet(1100, 80, "brown", rand(20, 60), rand(1, 360), "Jupiter"));
    plans.push(new Planet(1300, 70, "orange", rand(20, 60), rand(1, 360), "Saturn"));
    plans.push(new Planet(1500, 40, "brown", rand(20, 60), rand(1, 360), "Uranus"));
    plans.push(new Planet(1700, 40, "blue", rand(20, 60), rand(1, 360), "Neptune"));
    /*for(var s1 = 0; s1<10; s1++){
        for(var s2 = 0; s2 < 10; s2++){
            systems.push(new SolarSystem(s1*4000, s2*4000, rand(30, 70), "yellow"));
        }    
    }*/
    systems.push(new SolarSystem(-550, -550, 100, 4, "Sol", plans));
    for (var s = 0; s < 1000; s++) {
        aDegree = rand(0, 359);
        aDistance = rand(1000, 200000);
        aX = xFromDegree(aDegree) * aDistance;
        aY = yFromDegree(aDegree) * aDistance;
        //aX = rand(-100000, 100000);
        //aY = rand(-100000, 100000);
        tooClose = false;
        for (var t = 0; t < systems.length; t++) {
            if (Math.abs(aX - systems[t].x) < 5000 && Math.abs(aY - systems[t].y) < 5000) tooClose = true;
        }
        if (!tooClose) {
            var starSeed = rand(1, 1000);
            var thisType = 0;
            if (starSeed > 10) thisType = 1;
            if (starSeed > 40) thisType = 2;
            if (starSeed > 100) thisType = 3;
            if (starSeed > 150) thisType = 4;
            if (starSeed > 400) thisType = 5;
            if (starSeed > 600) thisType = 6;
            systems.push(new SolarSystem(aX, aY, rand(100, 150), thisType));
        }
    }
    debug(starCount);
    systems[0].planets[2].satellites.push(new Satellite(70, 2, 10, 0));
    ship = new Ship(0, 0, 0, 0, 180);
    /*systems.push(new SolarSystem(-1200, -3000, 30, "yellow"));
    systems.push(new SolarSystem(2000, 2000, 50, "red"));
    systems.push(new SolarSystem(2000, -1500, 40, "yellow"));
    systems.push(new SolarSystem(-2000, 500, 60, "yellow"));*/
    debug(screenToWorld(0, 0));
    debug(screenToWorld(canvas.width, canvas.height));


    window.addEventListener('keydown', function (e) {
        GameArea.keys = (GameArea.keys || []);
        GameArea.keys[e.keyCode] = true;
    })
    window.addEventListener('keyup', function (e) {
        GameArea.keys[e.keyCode] = false;
        if (e.keyCode == 67) canPlaceProbe = true;
    })
    // Start the first frame request
    window.requestAnimationFrame(gameLoop);
}

function rand(min, max) {
    var span = max - min + 1;
    return Math.floor(Math.random() * span) + min;
}

function toRadian(degree) {
    return (degree / 180) * Math.PI;
}

function xFromDegree(degree) {
    return Math.cos(toRadian(degree));
}

function yFromDegree(degree) {
    return Math.sin(toRadian(degree));
}

function calculateDistance(a, b) {
    var dX = Math.abs(a.x - b.x);
    var dY = Math.abs(a.y - b.y);
    var dist = Math.sqrt(dX * dX + dY * dY);
    return dist;
}

function worldToScreen(x, y) {
    coors = {};
    coors.x = (x - GameArea.x) * GameArea.scale + canvas.width / 2;
    coors.y = (y - GameArea.y) * GameArea.scale + canvas.height / 2;
    return coors;
}

function screenToWorld(x, y) {
    coors = {};
    coors.x = (x - canvas.width / 2) / GameArea.scale + GameArea.x;
    coors.y = (y - canvas.height / 2) / GameArea.scale + GameArea.y;
    return coors;
}

function gameLoop(timeStamp) {
    totalTime = timeStamp;
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    if (isNaN(secondsPassed)) secondsPassed = 0;
    oldTimeStamp = timeStamp;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    for (var i = 0; i < backgroundStars.length; i++) {
        context.fillRect(backgroundStars[i][0] - (GameArea.x / 1000), backgroundStars[i][1] - (GameArea.y / 1000), 0.5, 0.5);
    }

    GameArea.x = ship.x;
    GameArea.y = ship.y;
    //if(Math.sqrt(ship.speedX*ship.speedX+ship.speedY*ship.speedY) > 10) GameArea.scale = 0.4;
    //GameArea.scale = 1/Math.sqrt(ship.speedX*ship.speedX+ship.speedY*ship.speedY+1);
    /*if(Math.sqrt(ship.speedX*ship.speedX+ship.speedY*ship.speedY) < 10)GameArea.scale = 0.25;
    if(Math.sqrt(ship.speedX*ship.speedX+ship.speedY*ship.speedY) > 20)GameArea.scale = 0.1;
    if(Math.sqrt(ship.speedX*ship.speedX+ship.speedY*ship.speedY) > 40)GameArea.scale = 0.3;*/
    //draw();
    checkButtons();
    systemsDrawn = 0;
    previousSystem = currentSystem;
    currentSystem = null;
    for (i = 0; i < systems.length; i++) {
        if (systems[i].x > screenToWorld(0, 0).x - 2000 && systems[i].x < screenToWorld(canvas.width, canvas.height).x + 2000 && systems[i].y > screenToWorld(0, 0).y - 2000 && systems[i].y < screenToWorld(canvas, canvas.height).y + 2000) {
            systems[i].update(secondsPassed);
            systemsDrawn++;
            if (Math.abs(systems[i].x - ship.x) < 2000 && Math.abs(systems[i].y - ship.y) < 2000) currentSystem = systems[i];
        }

    }
    ship.update();
    for (i = 0; i < lasers.length; i++) {
        lasers[i].update(secondsPassed);
    }
    //sol.update();

    //showFPS(timeStamp);
    showCameraInfo();
    systemInfo();
    showLog();
    // Keep requesting new frames
    window.requestAnimationFrame(gameLoop);
}

function showFPS(timeStamp) {
    //Calculate the number of seconds passed
    //since the last frame
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;

    //Calculate fps
    fps = Math.round(1 / secondsPassed);

    //Draw number to the screen
    context.fillStyle = 'white';
    context.fillRect(0, 0, 60, 15);
    context.font = '10px Arial';
    context.fillStyle = 'black';
    context.fillText("FPS: " + fps, 10, 10);
}

function showCameraInfo() {

    //context.fillStyle = 'black';
    //var systemName = "";
    /*if (currentSystem != null) systemName = currentSystem.name;
    context.fillText("System: " + systemName, 10, 30);
    context.fillText("scale: " + GameArea.scale, 10, 45);*/
    context.fillStyle = '#222';
    context.fillRect(10, canvas.height - 200, 20, 100);
    context.shadowBlur = 5;
    context.shadowColor = "lightgreen";
    context.fillStyle = "lightgreen";
    var energy = 100;
    context.fillRect(10, canvas.height - (100 + ship.energy), 20, ship.energy);
    context.font = '10px Arial';
    context.fillText(Math.floor(ship.energy) + "%", 10, canvas.height - 85);
    context.shadowBlur = 0;

    context.fillStyle = '#222';
    context.fillRect(40, canvas.height - 200, 20, 100);
    context.shadowBlur = 5;
    context.shadowColor = "lightblue";
    context.fillStyle = "lightblue";
    var energy = 100;
    context.fillRect(40, canvas.height - (100 + ship.shield), 20, ship.shield);
    context.font = '10px Arial';
    context.fillText(Math.floor(ship.shield) + "%", 40, canvas.height - 85);
    context.shadowBlur = 0;

    context.fillStyle = 'white';
    context.font = '10px Arial';
    //context.fillText("Top Left: " + screenToWorld(0, 0).x + ", "+ screenToWorld(0, 0).y, 10, 60);
    //context.fillText("Bottom Right: " + screenToWorld(canvas.width, canvas.height).x + ", "+ screenToWorld(canvas.width, canvas.height).y, 10, 75);
    context.fillText("Systems drawn: " + systemsDrawn, 10, canvas.height - 45);
    context.fillText("Speed: " + ship.speed.toFixed(2), 10, canvas.height - 30);
    context.fillText(lastMessage, 10, canvas.height - 15);
}

function showLog() {
    var shownMessages = 3;
    if (shipLog.length < 3) shownMessages = shipLog.length;
    for (var i = 0; i < shownMessages; i++) {
        context.fillStyle = 'white';
        context.font = '15px Arial';
        if (totalTime - shipLog[i][1] < 10000) context.fillText(shipLog[i][0].substring(0, Math.floor((totalTime - shipLog[i][1]) / 50)), canvas.width / 2 - 100, canvas.height - 100 + i * 20);
        //context.fillText(Math.floor((totalTime-shipLog[i][1])/1000), canvas.width/2-100, canvas.height-100+i*20);
    }
}

function addToLog(message) {
    shipLog.unshift([message, totalTime]);
}

function systemInfo() {
    if (currentSystem != null) {
        grav = calculateGravity(ship, currentSystem);
        ship.speedX += grav[0];
        ship.speedY += grav[1];
        context.shadowBlur = 5;
        context.shadowColor = starTypes[currentSystem.starType].color;
        context.font = '40px Arial';
        context.fillStyle = 'white';
        context.fillText(currentSystem.name + " system", 20, 50);
        context.font = '20px Arial';
        context.fillText("Class " + starTypes[currentSystem.starType].type + " star", 20, 70);
        context.fillText("Size: " + (currentSystem.radius / sunSize).toFixed(2) + " solar radii", 20, 90);
        context.fillText("Number of planets: " + currentSystem.planets.length, 20, 110);
        //context.fillText(totalTime, 20, 130);
        context.font = '10px Arial';
        context.fillStyle = 'white';
        for (var i = 0; i < currentSystem.planets.length; i++) {
            context.fillText(currentSystem.planets[i].name, 20, 130 + i * 15);
        }
        context.shadowBlur = 0;
    }

    if (previousSystem == null && currentSystem != null) {
        if (currentSystem.discovered == false) {
            currentSystem.discovered = true;
            addToLog("New system discovered: " + currentSystem.name);
        }
        debug("new system");
        if (gp != undefined) {
            gp = navigator.getGamepads();
            var gamepad = gp[0];
            if (gamepad.vibrationActuator) {
                gamepad.vibrationActuator.playEffect("dual-rumble", {
                    duration: 300,
                    strongMagnitude: 1.0,
                    weakMagnitude: 1.0
                });
            }
        }
    }

}

function calculateGravity(obj1, obj2) {
    dX = Math.abs(obj2.x - obj1.x);
    dY = Math.abs(obj2.y - obj1.y);
    dist = Math.sqrt(dX * dX + dY * dY);
    gravity = obj1.size * obj2.size / (dist * dist) * G;
    gravityX = gravity * (dX / dist);
    if (obj1.x > obj2.x) gravityX *= -1;
    gravityY = gravity * (dY / dist);
    if (obj1.y > obj2.y) gravityY *= -1;

    grav = new Array(gravityX, gravityY);
    return grav;
}

function debug(info) {
    console.log(info);
}

function checkButtons() {
    var gpYWasPressed = false;
    if (gp != undefined) {
        if (gpY) gpYWasPressed = true;
    }

    gpup = false;
    gpdown = false;
    gpleft = false;
    gpright = false;
    gpA = false;
    gpB = false;
    gpX = false;
    gpY = false;
    gpR = false;
    gpR2 = false;
    gpL = false;

    if (gp != undefined) {
        gp = navigator.getGamepads();
        gpup = gp[0].buttons[12].pressed;
        gpdown = gp[0].buttons[13].pressed;
        gpleft = gp[0].buttons[14].pressed;
        gpright = gp[0].buttons[15].pressed;
        gpB = gp[0].buttons[0].pressed;
        gpA = gp[0].buttons[1].pressed;
        gpY = gp[0].buttons[2].pressed;
        gpX = gp[0].buttons[3].pressed;
        gpL = gp[0].buttons[4].pressed;
        gpR = gp[0].buttons[5].pressed;
        gpR2 = gp[0].buttons[7].pressed;


    }



    //if ((GameArea.keys && GameArea.keys[37])) { GameArea.x -= (2 / GameArea.scale); }
    //if ((GameArea.keys && GameArea.keys[39])) { GameArea.x += (2 / GameArea.scale); }
    //if ((GameArea.keys && GameArea.keys[38]) || gpup) { GameArea.y -= (2 / GameArea.scale); }
    //if ((GameArea.keys && GameArea.keys[40]) || gpdown) { GameArea.y += (2 / GameArea.scale); }
    if ((GameArea.keys && GameArea.keys[88]) || gpL) {
        if (GameArea.scale > 0.001) GameArea.scale *= 0.9;
    }
    if ((GameArea.keys && GameArea.keys[90]) || gpR) {
        if (GameArea.scale < 2) GameArea.scale *= 1.1;
    }
    if (GameArea.keys && GameArea.keys[37] || gpleft) ship.direction -= secondsPassed * 90;
    if (GameArea.keys && GameArea.keys[39] || gpright) ship.direction += secondsPassed * 90;
    if ((GameArea.keys && GameArea.keys[38] || gpB) && ship.energy > 0) {
        ship.changeEnergy(-secondsPassed * 5);
        ship.speedX += xFromDegree(ship.direction) * 5 * secondsPassed;
        ship.speedY += yFromDegree(ship.direction) * 5 * secondsPassed;
    } else {
        ship.speedX *= (1 - secondsPassed / 5);
        ship.speedY *= (1 - secondsPassed / 5);
        if (ship.speed < 0.01) {
            ship.speedX = 0;
            ship.speedY = 0;
        }
    }
    if (((GameArea.keys && GameArea.keys[32]) || gpA || gpR2) && ship.energy > 0) {
        las = new Laser(ship.x, ship.y, ship.speedX + xFromDegree(ship.direction) * 5, ship.speedY + yFromDegree(ship.direction) * 5);
        lasers.push(las);
        ship.changeEnergy(-0.1);
    }

    if ((GameArea.keys && GameArea.keys[67] && canPlaceProbe) || (gpY && gpYWasPressed == false)) {
        canPlaceProbe = false;
        if (currentSystem != null) {
            for (var i = 0; i < currentSystem.planets.length; i++) {
                if (calculateDistance(ship, currentSystem.planets[i]) < (currentSystem.planets[i].radius + 50)) {
                    currentSystem.planets[i].satellites.push(new Satellite(currentSystem.planets[i].radius + 20, 2, 5, 0));
                }
            }
        }
    }
    /*if(GameArea.keys && GameArea.keys[83]){
        ship.speedX += xFromDegree(ship.direction)*-2*secondsPassed;
        ship.speedY += yFromDegree(ship.direction)*-2*secondsPassed;
    }*/


}