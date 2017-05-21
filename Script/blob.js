function Blob(x, y, r) {
    this.pos = createVector(x, y);
    this.r = r;
    this.vel = createVector(0, 0);

    this.update = function() {
        let newvel = createVector(mouseX - width/2, mouseY - height/2);
        newvel.setMag(Math.max(15 - this.r * 0.01, 5));
        this.vel.lerp(newvel, 0.2);
        this.pos.add(this.vel);
    };

    this.eats = function (other) {
        let d = p5.Vector.dist(this.pos, other.pos);
        // let d = (this.pos.x - other.pos.x) + (this.pos.y - other.pos.y);
        if (Math.abs(d) < this.r + other.r) {
            let sum = (PI * this.r * this.r) + (PI * other.r * other.r);
            this.r = sqrt(sum / PI);
            // this.r += other.r;
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