class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 2;
        this.active = true;
        this.type = this.getRandomType();
        this.animationFrame = 0;
    }

    getRandomType() {
        const types = ['rapidFire', 'multiShot', 'shield'];
        return types[Math.floor(Math.random() * types.length)];
    }

    update() {
        this.y += this.speed;
        this.animationFrame += 0.1;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.animationFrame);

        // Draw power-up based on type
        switch (this.type) {
            case 'rapidFire':
                this.drawRapidFire(ctx);
                break;
            case 'multiShot':
                this.drawMultiShot(ctx);
                break;
            case 'shield':
                this.drawShield(ctx);
                break;
        }

        ctx.restore();

        // Add pulsing glow effect
        const glowIntensity = Math.sin(this.animationFrame * 2) * 0.3 + 0.7;
        ctx.shadowBlur = 15 * glowIntensity;
        ctx.shadowColor = this.getColor();
        ctx.fillStyle = this.getColor();
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    drawRapidFire(ctx) {
        ctx.fillStyle = '#ff0';
        // Draw lightning bolt shape
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(-5, 0);
        ctx.lineTo(0, 5);
        ctx.lineTo(5, 0);
        ctx.lineTo(0, this.height / 2);
        ctx.closePath();
        ctx.fill();
    }

    drawMultiShot(ctx) {
        ctx.fillStyle = '#0ff';
        // Draw triple shot icon
        ctx.beginPath();
        ctx.arc(-8, 0, 4, 0, Math.PI * 2);
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.arc(8, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawShield(ctx) {
        ctx.fillStyle = '#0f0';
        // Draw shield shape
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, Math.PI, 0, false);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();
    }

    getColor() {
        switch (this.type) {
            case 'rapidFire': return '#ff0';
            case 'multiShot': return '#0ff';
            case 'shield': return '#0f0';
            default: return '#fff';
        }
    }

    isOffScreen(canvasHeight) {
        return this.y > canvasHeight + this.height;
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
        const powerUpBounds = this.getBounds();
        const targetBounds = target.getBounds ? target.getBounds() : {
            x: target.x - target.width / 2,
            y: target.y - target.height / 2,
            width: target.width,
            height: target.height
        };

        return powerUpBounds.x < targetBounds.x + targetBounds.width &&
               powerUpBounds.x + powerUpBounds.width > targetBounds.x &&
               powerUpBounds.y < targetBounds.y + targetBounds.height &&
               powerUpBounds.y + powerUpBounds.height > targetBounds.y;
    }
}
