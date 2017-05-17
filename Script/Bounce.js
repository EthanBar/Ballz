"use strict";

function setup() {
    createCanvas(600, 400);
}

let xv = 0;
let yv = 0;
let x = 0;
let y = 0;
let velocity = 2;
let maxv = 3;
let friction = 1;
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
    fill(255);
    noStroke();
    if (keyIsDown(LEFT_ARROW))
        xv -= velocity;

    if (keyIsDown(RIGHT_ARROW))
        xv += velocity;

    if (keyIsDown(UP_ARROW))
        yv -= velocity;

    if (keyIsDown(DOWN_ARROW))
        yv += velocity;
    physics();
    if (logedin) {
        database.ref('Users/' + uid).set({
            display: username,
            x: x,
            y: y,
            size: circleSize
        });
        if (players) {
            for (let key in players) {
                if (!players.hasOwnProperty(key)) continue;
                let player = players[key];
                let multiX = player["x"];
                let multiY = player["y"];
                let multiSize = player["size"];

                ellipse(multiX, multiY, multiSize);

                if ((x > multiX - 15 && x < multiX - 15) && (y > multiY - 15 && y < multiY - 15)) {
                    if (circleSize > multiSize) {
                        circleSize += multiSize;
                    } if (circleSize < multiSize) {
                        circleSize = 10;
                        x = 0;
                        y = 0;
                    }
                }

            }
        }
    }


    ellipse(x, y, circleSize);
    fill(255, 255, 255, 80);
    ellipse(px, py, circleSize);
    ellipse(px2, py2, circleSize);
    px2 = px;
    py2 = py;
    px = x;
    py = y;
}