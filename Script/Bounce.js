"use strict";

const width = 1000;
const height = 600;

function setup() {
    createCanvas(width, height);
    textAlign(CENTER);
}

Array.prototype.contains = function(element){
    return this.indexOf(element) > -1;
};

let xv = 0;
let yv = 0;
let x = 0;
let y = 0;
let velocity = 2;
let maxv = 3;
let friction = 1;
let px, py;
let px2, py2;
let circleSize = Math.round(Math.random() * 10);

let players;
let recentlyEaten = {};

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
    background(255);
    maxv = -Math.sqrt(circleSize / 10) + 3;
    if (maxv < 1) {
        maxv = 1;
    }
    fill(0);
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
            uid: uid,
            x: Math.round(x),
            y: Math.round(y),
            size: Math.round(circleSize)
        });
        if (players) {
            for (let key in players) {
                if (!players.hasOwnProperty(key)) continue;
                let player = players[key];
                let multiUid = player["uid"];
                let multiSize = player["size"];
                if (multiUid == uid) {
                    circleSize = multiSize;
                }
                let multiName = player["display"];
                if (multiUid === uid) continue;
                let multiX = player["x"];
                let multiY = player["y"];console.log(multiX);
                fill(0);
                ellipse(multiX, multiY, multiSize);
                textSize(30);
                fill(0, 0, 0, 150);
                text(multiName.substr(0, multiName.indexOf(' ')), multiX, multiY - (multiSize/2) - 10);
                console.log(x > multiX - 15);
                if ((x > multiX - multiSize/2 && x < multiX + multiSize/2) && (y > multiY - multiSize/2 && y < multiY + multiSize/2)) {
                    // if (circleSize > multiSize && !(multiName in recentlyEaten)) {
                    //     console.log(multiSize);
                    //     circleSize += multiSize;
                    //     recentlyEaten[multiName] = 30;
                    // }
                    if (circleSize < multiSize) {
                        database.ref('Users/' + multiUid).set({
                            size: multiSize + circleSize
                        });
                        circleSize = 10;
                        x = Math.random() * width;
                        y = Math.random() * height;
                    }
                }

            }
        }
    }
    for (let key in recentlyEaten) {
        if (recentlyEaten[key] < 0) {
            delete recentlyEaten[key];
            continue;
        }
            recentlyEaten[key] -= 1;
    }

    // Render
    fill(0, 0, 0, 255);
    ellipse(x, y, circleSize);
    fill(0, 0, 0, 80);
    ellipse(px, py, circleSize);
    ellipse(px2, py2, circleSize);
    px2 = px;
    py2 = py;
    px = x;
    py = y;
}