let player;
let blobs = [];
let zoom = 1;
let mycolor;

const worldBoard = 4000;
const startingSize = 64;
const blobCount = 300;

function setup() {
    createCanvas(1200, 600);
    colorMode(HSB, 100);
    mycolor = random(0, 100);
    player = new Blob(0, 0, startingSize);
    for (let i = 0; i < blobCount; i++) {
        blobs[i] = new Blob(random(-worldBoard, worldBoard), random(-worldBoard, worldBoard), 30);
    }
    strokeCap(SQUARE);
    stroke(0);
    textAlign(LEFT);
    textSize(32);
}
function draw() {
    background(100);
    text("Score: " + Math.floor(player.r), 10, 30);

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
    player.update(player.r);

    fill(0);
    for (let i = blobs.length - 1; i >= 0; i--) {
        if (player.eats(blobs[i])) {
            blobs.splice(i, 1);
            blobs[blobs.length] = new Blob(random(-worldBoard, worldBoard), random(-worldBoard, worldBoard), 30)
        } else {
            blobs[i].render();
        }
    }
}