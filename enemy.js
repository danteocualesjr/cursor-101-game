class Enemy {
    constructor(x, y, row, col, totalRows) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.row = row;
        this.col = col;
        this.totalRows = totalRows;
        this.active = true;
        
        // Enemy types based on row
        if (row === 0) {
            // Top row - fastest, highest points
            this.width = 30;
            this.height = 30;
            this.points = 30;
            this.color = '#ff0';
            this.speed = 1;
        } else if (row <= 2) {
            // Middle rows
            this.width = 35;
            this.height = 35;
            this.points = 20;
            this.color = '#0ff';
            this.speed = 0.8;
        } else {
            // Bottom rows - slowest, lowest points
            this.width = 40;
            this.height = 40;
            this.points = 10;
            this.color = '#f00';
            this.speed = 0.6;
        }

        this.animationFrame = 0;
        this.canShoot = row === totalRows - 1; // Only bottom row can shoot
    }

    update(direction, downDistance) {
        if (!this.active) return;

        this.x += direction * this.speed;
        this.y += downDistance;
        this.animationFrame += 0.1;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Pulsing animation
        const pulse = Math.sin(this.animationFrame) * 2;
        const scale = 1 + pulse * 0.1;

        ctx.scale(scale, scale);

        // Draw enemy based on type
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        // Draw enemy shape (simplified invader shape)
        ctx.beginPath();
        
        // Top part
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(-this.width / 4, -this.height / 4);
        ctx.lineTo(-this.width / 2, 0);
        ctx.lineTo(-this.width / 4, this.height / 4);
        ctx.lineTo(0, this.height / 2);
        
        // Right side
        ctx.lineTo(this.width / 4, this.height / 4);
        ctx.lineTo(this.width / 2, 0);
        ctx.lineTo(this.width / 4, -this.height / 4);
        ctx.closePath();
        
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(-this.width / 6, -this.height / 6, this.width / 8, this.height / 8);
        ctx.fillRect(this.width / 12, -this.height / 6, this.width / 8, this.height / 8);

        ctx.restore();
        ctx.shadowBlur = 0;
    }

    shoot(bulletSpeed) {
        if (!this.active || !this.canShoot) return null;
        return new Bullet(this.x, this.y + this.height / 2, bulletSpeed, false);
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.active = true;
    }
}

class EnemyFormation {
    constructor(canvasWidth, canvasHeight, startY = 100) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.startY = startY;
        this.enemies = [];
        this.enemyBullets = [];
        this.direction = 1; // 1 for right, -1 for left
        this.moveDown = false;
        this.moveDownDistance = 0;
        this.speed = 1;
        this.shootCooldown = 0;
        this.shootCooldownTime = 120; // Frames between enemy shots
        
        this.createFormation();
    }

    createFormation() {
        const rows = 5;
        const cols = 11;
        const spacingX = 60;
        const spacingY = 50;
        const startX = (this.canvasWidth - (cols - 1) * spacingX) / 2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * spacingX;
                const y = this.startY + row * spacingY;
                this.enemies.push(new Enemy(x, y, row, col, rows));
            }
        }
    }

    update(level) {
        // Update speed based on level
        this.speed = 1 + (level - 1) * 0.2;
        this.shootCooldownTime = Math.max(60, 120 - (level - 1) * 10);

        // Get active enemies for boundary checking
        const activeEnemies = this.enemies.filter(e => e.active);
        if (activeEnemies.length === 0) return;

        // Find leftmost and rightmost enemies
        let leftmost = Math.min(...activeEnemies.map(e => e.x - e.width / 2));
        let rightmost = Math.max(...activeEnemies.map(e => e.x + e.width / 2));

        // Check if we need to change direction or move down
        if (rightmost >= this.canvasWidth - 20 || leftmost <= 20) {
            if (!this.moveDown) {
                this.direction *= -1;
                this.moveDown = true;
                this.moveDownDistance = 20;
            }
        }

        // Move enemies
        const moveDownAmount = this.moveDown ? this.moveDownDistance : 0;
        if (this.moveDown) {
            this.moveDownDistance = 0;
            this.moveDown = false;
        }

        activeEnemies.forEach(enemy => {
            enemy.update(this.direction * this.speed, moveDownAmount);
        });

        // Enemy shooting
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        } else {
            const bottomRowEnemies = activeEnemies.filter(e => e.canShoot && e.active);
            if (bottomRowEnemies.length > 0) {
                const randomEnemy = bottomRowEnemies[Math.floor(Math.random() * bottomRowEnemies.length)];
                const bullet = randomEnemy.shoot(3 + level * 0.5);
                if (bullet) {
                    this.enemyBullets.push(bullet);
                }
                this.shootCooldown = this.shootCooldownTime;
            }
        }

        // Update enemy bullets
        this.enemyBullets.forEach(bullet => bullet.update());
        this.enemyBullets = this.enemyBullets.filter(bullet => bullet.active && !bullet.isOffScreen(this.canvasHeight));
    }

    draw(ctx) {
        this.enemies.forEach(enemy => enemy.draw(ctx));
        this.enemyBullets.forEach(bullet => bullet.draw(ctx));
    }

    checkCollision(bullet) {
        for (let enemy of this.enemies) {
            if (enemy.active && bullet.checkCollision(enemy)) {
                enemy.active = false;
                return enemy;
            }
        }
        return null;
    }

    checkPlayerCollision(player) {
        // Check if any enemy reached the bottom
        const activeEnemies = this.enemies.filter(e => e.active);
        for (let enemy of activeEnemies) {
            if (enemy.y + enemy.height / 2 >= this.canvasHeight - 100) {
                return true;
            }
        }

        // Check if enemy collided with player
        for (let enemy of activeEnemies) {
            if (enemy.checkCollision && enemy.checkCollision(player)) {
                return true;
            }
            // Simple collision check
            const enemyBounds = enemy.getBounds();
            const playerBounds = player.getBounds();
            if (enemyBounds.x < playerBounds.x + playerBounds.width &&
                enemyBounds.x + enemyBounds.width > playerBounds.x &&
                enemyBounds.y < playerBounds.y + playerBounds.height &&
                enemyBounds.y + enemyBounds.height > playerBounds.y) {
                return true;
            }
        }
        return false;
    }

    checkBulletCollision(player) {
        for (let bullet of this.enemyBullets) {
            if (bullet.checkCollision(player)) {
                bullet.active = false;
                return true;
            }
        }
        return false;
    }

    allDestroyed() {
        return this.enemies.every(e => !e.active);
    }

    reset(level = 1) {
        this.enemies.forEach(enemy => enemy.reset());
        this.enemyBullets = [];
        this.direction = 1;
        this.moveDown = false;
        this.moveDownDistance = 0;
        this.shootCooldown = 0;
        this.speed = 1 + (level - 1) * 0.2;
    }
}
