let player;
let zoom = 10;
let mycolor;
let prepareFirebase = false;
let players;
let hitBorder = false;

let prevX = 0;
let prevY = 0;
let prevR = 0;

let blobs = [];
let colorMap = {};
let recentlyEaten = {};
let highScores = {};

let averageFPS = 0;
let countFPS = 0;

const playerSpeed = 15;
const magnetRange = 40;
const magnetStrength = 15;
const blobCount = 2000; // Count of pellets to pick up (These are locally rendered and created)
const worldSize = 12000; // World size
const blobSize = 20; // Count of pellets to pick up (These are locally rendered and created)
const startingSize = 64; // Starting size of the player
const worldBorder = worldSize + blobSize / 2; // World border
const zoomScale = startingSize * 0.6;

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
        let commentsRef = firebase.database().ref('Users');
        commentsRef.on('value', function(data) {
            players = data.val();
        });
        prepareFirebase = true;
    }


    /* Render HUD */
    background(100);
    fill(0);
    textSize(32);
    textAlign(LEFT);
    text("Score: " + Math.floor(player.r), 10, 30);
    textAlign(RIGHT);
    text("v1.10.1", width, 30);

    //Display leader board
    highScores[uid] = Math.floor(player.r);
    let bestPlayer = uid;
    for (let key in highScores) {
        if (highScores[key] > highScores[bestPlayer]) {
            bestPlayer = key;
        }
    }
    textAlign(LEFT);
    text(highScores[bestPlayer], 10, height - 5);

    // Display FPS
    countFPS += frameRate();
    if (frameCount % 60 === 0){
        averageFPS = countFPS / 60;
        countFPS = 0;
    }
    textAlign(RIGHT);
    text("FPS: " + Math.round(averageFPS), width - 5, height - 5);

    // Prepare view
    translate(width/2, height/2); // Center view
    let newzoom = zoomScale / ((player.r - startingSize) / 2 + startingSize);
    newzoom /= zoomCounter;
    zoom = lerp(zoom, newzoom, 0.1);
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
            // if (player.pos.x - blobs[i].pos.x < player.r + 10) continue;
            // if (player.pos.y - blobs[i].pos.y < player.r + 10) continue;
            if (player.pos.x - blobs[i].pos.x > player.r * 2 + magnetRange) continue;
            if (player.pos.y - blobs[i].pos.y > player.r * 2 + magnetRange) continue;
            let dist = p5.Vector.dist(player.pos, blobs[i].pos);
            if (Math.abs(dist) < player.r * 2 + magnetRange) {
                console.log("yee");
                let d = createVector(player.pos.x - blobs[i].pos.x, player.pos.y - blobs[i].pos.y);
                d.setMag(magnetStrength);
                blobs[i].pos.add(d);
            }
        }

    }

    for (let i = blobs.length - 1; i >= 0; i--) {
        if (player.eats(blobs[i])) {
            blobs.splice(i, 1);
            blobs[blobs.length] = new Blob(random(-worldSize, worldSize), random(-worldSize, worldSize), blobSize)
        } else {
            blobs[i].render();
        }
    }
    // if (player.r < startingSize) player = startingSize;

    if (prepareFirebase) {
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
                        player.r = startingSize;
                        player.pos = createVector(random(-worldSize, worldSize), random(-worldSize, worldSize));
                        database.ref('Users/' + uid).update({
                            killed: 0
                        });
                    }
                    continue;
                }
                // Display other player ellipse
                if (!(otherUID in colorMap)) {
                    colorMap[otherUID] = random(100);
                }
                fill(colorMap[otherUID], 100, 100);
                ellipse(otherX, otherY, otherR * 2);

                // Update high scores
                highScores[otherUID] = Math.floor(otherR);

                // Display hover text
                textSize(otherR / 2);
                fill(0);
                textAlign(CENTER);
                text(otherDisplay.substr(0, otherDisplay.indexOf(" ")), otherX, otherY + otherR / 4);

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

    // Var updates
    if (zoomCounter > 1) zoomCounter -= 0.1;
    speedCounter -= 0.1;
    magnetCounter -= 0.1;
    glitchCounter -= 0.1;
    prevX = player.pos.x;
    prevY = player.pos.y;
    prevR = player.r;
}

function compare(a,b) {
    if (a.powerUp > b.powerUp)
        return -1;
    if (a.powerUp < b.powerUp)
        return 1;
    return 0;
}