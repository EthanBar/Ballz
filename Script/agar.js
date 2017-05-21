let player;
let blobs = [];
let zoom = 1;
let mycolor;
let prepareFirebase = false;

let players;
let colorMap = {};
let recentlyEaten = {};

const worldBoard = 4000;
const startingSize = 64;
const blobCount = 300;

function setup() {
    createCanvas(window.innerWidth,  window.innerHeight - document.getElementById('topbar').offsetHeight * 2);
    colorMode(HSB, 100);
    mycolor = random(100);
    player = new Blob(random(-worldBoard, worldBoard), random(-worldBoard, worldBoard), startingSize);
    for (let i = 0; i < blobCount; i++) {
        blobs[i] = new Blob(random(-worldBoard, worldBoard), random(-worldBoard, worldBoard), 30);
    }
    strokeCap(SQUARE);
    stroke(0);
    textAlign(LEFT);
    textSize(32);
}
function draw() {
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
    background(100);
    fill(0);
    textAlign(LEFT);
    text("Score: " + Math.floor(player.r), 10, 30);
    textAlign(RIGHT);
    text("alpha v1.4", width, 30);

    // translate(width/2-player.pos.x, height/2-player.pos.y);
    translate(width/2, height/2);

    let newzoom = 32 / player.r;
    zoom = lerp(zoom, newzoom, 0.1);
    scale(zoom);

    translate(-player.pos.x, -player.pos.y);

    strokeWeight(10);
    line(-worldBoard, -worldBoard, -worldBoard, worldBoard);
    line(-worldBoard, worldBoard, worldBoard, worldBoard);
    line(worldBoard, worldBoard, worldBoard, -worldBoard);
    line(worldBoard, -worldBoard, -worldBoard, -worldBoard);
    strokeWeight(0);

    let viewDistance = zoom * width * 10;

    player.renderPlayer();
    if (prepareFirebase) {
        player.update(player.r);
    }

    fill(0);
    for (let i = blobs.length - 1; i >= 0; i--) {
        if (player.eats(blobs[i])) {
            blobs.splice(i, 1);
            blobs[blobs.length] = new Blob(random(-worldBoard, worldBoard), random(-worldBoard, worldBoard), 30)
        } else {
            blobs[i].render();
        }
    }

    if (prepareFirebase) {
        database.ref('Users/' + uid).update({
            x: Math.round(player.pos.x),
            y: Math.round(player.pos.y),
            size: Math.round(player.r)
        });
        if (players) {
            for (let key in players) {
                let other = players[key];
                let otherUID = other["uid"];
                let otherR = other["size"];
                let amKilled = other["killed"];
                if (otherUID == undefined) continue;
                if (otherUID == uid) {
                    if (amKilled === 1) {
                        player.r = startingSize;
                        player.pos = createVector(random(-worldBoard, worldBoard), random(-worldBoard, worldBoard));
                        database.ref('Users/' + uid).update({
                            killed: 0
                        });
                    }
                    continue;
                }
                if (!(otherUID in colorMap)) {
                    colorMap[otherUID] = random(100);
                }
                let otherX = other["x"];
                let otherY = other["y"];
                fill(colorMap[otherUID], 100, 100);
                ellipse(otherX, otherY, otherR * 2);
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
}