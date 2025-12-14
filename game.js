class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        this.gameState = new GameState();
        this.keys = {};
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.level = 1;
        this.powerUps = [];
        this.powerUpDropChance = 0.1; // 10% chance

        this.player = null;
        this.enemyFormation = null;

        this.animationId = null;
        this.lastTime = 0;

        this.setupEventListeners();
        this.updateHUD();
    }

    setupCanvas() {
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Make it responsive
        const maxWidth = window.innerWidth - 20;
        const maxHeight = window.innerHeight - 20;
        const scale = Math.min(maxWidth / 800, maxHeight / 600, 1);
        
        if (scale < 1) {
            this.canvas.style.width = (800 * scale) + 'px';
            this.canvas.style.height = (600 * scale) + 'px';
        }
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Start button
        const startButton = document.getElementById('startButton');
        const gameInstance = this;
        if (startButton) {
            const startHandler = () => {
                console.log('Start button clicked');
                gameInstance.startGame();
            };
            startButton.addEventListener('click', startHandler);
            startButton.onclick = startHandler;
        }

        // Restart button
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            const restartHandler = () => {
                console.log('Restart button clicked');
                gameInstance.startGame();
            };
            restartButton.addEventListener('click', restartHandler);
            restartButton.onclick = restartHandler;
        }

        // Window resize
        window.addEventListener('resize', () => this.setupCanvas());
    }

    startGame() {
        this.gameState.hideAllMenus();
        this.score = 0;
        this.level = 1;
        this.powerUps = [];

        // Initialize player
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 50, this.canvas.width);

        // Initialize enemy formation
        this.enemyFormation = new EnemyFormation(this.canvas.width, this.canvas.height);

        this.updateHUD();
        this.gameLoop();
    }

    gameLoop(currentTime = 0) {
        if (!this.gameState.isPlaying()) {
            return;
        }

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update game
        this.update();

        // Draw game
        this.draw();

        // Continue loop
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    update() {
        // Update player
        this.player.update(this.keys);

        // Update enemy formation
        this.enemyFormation.update(this.level);

        // Check collisions: Player bullets vs Enemies
        this.player.bullets.forEach((bullet, bulletIndex) => {
            const hitEnemy = this.enemyFormation.checkCollision(bullet);
            if (hitEnemy) {
                bullet.active = false;
                this.score += hitEnemy.points;
                this.updateHUD();

                // Chance to drop power-up
                if (Math.random() < this.powerUpDropChance) {
                    this.powerUps.push(new PowerUp(hitEnemy.x, hitEnemy.y));
                }

                // Check if all enemies destroyed
                if (this.enemyFormation.allDestroyed()) {
                    this.nextLevel();
                }
            }
        });

        // Remove inactive bullets
        this.player.bullets = this.player.bullets.filter(b => b.active);

        // Update power-ups
        this.powerUps.forEach(powerUp => powerUp.update());
        this.powerUps = this.powerUps.filter(p => p.active && !p.isOffScreen(this.canvas.height));

        // Check power-up collisions with player
        this.powerUps.forEach((powerUp, index) => {
            if (powerUp.checkCollision(this.player)) {
                this.player.activatePowerUp(powerUp);
                powerUp.active = false;
            }
        });

        // Check enemy bullet collisions with player
        if (this.enemyFormation.checkBulletCollision(this.player)) {
            if (this.player.takeDamage()) {
                if (this.player.lives <= 0) {
                    this.gameOver();
                    return;
                }
                this.updateHUD();
                // Brief invincibility/reset position
                this.player.x = this.canvas.width / 2;
            }
        }

        // Check if enemies reached bottom or collided with player
        if (this.enemyFormation.checkPlayerCollision(this.player)) {
            this.player.lives = 0;
            this.gameOver();
            return;
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stars background (simple effect)
        this.drawStars();

        // Draw power-ups
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));

        // Draw enemy formation
        this.enemyFormation.draw(this.ctx);

        // Draw player
        this.player.draw(this.ctx);
    }

    drawStars() {
        // Simple starfield effect
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 53 + Date.now() * 0.01) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }

    nextLevel() {
        this.level++;
        this.powerUps = [];
        this.player.bullets = [];
        this.player.x = this.canvas.width / 2;
        
        // Increase difficulty
        this.enemyFormation.reset(this.level);
        this.powerUpDropChance = Math.min(0.2, 0.1 + (this.level - 1) * 0.02);
        
        this.updateHUD();
    }

    gameOver() {
        cancelAnimationFrame(this.animationId);
        
        // Check for new high score
        const isNewHighScore = this.score > this.highScore;
        if (isNewHighScore) {
            this.highScore = this.score;
            this.saveHighScore(this.highScore);
        }
        
        this.updateHUD();
        this.gameState.showGameOver(this.score, isNewHighScore);
    }

    updateHUD() {
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('high-score');
        const livesElement = document.getElementById('lives');
        const levelElement = document.getElementById('level');
        const menuHighScoreElement = document.getElementById('menu-high-score');

        if (scoreElement) scoreElement.textContent = this.score;
        if (highScoreElement) highScoreElement.textContent = this.highScore;
        if (menuHighScoreElement) menuHighScoreElement.textContent = this.highScore;
        if (livesElement) livesElement.textContent = this.player ? this.player.lives : 3;
        if (levelElement) levelElement.textContent = this.level;
    }

    loadHighScore() {
        try {
            const saved = localStorage.getItem('spaceInvadersHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    }

    saveHighScore(score) {
        try {
            localStorage.setItem('spaceInvadersHighScore', score.toString());
        } catch (e) {
            console.error('Failed to save high score:', e);
        }
    }
}

// Initialize game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    // Update high score display on menu
    const menuHighScore = document.getElementById('menu-high-score');
    if (menuHighScore) {
        menuHighScore.textContent = game.highScore;
    }
});
