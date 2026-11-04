// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Paddle properties
const paddle = {
    width: 10,
    height: 80,
    speed: 6,
    y: canvas.height / 2 - 40,
};

// Player paddle (left)
const player = {
    ...paddle,
    x: 20,
    dy: 0,
};

// Computer paddle (right)
const computer = {
    ...paddle,
    x: canvas.width - 30,
    dy: 0,
    speed: 4,
};

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5,
};

// Score
let playerScore = 0;
let computerScore = 0;

// Game state
let gameRunning = false;
let mouseY = canvas.height / 2;

// Keyboard input
const keys = {
    ArrowUp: false,
    ArrowDown: false,
};

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
    if (e.key === 'ArrowUp') keys.ArrowUp = true;
    if (e.key === 'ArrowDown') keys.ArrowDown = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = false;
    if (e.key === 'ArrowDown') keys.ArrowDown = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update scores
function updateScores() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw rectangle
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Draw circle
function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Draw net (center line)
function drawNet() {
    for (let y = 0; y < canvas.height; y += 15) {
        drawRect(canvas.width / 2 - 1, y, 2, 10, '#00ff88');
    }
}

// Draw game elements
function draw() {
    // Clear canvas with black background
    drawRect(0, 0, canvas.width, canvas.height, '#000000');
    
    // Draw net
    drawNet();
    
    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#00ff88');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#ff00ff');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#00ff88');
    
    // Draw border
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// Update player paddle position
function updatePlayer() {
    // Arrow keys control
    if (keys.ArrowUp && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y + player.height < canvas.height) {
        player.y += player.speed;
    }
    
    // Mouse control
    const targetY = mouseY - player.height / 2;
    if (targetY >= 0 && targetY + player.height <= canvas.height) {
        player.y = targetY;
    }
}

// Update computer paddle position (AI)
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    
    // Simple AI: follow the ball
    if (computerCenter < ballCenter - 35) {
        if (computer.y + computer.height < canvas.height) {
            computer.y += computer.speed;
        }
    } else if (computerCenter > ballCenter + 35) {
        if (computer.y > 0) {
            computer.y -= computer.speed;
        }
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Ball collision with top/bottom walls
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.radius <= 0 ? ball.radius : canvas.height - ball.radius;
    }
    
    // Ball collision with paddles
    // Player paddle collision
    if (
        ball.x - ball.radius <= player.x + player.width &&
        ball.y >= player.y &&
        ball.y <= player.y + player.height &&
        ball.dx < 0
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * 2;
    }
    
    // Computer paddle collision
    if (
        ball.x + ball.radius >= computer.x &&
        ball.y >= computer.y &&
        ball.y <= computer.y + computer.height &&
        ball.dx > 0
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 2;
    }
    
    // Ball out of bounds (scoring)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
        updateScores();
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
        updateScores();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        updatePlayer();
        updateComputer();
        updateBall();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateScores();
gameLoop();