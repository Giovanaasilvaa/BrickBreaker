const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");

canvas.width = Math.min(window.innerWidth * 0.9, 800);
canvas.height = canvas.width * 0.75; 

const paddleHeight = 10;
const paddleWidth = 100;
let paddleX;
const paddleSpeed = 7;

const ballRadius = 10;
let ballX, ballY, ballDX, ballDY;

const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 50;
const brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2;

let bricks;

let rightPressed = false;
let leftPressed = false;
let gamePaused = false;

let gameRunning = false;

document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "Escape") togglePause();
});

document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

startButton.addEventListener("click", startGame);

function initializeGame() {
    paddleX = (canvas.width - paddleWidth) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballDX = 4;
    ballDY = -4;

    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function startGame() {
    startButton.style.display = "none";
    canvas.style.display = "block";
    initializeGame();
    gameRunning = true;
    gamePaused = false;
    gameLoop();
}

function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        if (!gamePaused) {
            gameLoop();
        }
    }
}

function drawPauseMessage() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "30px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("JOGO PAUSADO", canvas.width / 2, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Aperte ESC pra continuar", canvas.width / 2, canvas.height / 2 + 40);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    let allBricksDestroyed = true;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#ff5733";
                ctx.fill();
                ctx.closePath();
                allBricksDestroyed = false;
            }
        }
    }

    if (allBricksDestroyed) {
        gameRunning = false;
        startButton.style.display = "block";
        startButton.textContent = "Jogar Novamente";
        canvas.style.display = "none";
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status === 1) {
                if (
                    ballX > brick.x &&
                    ballX < brick.x + brickWidth &&
                    ballY > brick.y &&
                    ballY < brick.y + brickHeight
                ) {
                    ballDY = -ballDY;
                    brick.status = 0;
                }
            }
        }
    }
}

function update() {
    ballX += ballDX;
    ballY += ballDY;

    if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) ballDX = -ballDX;
    if (ballY - ballRadius < 0) ballDY = -ballDY;

    if (
        ballY + ballRadius > canvas.height - paddleHeight - 10 &&
        ballX > paddleX &&
        ballX < paddleX + paddleWidth
    ) {
        ballDY = -ballDY;
    }

    if (ballY + ballRadius > canvas.height) {
        gameOver();
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
    if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;

    collisionDetection();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
}

function gameLoop() {
    if (gameRunning && !gamePaused) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

function gameOver() {
    gameRunning = false;
    startButton.textContent = "Jogar Novamente";
    startButton.style.display = "block";
    canvas.style.display = "none";
}
