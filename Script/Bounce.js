function setup() {
    createCanvas(600, 400);
}

let xv = 0;
let yv = 0;
let x = 0;
let y = 0;
let velocity = 2;
let maxv = 3;
let friction = 0.3;
let px, py;
let px2, py2;
let circleSize = 35;

let players;

function physics() {
    if (xv > 0) {
        xv -= friction;
        if (xv < 0) {
            xv = 0;
        }
    } else {
        xv += friction;
        if (xv > 0) {
            xv = 0;
        }
    }
    if (yv > 0) {
        yv -= friction;
        if (yv < 0) {
            yv = 0;
        }
    } else {
        yv += friction;
        if (yv > 0) {
            yv = 0;
        }
    }

    if (xv > maxv) {
        xv = maxv;
    } else if (xv < -maxv) {
        xv = -maxv
    }
    if (yv > maxv) {
        yv = maxv;
    } else if (yv < -maxv) {
        yv = -maxv
    }

    x += xv;
    y += yv;
}

function draw() {
    background(0);
    if (keyIsDown(LEFT_ARROW))
        xv -= velocity;

    if (keyIsDown(RIGHT_ARROW))
        xv += velocity;

    if (keyIsDown(UP_ARROW))
        yv -= velocity;

    if (keyIsDown(DOWN_ARROW))
        yv += velocity;
    physics();
    noStroke();
    fill(255);
    ellipse(x, y, circleSize);
    fill(255, 255, 255, 80);
    ellipse(px, py, circleSize);
    ellipse(px2, py2, circleSize);
    px2 = px;
    py2 = py;
    px = x;
    py = y;

    if (logedin) {
        database.ref('Users/' + uid).set({
            display: username,
            x: x,
            y: y
        });
        if (players) {
            for (let key in players) {
                if (!players.hasOwnProperty(key)) continue;
                let player = players[key];
                ellipse(player["x"], player["y"], 20, 20);
            }
        }
    }
}