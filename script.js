const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");

const coinImage = new Image();
coinImage.src = "imagens/moeda.png";

const brickImage = new Image();
brickImage.src = "imagens/tijolo.png";

const heartImage = new Image();
heartImage.src = "imagens/coracao.png";

const ballImage = new Image();
ballImage.src = "imagens/bolinhaprincipal.png";

const paddleImage = new Image();
paddleImage.src = "imagens/paddle.png";

canvas.width = Math.min(window.innerWidth * 0.9, 680);
canvas.height = canvas.width * 0.70;

const paddleHeight = 18;
const paddleWidth = 120;
let paddleX;
const paddleSpeed = 7;

const ballRadius = 10;
let ballX, ballY, ballDX, ballDY;

const brickRowCount = 6;
const brickColumnCount = 10;
const brickWidth = 60;
const brickHeight = 20;
const brickPadding = 3;
const brickOffsetTop = 50;

let bricks;
let fallingBalls = [];
let coinCount = 0;
let lives = 5;

let rightPressed = false;
let leftPressed = false;
let gamePaused = false;

let gameRunning = false;

let backgroundMusic = new Audio("sons/fundo.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.10;

let brickHitSound = new Audio("sons/bolinha.mp3");

let coinSound = new Audio("sons/moeda.mp3"); 
coinSound.volume = 0.5;

function returnToMenu() {
    gameRunning = false;  
    canvas.style.display = "none";  
    startButton.style.display = "block";  
    menuButton.style.display = "none";  
    document.getElementById("startButtonWord").style.display = "block";  
    document.getElementById("coinCount").style.display = "none";  
    backgroundMusic.pause();  
    lives = 5;
    coinCount = 0;  
}

function playBrickHitSound() {
    if (!brickHitSound.paused) {
        brickHitSound.currentTime = 0;
    }
    brickHitSound.play();
}

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

    ballDX = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2);
    ballDY = -4;

    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = {
                x: 0,
                y: 0,
                status: 1,
                reward: Math.random() < 0.3 ? 'coin' : null, 
                fallingReward: false
            };
        }
    }
}

function startGame() {

    if (!brickImage.complete) {
        console.warn("Aguardando a imagem dos tijolos carregar...");
        brickImage.onload = startGame;  
        return;
    }

    startButtonWord.style.display = "none"; 
    startButton.style.display = "none"; 
    lives = 5; 
    menuButton.style.display = "block";  
    canvas.style.display = "block";  
    document.getElementById("coinCount").style.display = "block";  
    coinCount = 0;  
    document.getElementById("coinCount").textContent = `Moedas: ${coinCount}`;  
    fallingBalls = [];  
    initializeGame();  
    gameRunning = true;  
    gamePaused = false;  
    backgroundMusic.play();  
    gameLoop(); 
}

function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        if (gamePaused) {
            backgroundMusic.pause();
        } else {
            backgroundMusic.play();
            gameLoop();
        }
    }
}

function drawPauseMessage() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const fontSize = canvas.width / 15;
    ctx.font = `${fontSize}px Arial`;  
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("JOGO PAUSADO", canvas.width / 2, canvas.height / 2);
    ctx.font = `${fontSize / 1.5}px Arial`; 
    ctx.fillText("Aperte ESC pra continuar", canvas.width / 2, canvas.height / 2 + fontSize + 10);
}

function drawBall() {
    ctx.drawImage(ballImage, ballX - ballRadius, ballY - ballRadius, ballRadius * 2, ballRadius * 2);
}

function drawPaddle() {
    ctx.drawImage(paddleImage, paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
}

function drawBricks() {
    let allBricksDestroyed = true;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = (canvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2 + c * (brickWidth + brickPadding);
                const brickY = brickOffsetTop + r * (brickHeight + brickPadding);
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                ctx.drawImage(brickImage, brickX, brickY, brickWidth, brickHeight);
                
                allBricksDestroyed = false;
            }
        }
    }

    if (allBricksDestroyed) {
        gameRunning = false;
        startButton.style.display = "block";
        canvas.style.display = "none";
        backgroundMusic.pause();
    }
}

function drawFallingBalls() {
    for (let i = 0; i < fallingBalls.length; i++) {
        const ball = fallingBalls[i];
        ctx.drawImage(coinImage, ball.x - 10, ball.y - 10, 20, 20); 
        
        ball.y += ball.dy;
        if (ball.y > canvas.height) {
            fallingBalls.splice(i, 1);
            i--;
        }
    }
}

function drawLives() {
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(heartImage, 10 + i * 30, 10, 25, 25); 
    }
}

function checkFallingBallsCollection() {
    for (let i = 0; i < fallingBalls.length; i++) {
        const ball = fallingBalls[i];
        if (ball.y + ball.radius > canvas.height - paddleHeight - 10 &&
            ball.x > paddleX && ball.x < paddleX + paddleWidth) {
            console.log('Bolinha Coletada!');
            fallingBalls.splice(i, 1);
            i--;
            coinCount++;
            document.getElementById("coinCount").textContent = `Moedas: ${coinCount}`;
            coinSound.play(); 
        }
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
                    playBrickHitSound();

                    if (brick.reward) {
                        fallingBalls.push({
                            x: brick.x + brickWidth / 2,
                            y: brick.y + brickHeight / 2,
                            radius: 5,
                            dy: 2
                        });
                    }
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

    if (ballY + ballRadius > canvas.height) {
        lives--; 
        if (lives <= 0) {
            gameOver();  
        } else {
            resetGame();  
        }
    }

    if (ballY + ballRadius >= canvas.height - paddleHeight - 10 &&
        ballX >= paddleX && ballX <= paddleX + paddleWidth) {
    
        let hitPosition = (ballX - paddleX) / paddleWidth;  
        let angle = (hitPosition - 0.5) * Math.PI / 3;  
    
        ballDY = -Math.abs(ballDY);
    
        ballY = canvas.height - paddleHeight - ballRadius - 11;
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
    if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;

    collisionDetection();
    checkFallingBallsCollection();

    if (gameRunning) {
        const maxSpeed = 7;
        ballDX *= 1.0003;
        ballDY *= 1.0003;

        if (Math.abs(ballDX) > maxSpeed) ballDX = maxSpeed * Math.sign(ballDX);
        if (Math.abs(ballDY) > maxSpeed) ballDY = maxSpeed * Math.sign(ballDY);
    }
}

function resetGame() {
    resetBall();  
    fallingBalls = [];  
    coinCount = 0;  
 
    document.getElementById("coinCount").textContent = `Moedas: ${coinCount}`;  
    initializeGame();  
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballDX = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2);
    ballDY = -4;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawFallingBalls();
    drawLives(); 

    if (gamePaused) {
        drawPauseMessage();
    }
}

function gameLoop() {
    if (gameRunning && !gamePaused) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    } else if (gamePaused) {
        draw();
        drawPauseMessage();
    }
}

function gameOver() {
    gameRunning = false;  
    startButton.style.display = "block";  
    canvas.style.display = "none";  
    document.getElementById("coinCount").style.display = "none"; 
    menuButton.style.display = "none";
    backgroundMusic.pause();  
    coinCount = 0;  
    lives = 5;  
    document.getElementById("coinCount").textContent = `Moedas: ${coinCount}`;  
    document.getElementById("livesCount").textContent = `Vidas: ${lives}`; 

    startButton.onclick = startGame;  
}

menuButton.addEventListener("click", () => {
    gameRunning = false;  
    canvas.style.display = "none";
    startButtonWord.style.display = "block";   
    startButton.style.display = "block";  
    document.getElementById("coinCount").style.display = "none";  
    menuButton.style.display = "none";  
    backgroundMusic.pause();  
    coinCount = 0;  
    lives = 5;  
    document.getElementById("coinCount").textContent = `Moedas: ${coinCount}`;  
});


window.addEventListener("resize", () => {
    canvas.width = Math.min(window.innerWidth * 0.95, 800);
    canvas.height = canvas.width * 0.7;
});