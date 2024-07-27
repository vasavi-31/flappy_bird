//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const BIRD_X = boardWidth / 8;
const BIRD_Y = boardHeight / 2;
let birdImg;

let bird = {
    x: BIRD_X,
    y: BIRD_Y,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT
}

//pipes
let pipeArray = [];
const PIPE_WIDTH = 64;
const PIPE_HEIGHT = 512;
const PIPE_X = boardWidth;
const PIPE_Y = 0;

let topPipeImg;
let bottomPipeImg;

//physics
const GRAVITY = 0.4;
const JUMP_SPEED = -6;
const PIPE_VELOCITY_X = -2;

let velocityY = 0;
let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    loadImages().then(() => {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
        requestAnimationFrame(update);
        setInterval(placePipes, 1500);
        document.addEventListener("keydown", moveBird);
    });
}

async function loadImages() {
    birdImg = await loadImage("./flappybird.png");
    topPipeImg = await loadImage("./toppipe.png");
    bottomPipeImg = await loadImage("./bottompipe.png");
}

function loadImage(src) {
    return new Promise((resolve) => {
        let img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
    });
}

function update() {
    if (gameOver) return;

    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += GRAVITY;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += PIPE_VELOCITY_X;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    pipeArray = pipeArray.filter(pipe => pipe.x >= -PIPE_WIDTH);

    //score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) return;

    let randomPipeY = PIPE_Y - PIPE_HEIGHT / 4 - Math.random() * (PIPE_HEIGHT / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: PIPE_X,
        y: randomPipeY,
        width: PIPE_WIDTH,
        height: PIPE_HEIGHT,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: PIPE_X,
        y: randomPipeY + PIPE_HEIGHT + openingSpace,
        width: PIPE_WIDTH,
        height: PIPE_HEIGHT,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = JUMP_SPEED;

        if (gameOver) {
            bird.y = BIRD_Y;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
