const DEFAULT_CANVAS_HEIGHT = 800;
const DEFAULT_CANVAS_WIDTH = 1024;

var RED;
var WHITE;
var PURPLE;
var VECTOR_ZERO;

var auxinRadius = 3;
var auxinProximityRadius = 23;
var auxinSprayCount = 250;
const auxins = []; // Vector2
const veins = []; // Vein

var showProximity = false;

class Vein {
    constructor(position, direction, age) {
        this.position = position;
        this.direction = direction;
        this.age = age;
    }
}

function setup() {
    RED = color('red');
    WHITE = color('white');
    PURPLE = color('purple');
    VECTOR_ZERO = createVector(0.0, 0.0);
    sprayAuxins();
    veins.push(new Vein(createVector(DEFAULT_CANVAS_WIDTH >> 1, DEFAULT_CANVAS_HEIGHT * 0.8), VECTOR_ZERO, 0));
    createCanvas(DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT);
    background('#181818');
    computeClosestVeins();
    frameRate(30);
}

function draw() {
    background('#181818FF');
    drawAuxins();
    drawVeins()
}

function keyPressed() {
    if (key === 's') {
        sprayAuxins();
    } else if (key === 'P') {
        showProximity = !showProximity;
    } else if (key === 'k') {
        eatAuxins();
    } else if (key === 'p') {
        computeClosestVeins();
        growMoreVeins();
    }
}


function growMoreVeins() {
    const toAdd = [];
    for (const vein of veins) {
        vein.age++;
        if (vein.direction.x === 0.0 && vein.direction.y === 0.0) continue;
        let limitedDir = p5.Vector.limit(vein.direction, auxinRadius * 2);
        toAdd.push(new Vein(p5.Vector.add(vein.position, limitedDir), VECTOR_ZERO, 0));
    }
    while (toAdd.length > 0) {
        veins.push(toAdd.pop())
    }
}

function computeClosestVeins() {
    if (veins.length <= 0) return;
    for (const vein of veins) {
        vein.direction = VECTOR_ZERO;
    }

    for (const auxin of auxins) {
        let closest = veins[0];
        for (let i = 1; i < veins.length; i++) {
            let vein = veins[i];
            if (auxin.dist(closest.position) > auxin.dist(vein.position)) {
                closest = vein;
            }
        }
        let toSubtract = p5.Vector.sub(auxin, closest.position);
        closest.direction = p5.Vector.add(closest.direction, toSubtract);
    }
}

function drawVeins() {
    push();
    strokeWeight(2);
    noFill();
    stroke(WHITE);
    for (const vein of veins) {
        circle(vein.position.x, vein.position.y, auxinRadius << 1);
        push();
        let dir = p5.Vector.add(vein.position, vein.direction.limit(auxinRadius << 1));
        line(vein.position.x, vein.position.y, dir.x, dir.y);
        pop();
    }
    pop();
}

function drawAuxins() {
    push();
    strokeWeight(0);
    fill(RED);
    for (const auxin of auxins) {
        circle(auxin.x, auxin.y, auxinRadius << 1);

        if (showProximity) {
            push();
            noFill();
            stroke(RED);
            strokeWeight(1);
            circle(auxin.x, auxin.y, auxinProximityRadius << 1);
            pop();
        }
    }
    pop();
}


function eatAuxins() {
    const auxinsToRemove = [];
    for (let i = 0; i < auxins.length; i++) {
        for (const vein of veins) {
            const auxin = auxins[i];
            let distance = vein.position.dist(auxin);
            if (distance < auxinProximityRadius + auxinRadius) {
                auxinsToRemove.push(i);
                break;
            }
        }
    }
    while (auxinsToRemove.length > 0) {
        let toRemove = auxinsToRemove.pop()
        auxins[toRemove] = auxins.pop();
    }
}

function sprayAuxins() {

    for (let i = 0; i < auxinSprayCount; ++i) {
        auxins.push(createVector(random(0, DEFAULT_CANVAS_WIDTH - auxinRadius), random(0, DEFAULT_CANVAS_HEIGHT - auxinRadius)));
    }
}