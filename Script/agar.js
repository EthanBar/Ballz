const playerSpeed = 15;
const magnetRange = 300;
const magnetStrength = 15;
const blobCount = 4000; // Count of pellets to pick up (These are locally rendered and created)
const worldSize = 12000; // World size
const blobSize = 20; // Count of pellets to pick up (These are locally rendered and created)
const startingSize = 64; // Starting size of the player
const worldBorder = worldSize + blobSize / 2; // World border
const zoomScale = startingSize * 0.6;

let player;
let mainTree;
let zoom = 10;
let mycolor;
let prepareFirebase = false;
let players;
let hitBorder = false;
let listening = true;
let lifetimePoints = 0;
let lastScore = startingSize;

let prevX = 0;
let prevY = 0;
let prevR = 0;

let blobs = [];
let colorMap = {};
let recentlyEaten = {};
let highScores = {};

let averageFPS = 0;
let countFPS = 0;


let glitchCounter = 0;
let speedCounter = 0;
let zoomCounter = 1;
let magnetCounter = 0;

function setup() {
    createCanvas(window.innerWidth,  window.innerHeight - document.getElementById('topbar').offsetHeight);
    colorMode(HSB, 100);
    mycolor = random(100);
    player = new Blob(random(-worldSize, worldSize), random(-worldSize, worldSize), startingSize);
    for (let i = 0; i < blobCount; i++) {
        blobs[i] = new Blob(random(-worldSize, worldSize), random(-worldSize, worldSize), blobSize);
    }
    strokeCap(SQUARE);
    stroke(0);
}



function draw() {
    if (!logedin) return;
    if (!prepareFirebase && logedin) {
        database.ref('Users/' + uid).update({
            display: username,
            uid: uid,
            x: Math.round(player.pos.x),
            y: Math.round(player.pos.y),
            size: Math.round(player.r),
            killed: 0
        });
        mainTree = firebase.database().ref('Users');
        // mainTree.on('value', function(data) {
        //     players = data.val();
        // });
        prepareFirebase = true;
    }

    displayHud();

    // Prepare view
    translate(width/2, height/2); // Center view
    let newzoom = zoomScale / ((player.r - startingSize) / 2 + startingSize);
    newzoom /= zoomCounter;
    if (glitchCounter > 0) {
        newzoom *= (Math.random() * 0.5) + 0.25;
        // rotate(Math.random() * 10);
        // zoom = newzoom;
        zoom = lerp(zoom, newzoom, 0.1);
    } else {
        zoom = lerp(zoom, newzoom, 0.1);
    }
    scale(zoom);
    translate(-player.pos.x, -player.pos.y);

    // Draw world boarder lines
    if (hitBorder) {
        stroke(0, 100, 100);
        player.r -= 0.5;
        hitBorder = false;
    } else {
        stroke(0);
    }
    strokeWeight(10);
    line(-worldBorder, -worldBorder, -worldBorder, worldBorder);
    line(-worldBorder, worldBorder, worldBorder, worldBorder);
    line(worldBorder, worldBorder, worldBorder, -worldBorder);
    line(worldBorder, -worldBorder, -worldBorder, -worldBorder);
    strokeWeight(0);

    let viewDistance = zoom * width * 10;

    player.renderPlayer();
    if (prepareFirebase) {
        player.update(player.r);
    }

    blobs.sort(compare);

    fill(0);
    if (magnetCounter > 0) {
        for (let i = blobs.length - 1; i >= 0; i--) {
            if (player.pos.x - blobs[i].pos.x > player.r + magnetRange) continue;
            if (player.pos.y - blobs[i].pos.y > player.r + magnetRange) continue;
            let dist = p5.Vector.dist(player.pos, blobs[i].pos);
            if (Math.abs(dist) < player.r + magnetRange) {
                let d = createVector(player.pos.x - blobs[i].pos.x, player.pos.y - blobs[i].pos.y);
                d.setMag(magnetStrength);
                blobs[i].pos.add(d);
            }
        }

    } else {
        // for (let i = blobs.length - 1; i >= 0; i--) {
        //     if (player.pos.x - blobs[i].pos.x > player.r) continue;
        //     if (player.pos.y - blobs[i].pos.y > player.r) continue;
        //     let dist = p5.Vector.dist(player.pos, blobs[i].pos);
        //     if (Math.abs(dist) < player.r) {
        //         console.log("yee");
        //         let d = createVector(player.pos.x - blobs[i].pos.x, player.pos.y - blobs[i].pos.y);
        //         d.setMag(magnetStrength);
        //         blobs[i].pos.add(d);
        //     }
        // }
    }

    for (let i = blobs.length - 1; i >= 0; i--) {
        if (player.eats(blobs[i])) {
            blobs.splice(i, 1);
            blobs[blobs.length] = new Blob(random(-worldSize, worldSize), random(-worldSize, worldSize), blobSize)
        } else {
            currentPower = NONE;
            blobs[i].render();
        }
    }

    if (prepareFirebase) {
        if (frameCount % 10 === 0) {
            if (prevX !== player.pos.x || prevY !== player.pos.y) {
                if (prevR === player.r) {
                    database.ref('Users/' + uid).update({
                        x: Math.round(player.pos.x),
                        y: Math.round(player.pos.y)
                    });
                } else {
                    database.ref('Users/' + uid).update({
                        x: Math.round(player.pos.x),
                        y: Math.round(player.pos.y),
                        size: Math.round(player.r)
                    });
                }
            }
            mainTree.once('value').then(function(snapshot) {
                players = snapshot.val();
            });
        }
        if (players) {
            for (let key in players) {
                // Get values of other player
                let other = players[key];
                let otherUID = other["uid"];
                let otherR = other["size"];
                let otherDisplay = other["display"];
                let amKilled = other["killed"];
                let otherX = other["x"];
                let otherY = other["y"];
                if (otherUID === undefined) continue;
                // Check if self
                if (otherUID === uid) {
                    // Check if dead
                    if (amKilled === 1) {
                        respawn();
                    }
                    continue;
                }
                // Display other player ellipse
                if (!(otherUID in colorMap)) {
                    colorMap[otherUID] = random(100);
                }
                if (glitchCounter > 0) {
                    fill(Math.random() * 100, 100);
                } fill(colorMap[otherUID], 100, 100);
                ellipse(otherX, otherY, otherR * 2);

                // Update high scores
                highScores[otherUID] = Math.floor(otherR);

                // Display hover text
                textSize(otherR / 2);
                fill(0);
                textAlign(CENTER, CENTER);
                text(otherDisplay.substr(0, otherDisplay.indexOf(" ")), otherX, otherY);

                // Check collision
                if (player.r > otherR) {
                // if (false) {
                    let d = p5.Vector.dist(player.pos, createVector(otherX, otherY));
                    if (Math.abs(d) < player.r + otherR && !(otherUID in recentlyEaten)) {
                        recentlyEaten[otherUID] = 30;
                        database.ref('Users/' + otherUID).update({
                            killed: 1
                        });
                        let sum = (sqrt(((PI * player.r * player.r) + (PI * otherR * otherR)) / PI));
                        console.log(sum);
                        player.r = sum;
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

    // User stats update
    // if (frameCount % 60 === 0) {
    //     let totalPoints = 0;
    //     firebase.database().ref('Stats/' + uid).once('value').then(function(snapshot) {
    //         if (snapshot.val().totalPoints) {
    //             totalPoints = snapshot.val().totalPoints;
    //         }
    //         let toAdd = player.r - lastScore;
    //         if (lastScore < 0) toAdd = 0;
    //         lifetimePoints = totalPoints += Math.ceil(toAdd);
    //         database.ref('Stats/' + uid).update({
    //             totalPoints: lifetimePoints
    //         });
    //         lastScore = player.r;
    //     });
    // }

    // Var updates
    if (zoomCounter > 1) zoomCounter -= 0.1;
    speedCounter -= 0.1;
    magnetCounter -= 0.1;
    if (glitchCounter > 0) rotate(0);
    glitchCounter -= 0.1;
    prevX = player.pos.x;
    prevY = player.pos.y;
    prevR = player.r;
}


/* Render HUD */
function displayHud() {
    if (glitchCounter > 0) {
        background(Math.random() * 100, 100, 100);
        fill(0);
        textSize(32);
        textAlign(LEFT, BASELINE);
        text(("Score: " + Math.floor(player.r)).split('').sort(function(){return 0.5-Math.random()}).join(''), 10, 30);
        textAlign(RIGHT);
        text("Less lag?".split('').sort(function(){return 0.5-Math.random()}).join(''), width, 30);

        //Display leader board
        highScores[uid] = Math.floor(player.r);
        let bestPlayer = uid;
        for (let key in highScores) {
            if (highScores[key] > highScores[bestPlayer]) {
                bestPlayer = key;
            }
        }
        // textAlign(LEFT);
        // text(highScores[bestPlayer], 10, height - 5);
        // text(("Lifetime mass: " + lifetimePoints).split('').sort(function(){return 0.5-Math.random()}).join(''), 10, height - 5);

        // Display FPS
        countFPS += frameRate();
        if (frameCount % 60 === 0) {
            averageFPS = countFPS / 60;
            countFPS = 0;
        }
        textAlign(RIGHT);
        text(("FPS: " + Math.round(averageFPS)).split('').sort(function(){return 0.5-Math.random()}).join(''), width - 5, height - 5);
    } else {
        background(100);
        fill(0);
        textSize(32);
        textAlign(LEFT, BASELINE);
        text("Score: " + Math.floor(player.r), 10, 30);
        textAlign(RIGHT);
        text("Less lag?", width, 30);

        //Display leader board
        highScores[uid] = Math.floor(player.r);
        let bestPlayer = uid;
        for (let key in highScores) {
            if (highScores[key] > highScores[bestPlayer]) {
                bestPlayer = key;
            }
        }
        // textAlign(LEFT);
        // text(highScores[bestPlayer], 10, height - 5);
        // text("Alltime mass: " + lifetimePoints, 10, height - 5);

        // Display FPS
        countFPS += frameRate();
        if (frameCount % 60 === 0) {
            averageFPS = countFPS / 60;
            countFPS = 0;
        }
        textAlign(RIGHT);
        text("FPS: " + Math.round(averageFPS), width - 5, height - 5);
    }
}

function compare(a,b) {
    if (a.powerUp > b.powerUp)
        return -1;
    if (a.powerUp < b.powerUp)
        return 1;
    return 0;
}

function respawn() {
    player.r = startingSize;
    player.pos = createVector(random(-worldSize, worldSize), random(-worldSize, worldSize));
    database.ref('Users/' + uid).update({
        killed: 0
    });
}

window.onresize = function () {
    resizeCanvas(window.innerWidth,  window.innerHeight - document.getElementById('topbar').offsetHeight);
};