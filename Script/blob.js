const NONE = 0;
const SPEED = 1;
const ZOOM = 2;
const MAGNET = 3;
const GLITCH = 4;
const BIG = 5;

let currentPower = NONE;

function Blob(x, y, r) {
    this.pos = createVector(x, y);
    this.r = r;
    this.vel = createVector(0, 0);
    this.powerUp = getPowerUp();

    this.update = function() {
        let newvel = createVector(mouseX - width/2, mouseY - height/2);
        let speedMulti = 1;
        if (speedCounter > 0) speedMulti = 2;
        if (newvel.mag() < zoomScale) {
            newvel.setMag(1);
        } else {
            newvel.setMag(Math.max(playerSpeed * 2 - player.r * 0.03, playerSpeed) * speedMulti);
        }
        this.vel.lerp(newvel, 0.2);
        let addedPos = p5.Vector.add(this.pos, newvel);
        if (addedPos.y < -worldBorder + this.r) {
            this.vel.y = 0;
            hitBorder = true;
            this.pos.y = -worldBorder + this.r;
        }
        if (addedPos.y > worldBorder - this.r) {
            this.vel.y = 0;
            hitBorder = true;
            this.pos.y = worldBorder - this.r;
        }
        if (addedPos.x < -worldBorder + this.r) {
            this.vel.x = 0;
            hitBorder = true;
            this.pos.x = -worldBorder + this.r;
        }
        if (addedPos.x > worldBorder - this.r) {
            this.vel.x = 0;
            hitBorder = true;
            this.pos.x = worldBorder - this.r;
        }
        this.pos.add(this.vel);
    };

    this.eats = function (other) {
        let radiusTotal = this.r + other.r;
        if (this.pos.x - other.pos.x > radiusTotal) return false;
        if (this.pos.y - other.pos.y > radiusTotal) return false;
        let d = p5.Vector.dist(this.pos, other.pos);
        if (Math.abs(d) < radiusTotal) {
            // this.r += other.r;
            if (other.powerUp === SPEED) speedCounter = 12;
            if (other.powerUp === ZOOM) zoomCounter = 8;
            if (other.powerUp === MAGNET) magnetCounter = 50;
            if (other.powerUp === GLITCH) glitchCounter = 8;
            if (other.powerUp === BIG) {
                let sum = (PI * this.r * this.r) + (PI * other.r * other.r) * 20;
                this.r = sqrt(sum / PI);
            } else {
                let sum = (PI * this.r * this.r) + (PI * other.r * other.r);
                this.r = sqrt(sum / PI);
            }
            return true;
        }
        return false;
    };

    this.renderPlayer = function () {
        if (player.r < 0) respawn(); // Respawn if mass less than 0

        // Display player
        if (glitchCounter > 0) {
            fill(Math.random() * 100, 100);
        } else fill(mycolor, 100, 100);
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);

        // Display hover text
        textSize(this.r / 2);
        fill(0);
        textAlign(CENTER, CENTER);
        if (glitchCounter > 0 ) {
            text((username.substr(0, username.indexOf(" "))).split('').sort(function(){return 0.5-Math.random()}).join(''), this.pos.x, this.pos.y);
        } else text(username.substr(0, username.indexOf(" ")), this.pos.x, this.pos.y);
    };

    this.render = function () {
        if (glitchCounter > 0) fill(Math.random() * 100, 100, 100);
        if (this.powerUp !== currentPower) {
            getColor(this.powerUp);
            currentPower = this.powerUp;
        }
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    };
}

function getColor(x) {
    if (x === ZOOM) {
        fill(33, 100, 100);
    } else if (x === MAGNET) {
        fill(72, 100, 100);
    } else if (x === GLITCH) {
        fill(48, 100, 100);
    } else if (x === BIG) {
        fill(0, 100, 100);
    } else {
        fill(66, 100, 100);
    }
}

function getPowerUp() { // OPT: Clear
    let rnd = Math.random();
    if (rnd > 0.015) return NONE;
    if (rnd > 0.01) return BIG;
    if (rnd > 0.005) return SPEED;
    if (rnd > 0.003) return MAGNET;
    if (rnd > 0.0015) return ZOOM;
    return GLITCH;
}