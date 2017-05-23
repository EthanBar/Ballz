const NONE = 0;
const SPEED = 1;
const ZOOM = 2;
const MAGNET = 3;
const GLITCH = 4;

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
            newvel.setMag(0);
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
            let sum = (PI * this.r * this.r) + (PI * other.r * other.r);
            // this.r += other.r;
            this.r = sqrt(sum / PI);
            if (other.powerUp === SPEED) speedCounter = 10;
            if (other.powerUp === ZOOM) zoomCounter = 8;
            if (other.powerUp === MAGNET) magnetCounter = 100;
            if (other.powerUp === MAGNET) glitchCounter = 20;
            return true;
        }
        return false;
    };

    this.renderPlayer = function () {
        fill(mycolor, 100, 100);
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    };

    this.render = function () {
        if (glitchCounter > 0) fill(Math.random() * 100, 100, 100);
        if (this.powerUp !== NONE) {
            getColor(this.powerUp);
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
    } else {
        fill(66, 100, 100);
    }
}

function getPowerUp() {
    let rnd = Math.random();
    if (rnd > 0.02) return NONE;
    if (rnd > 0.015) return MAGNET;
    if (rnd > 0.005) return SPEED;
    if (rnd > 0.002) return GLITCH;
    return ZOOM;
}