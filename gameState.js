class GameState {
    constructor() {
        this.currentState = 'menu'; // 'menu', 'playing', 'gameOver'
    }

    setState(newState) {
        this.currentState = newState;
    }

    isMenu() {
        return this.currentState === 'menu';
    }

    isPlaying() {
        return this.currentState === 'playing';
    }

    isGameOver() {
        return this.currentState === 'gameOver';
    }

    showMenu() {
        
        const menu = document.getElementById('startMenu');
        const gameOver = document.getElementById('gameOverScreen');
        if (menu) menu.classList.remove('hidden');
        if (gameOver) gameOver.classList.add('hidden');
        this.currentState = 'menu';
    }

    showGameOver(finalScore, isNewHighScore) {
        const menu = document.getElementById('startMenu');
        const gameOver = document.getElementById('gameOverScreen');
        const finalScoreElement = document.getElementById('final-score');
        const highScoreMessage = document.getElementById('high-score-message');
        
        if (menu) menu.classList.add('hidden');
        if (gameOver) gameOver.classList.remove('hidden');
        if (finalScoreElement) finalScoreElement.textContent = finalScore;
        
        if (highScoreMessage) {
            if (isNewHighScore) {
                highScoreMessage.textContent = '🎉 NEW HIGH SCORE! 🎉';
                highScoreMessage.style.color = '#0f0';
            } else {
                highScoreMessage.textContent = '';
            }
        }
        
        this.currentState = 'gameOver';
    }

    hideAllMenus() {
        const menu = document.getElementById('startMenu');
        const gameOver = document.getElementById('gameOverScreen');
        if (menu) menu.classList.add('hidden');
        if (gameOver) gameOver.classList.add('hidden');
        this.currentState = 'playing';
    }
}
