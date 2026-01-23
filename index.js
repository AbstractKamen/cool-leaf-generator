const DEFAULT_CANVAS_HEIGHT = window.innerHeight;
const DEFAULT_CANVAS_WIDTH = window.innerWidth;

var RED;
var WHITE;
var PURPLE;
var VECTOR_ZERO;

var auxinRadius = 5;
var auxinProximityRadius = 33;
var auxinSprayCount = 100;

const thicknessThreshold = 20;
var veinThicknessFactor = 0.05;
var veinThicknessFactorOverThreshold = 0.01;

const auxins = []; // Vector
const veins = []; // Vein

var showProximity = false;
var paintAuxin = false;
var paintVein = false;

class Vein {
    constructor(position, direction, age) {
        this.position = position;
        this.direction = direction;
        this.age = age;
        this.childrenDirections = [];
    }
}

function setup() {
    RED = color('red');
    WHITE = color('white');
    PURPLE = color('purple');
    VECTOR_ZERO = createVector(0.0, 0.0);
    sprayAuxins();
    veins.push(new Vein(createVector(DEFAULT_CANVAS_WIDTH >> 1, DEFAULT_CANVAS_HEIGHT * 0.8), VECTOR_ZERO, 1));
    createCanvas(DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT);
    computeClosestVeins();
    frameRate(30);
    updateStats();

    // ui lul
    document.getElementById('grow')
        .addEventListener('click', () => {
            computeClosestVeins();
            growMoreVeins();
            updateStats();
            return false;
        });
    document.getElementById('clear')
        .addEventListener('click', () => {
            auxins.length = 0;
            veins.length = 0;
            paintVein = false;
            paintAuxin = false;
            updateStats();
            return false;
        });
    document.getElementById('eat')
        .addEventListener('click', () => {
            eatAuxins();
            updateStats();
            return false;
        });
    document.getElementById('spray')
        .addEventListener('click', () => {
            sprayAuxins();
            updateStats();
            return false;
        });
    document.getElementById('toggle-paint-auxin')
        .addEventListener('click', () => {
            paintAuxin = !paintAuxin;
            paintVein = false;
            return false;
        });
    document.getElementById('toggle-paint-vein')
        .addEventListener('click', () => {
            paintVein = !paintVein;
            paintAuxin = false;
            return false;
        });
}

function draw() {
    background('#181818FF');
    drawAuxins();
    drawVeins()
}

function updateStats() {
    let element = document.getElementById("stats");
    element.textContent = `Auxin count[${auxins.length}] Vein count[${veins.length}]`
}

function mouseClicked() {
    if (0 <= mouseX && mouseX < DEFAULT_CANVAS_WIDTH && 0 <= mouseY && mouseY < DEFAULT_CANVAS_HEIGHT) {
        if (paintAuxin) {
            auxins.push(createVector(mouseX, mouseY));
        } else if (paintVein) {
            veins.push(new Vein(createVector(mouseX, mouseY), VECTOR_ZERO, 1));
        }
        updateStats();
    }

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
    } else if (key === 'c') {
        auxins.length = 0;
        veins.length = 0;
        paintVein = false;
        paintAuxin = false;
    }
    updateStats();
}

function growMoreVeins() {
    const toAdd = [];
    for (const vein of veins) {
        vein.age++;
        if (vein.direction.x === 0.0 && vein.direction.y === 0.0) continue;
        let limitedDir = p5.Vector.limit(vein.direction, auxinRadius * 2);
        let newVein = new Vein(p5.Vector.add(vein.position, limitedDir), VECTOR_ZERO, 1);
        toAdd.push(newVein);
        vein.childrenDirections.push(newVein.position);
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
    noFill();
    stroke(WHITE);
    for (const vein of veins) {
        let veinThickness;
        if (vein.age > thicknessThreshold) {
            veinThickness = thicknessThreshold * veinThicknessFactor + (veinThicknessFactorOverThreshold * vein.age);
        } else {
            veinThickness = veinThicknessFactor * vein.age;
        }
        strokeWeight(veinThickness);
        for (const childDir of vein.childrenDirections) {
            line(vein.position.x, vein.position.y, childDir.x, childDir.y);
        }
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
        const auxin = auxins[i];
        for (const vein of veins) {
            let distance = vein.position.dist(auxin);
            if (distance < auxinProximityRadius + auxinRadius) {
                auxinsToRemove.push(i);
                break;
            }
        }
    }
    while (auxinsToRemove.length > 0) {
        let toRemove = auxinsToRemove.pop()
        if (auxins.length === 1) {
            auxins.pop();
        } else {
            auxins[toRemove] = auxins.pop();
        }
    }
}

function sprayAuxins() {

    for (let i = 0; i < auxinSprayCount; ++i) {
        auxins.push(createVector(random(0, DEFAULT_CANVAS_WIDTH - auxinRadius), random(0, DEFAULT_CANVAS_HEIGHT - auxinRadius)));
    }
}