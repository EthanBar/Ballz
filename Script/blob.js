function Blob(x, y, r) {
    this.pos = createVector(x, y);
    this.r = r;
    this.vel = createVector(0, 0);

    this.update = function() {
        let newvel = createVector(mouseX - width/2, mouseY - height/2);
        if (newvel.mag() < zoomScale) {
            newvel.setMag(0);
        } else {
            newvel.setMag(Math.max(15 - player.r * 0.005, 10));
        }
        this.vel.lerp(newvel, 0.2);
        let addedPos = p5.Vector.add(this.pos, newvel);
        if (addedPos.y < -worldBorder + this.r) {
            this.vel.y = 0;
            this.pos.y = -worldBorder + this.r;
        }
        if (addedPos.y > worldBorder - this.r) {
            this.vel.y = 0;
            this.pos.y = worldBorder - this.r;
        }
        if (addedPos.x < -worldBorder + this.r) {
            this.vel.x = 0;
            this.pos.x = -worldBorder + this.r;
        }
        if (addedPos.x > worldBorder - this.r) {
            this.vel.x = 0;
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
            this.r = sqrt(sum / PI);
            return true;
        }
        return false;
    };

    this.renderPlayer = function () {
        fill(mycolor, 100, 100);
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    };

    this.render = function () {
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    };
}