// Referência ao canvas e ao contexto 2D
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Botão de iniciar o jogo
const startButton = document.getElementById("startButton");

// Carregando imagens usadas no jogo
const coinImage = new Image();
coinImage.src = "/assets/imagens/moeda.png";

const brickImage = new Image();
brickImage.src = "/assets/imagens/tijolo.png";

const heartImage = new Image();
heartImage.src = "/assets/imagens/coracao.png";

const ballImage = new Image();
ballImage.src = "/assets/imagens/bolinhaprincipal.png";

const paddleImage = new Image();
paddleImage.src = "/assets/imagens/paddle.png";

// Define tamanho do canvas com base na tela
canvas.width = Math.min(window.innerWidth * 0.9, 680);
canvas.height = canvas.width * 0.70;

// Configurações da raquete
const paddleHeight = 18;
const paddleWidth = 120;
let paddleX;
const paddleSpeed = 7;

// Configurações da bola
const ballRadius = 10;
let ballX, ballY, ballDX, ballDY;

// Configurações dos tijolos
const brickRowCount = 6;
const brickColumnCount = 10;
const brickWidth = 60;
const brickHeight = 20;
const brickPadding = 3;
const brickOffsetTop = 50;

// Variáveis do jogo
let bricks;
let fallingBalls = []; // Moedas caindo
let coinCount = 0;
let lives = 5;
let rightPressed = false;
let leftPressed = false;
let gamePaused = false;
let gameRunning = false;

// Sons do jogo
let backgroundMusic = new Audio("/assets/sons/fundo.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.10;

let brickHitSound = new Audio("/assets/sons/bolinha.mp3");

let coinSound = new Audio("/assets/sons/moeda.mp3"); 
coinSound.volume = 0.5;

// Voltar ao menu
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

// Reproduz som ao bater no tijolo
function playBrickHitSound() {
    if (!brickHitSound.paused) {
        brickHitSound.currentTime = 0;
    }
    brickHitSound.play();
}

// Detecta teclas pressionadas (direita, esquerda, ESC)
document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "Escape") togglePause();
});

// Detecta quando a tecla é solta
document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

// Inicia o jogo ao clicar no botão
startButton.addEventListener("click", startGame);

// Inicializa variáveis do jogo
function initializeGame() {
    paddleX = (canvas.width - paddleWidth) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;

    // Direção inicial aleatória
    ballDX = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2);
    ballDY = -4;

    // Cria matriz de tijolos
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = {
                x: 0,
                y: 0,
                status: 1,
                reward: Math.random() < 0.3 ? 'coin' : null, // 30% chance de ter moeda
                fallingReward: false
            };
        }
    }
}

// Inicia o jogo
function startGame() {
    // Espera a imagem dos tijolos carregar
    if (!brickImage.complete) {
        brickImage.onload = startGame;
        return;
    }

    // Atualiza a interface
    startButtonWord.style.display = "none";
    startButton.style.display = "none";
    menuButton.style.display = "block";
    canvas.style.display = "block";
    document.getElementById("coinCount").style.display = "block";

    // Reinicia valores
    lives = 5;
    coinCount = 0;
    fallingBalls = [];
    document.getElementById("coinCount").textContent = `Moedas: ${coinCount}`;

    // Começa o jogo
    initializeGame();
    gameRunning = true;
    gamePaused = false;
    backgroundMusic.play();
    gameLoop();
}

// Alterna entre pausa e continuar
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

// Exibe mensagem de pausa
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

// Desenha a bolinha
function drawBall() {
    ctx.drawImage(ballImage, ballX - ballRadius, ballY - ballRadius, ballRadius * 2, ballRadius * 2);
}

// Desenha a raquete
function drawPaddle() {
    ctx.drawImage(paddleImage, paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
}

// Desenha os tijolos
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

    // Se todos os tijolos foram destruídos
    if (allBricksDestroyed) {
        gameRunning = false;
        startButton.style.display = "block";
        canvas.style.display = "none";
        backgroundMusic.pause();
    }
}

// Desenha moedas caindo
function drawFallingBalls() {
    for (let i = 0; i < fallingBalls.length; i++) {
        const ball = fallingBalls[i];
        ctx.drawImage(coinImage, ball.x - 10, ball.y - 10, 20, 20);
        ball.y += ball.dy;

        // Remove se sair da tela
        if (ball.y > canvas.height) {
            fallingBalls.splice(i, 1);
            i--;
        }
    }
}

// Desenha vidas (corações)
function drawLives() {
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(heartImage, 10 + i * 30, 10, 25, 25);
    }
}

// Verifica se pegou moeda
function checkFallingBallsCollection() {
    for (let i = 0; i < fallingBalls.length; i++) {
        const ball = fallingBalls[i];
        if (ball.y + ball.radius > canvas.height - paddleHeight - 10 &&
            ball.x > paddleX && ball.x < paddleX + paddleWidth) {
            fallingBalls.splice(i, 1);
            i--;
            coinCount++;
            document.getElementById("coinCount").textContent = `Moedas: ${coinCount}`;
            coinSound.play();
        }
    }
}

// Detecta colisões com tijolos
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

                    // Solta moeda se for tijolo com recompensa
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

// Atualiza posição da bola e lida com colisões
function update() {
    ballX += ballDX;
    ballY += ballDY;

    // Colisão nas bordas
    if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) ballDX = -ballDX;
    if (ballY - ballRadius < 0) ballDY = -ballDY;

    // Caiu fora da tela
    if (ballY + ballRadius > canvas.height) {
        lives--;
        if (lives <= 0) {
            gameOver();
        } else {
            resetGame();
        }
    }

    // Colisão com a raquete
    if (ballY + ballRadius >= canvas.height - paddleHeight - 10 &&
        ballX >= paddleX && ballX <= paddleX + paddleWidth) {

        let hitPosition = (ballX - paddleX) / paddleWidth;
        let angle = (hitPosition - 0.5) * Math.PI / 3;

        ballDY = -Math.abs(ballDY);
        ballY = canvas.height - paddleHeight - ballRadius - 11;
    }

    // Movimento da raquete
    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
    if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;

    collisionDetection();
    checkFallingBallsCollection();

    // Aumenta a velocidade com o tempo
    if (gameRunning) {
        const maxSpeed = 7;
        ballDX *= 1.0003;
        ballDY *= 1.0003;
        if (Math.abs(ballDX) > maxSpeed) ballDX = maxSpeed * Math.sign(ballDX);
        if (Math.abs(ballDY) > maxSpeed) ballDY = maxSpeed * Math.sign(ballDY);
    }
}

// Reinicia jogo ao perder vida
function resetGame() {
    resetBall();
    fallingBalls = [];
    coinCount = 0;
    document.getElementById("coinCount").textContent = `Moedas: ${coinCount}`;
    initializeGame();
}

// Reposiciona a bola
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballDX = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2);
    ballDY = -4;
}

// Desenha todos os elementos do jogo
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

// Loop principal do jogo
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

// Fim do jogo
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

// Retorno ao menu pelo botão
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

// Redimensiona o canvas se a janela mudar de tamanho
window.addEventListener("resize", () => {
    canvas.width = Math.min(window.innerWidth * 0.95, 800);
    canvas.height = canvas.width * 0.7;
});
