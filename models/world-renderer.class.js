class WorldRenderer {
    world;

    /**
     * Creates a new WorldRenderer instance.
     * @param {World} world
     */
    constructor(world) {
        this.world = world;
    }

    /**
     * Draws a complete frame.
     * @returns {void}
     */
    draw() {
        if (this.world.isDestroyed) return;
        this.clearCanvas();
        this.drawBackgroundLayer();
        this.drawHudLayer();
        this.drawGameplayLayer();
        this.drawEndScreenIfNeeded();
        this.scheduleNextFrame();
    }

    /**
     * Clears the full canvas.
     * @returns {void}
     */
    clearCanvas() {
        this.world.ctx.clearRect(0, 0, this.world.canvas.width, this.world.canvas.height);
    }

    /**
     * Draws background objects and clouds.
     * @returns {void}
     */
    drawBackgroundLayer() {
        this.world.ctx.translate(this.world.camera_x, 0);
        this.addObjectsToMap(this.world.level.backgroundObjects);
        this.addObjectsToMap(this.world.level.clouds);
        this.world.ctx.translate(-this.world.camera_x, 0);
    }

    /**
     * Draws HUD bars.
     * @returns {void}
     */
    drawHudLayer() {
        this.addToMap(this.world.statusbar_health);
        if (this.world.isEndbossAwake()) this.addToMap(this.world.statusbar_endboss);
        this.addToMap(this.world.statusbar_coin);
        this.addToMap(this.world.statusbar_bottle);
        this.drawBottleCooldownRing();
    }

    /**
     * Draws bottle throw cooldown ring around bottle icon.
     * @returns {void}
     */
    drawBottleCooldownRing() {
        const progress = this.world.getThrowCooldownProgress();
        if (progress >= 1) return;
        const icon = this.world.statusbar_bottle;
        const centerX = icon.position_x + icon.width / 2;
        const centerY = icon.position_y + icon.height / 2;
        const radius = Math.max(icon.width, icon.height) / 2 - 2;
        this.drawCooldownRingTrack(centerX, centerY, radius);
        this.drawCooldownRingProgress(centerX, centerY, radius, progress);
    }

    /**
     * Draws the cooldown ring background track.
     * @param {number} centerX
     * @param {number} centerY
     * @param {number} radius
     * @returns {void}
     */
    drawCooldownRingTrack(centerX, centerY, radius) {
        this.world.ctx.save();
        this.world.ctx.strokeStyle = "rgba(255, 0, 0, 0.25)";
        this.world.ctx.lineWidth = 4;
        this.world.ctx.beginPath();
        this.world.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.world.ctx.stroke();
        this.world.ctx.restore();
    }

    /**
     * Draws cooldown ring progress arc.
     * @param {number} centerX
     * @param {number} centerY
     * @param {number} radius
     * @param {number} progress
     * @returns {void}
     */
    drawCooldownRingProgress(centerX, centerY, radius, progress) {
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + progress * Math.PI * 2;
        this.world.ctx.save();
        this.world.ctx.strokeStyle = "#ff0000";
        this.world.ctx.lineWidth = 4;
        this.world.ctx.lineCap = "round";
        this.world.ctx.beginPath();
        this.world.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        this.world.ctx.stroke();
        this.world.ctx.restore();
    }

    /**
     * Draws character, collectibles, enemies and throwable objects.
     * @returns {void}
     */
    drawGameplayLayer() {
        this.world.ctx.translate(this.world.camera_x, 0);
        this.addToMap(this.world.character);
        this.addObjectsToMap(this.world.collectibleCoins);
        this.addObjectsToMap(this.world.collectibleBottles);
        this.addObjectsToMap(this.world.level.enemies);
        this.addObjectsToMap(this.world.throwableObjects);
        this.world.ctx.translate(-this.world.camera_x, 0);
    }

    /**
     * Draws end screen depending on win or lose state.
     * @returns {void}
     */
    drawEndScreenIfNeeded() {
        if (!this.world.showEndScreen) return;
        if (this.world.endboss && this.world.endboss.health <= 0 && this.world.youWinImg.complete) {
            this.drawWinEndScreen();
            return;
        }
        if (this.world.character.health <= 0 && this.world.gameOverImg.complete) {
            this.drawGameOverEndScreen();
        }
    }

    /**
     * Draws the win end screen.
     * @returns {void}
     */
    drawWinEndScreen() {
        this.drawEndScreenBackground();
        this.drawCenteredEndImage(this.world.youWinImg, 0.9, 1, 96);
        this.drawWinCoinCounter();
    }

    /**
     * Draws the game over end screen.
     * @returns {void}
     */
    drawGameOverEndScreen() {
        this.drawEndScreenBackground();
        this.drawCenteredEndImage(this.world.gameOverImg, 0.8, 0.6, 24);
    }

    /**
     * Draws the black end screen background.
     * @returns {void}
     */
    drawEndScreenBackground() {
        this.world.ctx.fillStyle = "black";
        this.world.ctx.fillRect(0, 0, this.world.canvas.width, this.world.canvas.height);
    }

    /**
     * Draws centered end screen image.
     * @param {HTMLImageElement} image
     * @param {number} maxWidthFactor
     * @param {number} maxHeightFactor
     * @param {number} drawY
     * @returns {void}
     */
    drawCenteredEndImage(image, maxWidthFactor, maxHeightFactor, drawY) {
        const naturalWidth = image.naturalWidth || 1;
        const naturalHeight = image.naturalHeight || 1;
        const maxWidth = this.world.canvas.width * maxWidthFactor;
        const maxHeight = this.world.canvas.height * maxHeightFactor;
        const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
        const drawWidth = naturalWidth * scale;
        const drawHeight = naturalHeight * scale;
        const drawX = (this.world.canvas.width - drawWidth) / 2;
        this.world.ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    }

    /**
     * Draws the coin counter on the win end screen.
     * @returns {void}
     */
    drawWinCoinCounter() {
        const originalX = this.world.statusbar_coin.position_x;
        const originalY = this.world.statusbar_coin.position_y;
        const originalDisplayValue = this.world.statusbar_coin.displayValue;
        this.world.statusbar_coin.position_x = 16;
        this.world.statusbar_coin.position_y = this.world.canvas.height - this.world.statusbar_coin.height - 12;
        this.world.statusbar_coin.setByValue(this.world.coinCount, 5);
        this.world.statusbar_coin.draw(this.world.ctx);
        this.world.statusbar_coin.position_x = originalX;
        this.world.statusbar_coin.position_y = originalY;
        this.world.statusbar_coin.displayValue = originalDisplayValue;
    }

    /**
     * Handles add objects to map.
     * @param {Array<DrawableObject|MovableObject>} objects
     * @returns {void}
     */
    addObjectsToMap(objects) {
        objects.forEach((object) => this.addToMap(object));
    }

    /**
     * Handles add to map.
     * @param {DrawableObject|MovableObject} mo
     * @returns {void}
     */
    addToMap(mo) {
        if (mo.otherDirection) this.flipImage(mo);
        mo.draw(this.world.ctx);
        this.drawOffsetFrame(mo);
        if (mo.otherDirection) this.flipImageBack(mo);
    }

    /**
     * Draws a red frame around movable object offset bounds.
     * @param {DrawableObject|MovableObject} mo
     * @returns {void}
     */
    drawOffsetFrame(mo) {
        if (!(mo instanceof MovableObject)) return;
        const x = mo.getHitboxLeft();
        const y = mo.getHitboxTop();
        const w = mo.getHitboxRight() - x;
        const h = mo.getHitboxBottom() - y;
        this.world.ctx.save();
        this.world.ctx.strokeStyle = "red";
        this.world.ctx.lineWidth = 2;
        this.world.ctx.strokeRect(x, y, w, h);
        this.world.ctx.restore();
    }

    /**
     * Handles flip image.
     * @param {DrawableObject|MovableObject} mo
     * @returns {void}
     */
    flipImage(mo) {
        this.world.ctx.save();
        this.world.ctx.translate(mo.width, 0);
        this.world.ctx.scale(-1, 1);
        mo.position_x = mo.position_x * -1;
    }

    /**
     * Handles flip image back.
     * @param {DrawableObject|MovableObject} mo
     * @returns {void}
     */
    flipImageBack(mo) {
        mo.position_x = mo.position_x * -1;
        this.world.ctx.restore();
    }

    /**
     * Schedules next render frame.
     * @returns {void}
     */
    scheduleNextFrame() {
        this.world.animationFrameId = requestAnimationFrame(() => this.draw());
    }
}
