class Player {
    constructor(x, y, canvasWidth) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 30;
        this.speed = 5;
        this.canvasWidth = canvasWidth;
        this.lives = 3;
        this.bullets = [];
        this.shootCooldown = 0;
        this.baseShootCooldown = 15;
        this.shootCooldownTime = this.baseShootCooldown;
        
        // Power-up states
        this.rapidFire = false;
        this.rapidFireTime = 0;
        this.multiShot = false;
        this.multiShotTime = 0;
        this.shield = false;
        this.shieldTime = 0;
        this.shieldAnimation = 0;
    }

    update(keys) {
        // Movement
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.x += this.speed;
        }

        // Boundary checking
        this.x = Math.max(this.width / 2, Math.min(this.canvasWidth - this.width / 2, this.x));

        // Shooting
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }

        if ((keys[' '] || keys['Space']) && this.shootCooldown === 0) {
            this.shoot();
            this.shootCooldown = this.shootCooldownTime;
        }

        // Update bullets
        this.bullets.forEach(bullet => bullet.update());
        this.bullets = this.bullets.filter(bullet => bullet.active);

        // Update power-up timers
        this.updatePowerUps();
    }

    shoot() {
        const bulletSpeed = 8;
        
        if (this.multiShot) {
            // Triple shot
            this.bullets.push(new Bullet(this.x, this.y, bulletSpeed, true));
            this.bullets.push(new Bullet(this.x - 15, this.y, bulletSpeed, true));
            this.bullets.push(new Bullet(this.x + 15, this.y, bulletSpeed, true));
        } else {
            // Single shot
            this.bullets.push(new Bullet(this.x, this.y, bulletSpeed, true));
        }
    }

    updatePowerUps() {
        // Rapid fire power-up
        if (this.rapidFire) {
            this.rapidFireTime--;
            this.shootCooldownTime = Math.floor(this.baseShootCooldown / 3);
            if (this.rapidFireTime <= 0) {
                this.rapidFire = false;
                this.shootCooldownTime = this.baseShootCooldown;
            }
        }

        // Multi-shot power-up
        if (this.multiShot) {
            this.multiShotTime--;
            if (this.multiShotTime <= 0) {
                this.multiShot = false;
            }
        }

        // Shield power-up
        if (this.shield) {
            this.shieldTime--;
            this.shieldAnimation += 0.2;
            if (this.shieldTime <= 0) {
                this.shield = false;
            }
        }
    }

    activatePowerUp(powerUp) {
        const duration = 600; // 10 seconds at 60 FPS

        switch (powerUp.type) {
            case 'rapidFire':
                this.rapidFire = true;
                this.rapidFireTime = duration;
                break;
            case 'multiShot':
                this.multiShot = true;
                this.multiShotTime = duration;
                break;
            case 'shield':
                this.shield = true;
                this.shieldTime = duration;
                break;
        }
    }

    takeDamage() {
        if (this.shield) {
            // Shield absorbs damage
            this.shield = false;
            this.shieldTime = 0;
            return false; // No damage taken
        }
        
        this.lives--;
        return true; // Damage taken
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.lives = 3;
        this.bullets = [];
        this.shootCooldown = 0;
        this.rapidFire = false;
        this.rapidFireTime = 0;
        this.multiShot = false;
        this.multiShotTime = 0;
        this.shield = false;
        this.shieldTime = 0;
        this.shootCooldownTime = this.baseShootCooldown;
    }

    draw(ctx) {
        // Draw shield if active
        if (this.shield) {
            ctx.strokeStyle = '#0f0';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#0f0';
            ctx.beginPath();
            const shieldRadius = this.width / 2 + 10 + Math.sin(this.shieldAnimation) * 5;
            ctx.arc(this.x, this.y, shieldRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Draw player ship
        ctx.fillStyle = '#0f0';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0f0';
        
        // Ship body (triangle)
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 2);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.closePath();
        ctx.fill();

        // Ship details
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x - 5, this.y - 5, 10, 10);

        ctx.shadowBlur = 0;

        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(ctx));
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}
