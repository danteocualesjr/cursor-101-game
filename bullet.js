class Bullet {
    constructor(x, y, speed, isPlayerBullet = true) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = speed;
        this.isPlayerBullet = isPlayerBullet;
        this.active = true;
    }

    update() {
        if (this.isPlayerBullet) {
            this.y -= this.speed;
        } else {
            this.y += this.speed;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.fillStyle = this.isPlayerBullet ? '#0f0' : '#f00';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.isPlayerBullet ? '#0f0' : '#f00';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    isOffScreen(canvasHeight) {
        return this.y < 0 || this.y > canvasHeight;
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    checkCollision(target) {
        const bulletBounds = this.getBounds();
        const targetBounds = target.getBounds ? target.getBounds() : {
            x: target.x - target.width / 2,
            y: target.y - target.height / 2,
            width: target.width,
            height: target.height
        };

        return bulletBounds.x < targetBounds.x + targetBounds.width &&
               bulletBounds.x + bulletBounds.width > targetBounds.x &&
               bulletBounds.y < targetBounds.y + targetBounds.height &&
               bulletBounds.y + bulletBounds.height > targetBounds.y;
    }
}
