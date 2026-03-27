class World {
    character = new Character();
    endboss = null;
    statusbar_health = new Statusbar("health", 16, 0);
    statusbar_coin = new Statusbar("coin", 160, 0);
    statusbar_bottle = new Statusbar("bottle", 264, 0);
    statusbar_endboss = new Statusbar("endboss", 16, 64);
    coinCount = 0;
    collectibleCoins = [];
    collectibleBottles = [];
    throwableObjects = [];
    throwableBottleCount = 1;
    canvas;
    ctx;
    keyboard;
    throwKeyHandled = false;
    camera_x = 0;
    intervals = [];
    isPaused = false;
    gameOverTriggered = false;
    showEndScreen = false;
    gameOverImg;
    youWinImg;
    animationFrameId = null;
    endScreenTimeout = null;
    isDestroyed = false;


    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.level = createLevel1();
        this.gameOverImg = new Image();
        this.gameOverImg.src = "assets/img/You won, you lost/Game Over.png";
        this.youWinImg = new Image();
        this.youWinImg.src = "assets/img/You won, you lost/You win B.png";
        this.draw();
        this.setWorld();
        this.runInterval();
        this.character.applyGravity();
    }

    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach((enemy) => enemy.world = this);
        this.endboss = this.level.enemies.find((enemy) => enemy instanceof Endboss) || null;
        this.collectibleCoins = this.level.collectibleCoins || [];
        this.collectibleCoins.forEach((coin) => coin.world = this);
        this.collectibleBottles = this.level.collectibleBottles || [];
        this.collectibleBottles.forEach((bottle) => bottle.world = this);
        this.updateStatusbars();
        this.collectObjectIntervals(this.character);
        this.level.enemies.forEach((enemy) => this.collectObjectIntervals(enemy));
    }

    draw() {
        if (this.isDestroyed) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);

        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusbar_health);
        if (this.isEndbossAwake()) {
            this.addToMap(this.statusbar_endboss);
        }
        this.addToMap(this.statusbar_coin);
        this.addToMap(this.statusbar_bottle);
        this.ctx.translate(this.camera_x, 0);

        this.addToMap(this.character);
        this.addObjectsToMap(this.collectibleCoins);
        this.addObjectsToMap(this.collectibleBottles);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.ctx.translate(-this.camera_x, 0);

        if (this.showEndScreen) {
            if (this.endboss && this.endboss.health <= 0 && this.youWinImg.complete) {
                this.ctx.drawImage(this.youWinImg, 0, 0, this.canvas.width, this.canvas.height);
            } else if (this.character.health <= 0 && this.gameOverImg.complete) {
                this.ctx.fillStyle = "black";
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                const naturalWidth = this.gameOverImg.naturalWidth || 1;
                const naturalHeight = this.gameOverImg.naturalHeight || 1;
                const maxWidth = this.canvas.width * 0.8;
                const maxHeight = this.canvas.height * 0.6;
                const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
                const drawWidth = naturalWidth * scale;
                const drawHeight = naturalHeight * scale;
                const drawX = (this.canvas.width - drawWidth) / 2;
                const drawY = 24;
                this.ctx.drawImage(this.gameOverImg, drawX, drawY, drawWidth, drawHeight);
            }
        }

        let self = this;
        this.animationFrameId = requestAnimationFrame(function() {
            self.draw();
        });
    }

    addObjectsToMap(objects) {
        objects.forEach((object => {
            this.addToMap(object);
        }));
    }

    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        }
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);
        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.position_x = mo.position_x * -1;
    }

    flipImageBack(mo) {
        mo.position_x = mo.position_x * -1;
        this.ctx.restore();
    }

    runInterval() {
        this.mainInterval = setInterval(() => {
            if (this.isPaused) return;
            this.checkCollisions();
            this.checkCollectibleCoins();
            this.checkCollectibleBottles();
            this.updateStatusbars();
            this.checkGameOver();
            if (this.isPaused) return;
            this.checkThrowObjects();
        }, 1000 / 60);
        this.registerInterval(this.mainInterval);
    }

    updateStatusbars() {
        this.statusbar_health.setPercentage(this.character.health);
        this.statusbar_coin.setByValue(this.coinCount, 5);
        this.statusbar_bottle.setByValue(this.throwableBottleCount, 5);
        if (this.endboss) {
            this.statusbar_endboss.setByValue(this.endboss.health, this.endboss.max_health || 180);
        }
    }

    isEndbossAwake() {
        return !!this.endboss && this.endboss.state !== "idle";
    }

    checkCollectibleCoins() {
        this.collectibleCoins = this.collectibleCoins.filter((coin) => {
            if (!this.character.isColliding(coin)) return true;
            this.coinCount++;
            this.updateStatusbars();
            return false;
        });
    }

    checkCollectibleBottles() {
        this.collectibleBottles = this.collectibleBottles.filter((bottle) => {
            if (!this.character.isColliding(bottle)) return true;
            this.throwableBottleCount++;
            this.updateStatusbars();
            return false;
        });
    }

    setPaused(value) {
        this.isPaused = value;
    }

    registerInterval(intervalId) {
        if (!intervalId || this.intervals.includes(intervalId)) return intervalId;
        this.intervals.push(intervalId);
        return intervalId;
    }

    collectObjectIntervals(object) {
        if (!object) return;
        const intervalKeys = [
            "gravityInterval",
            "movementInterval",
            "animationInterval",
            "attackInterval",
            "throwInterval",
            "rotatingInterval",
            "splashInterval"
        ];
        intervalKeys.forEach((key) => this.registerInterval(object[key]));
    }

    checkCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (enemy.health <= 0) return;
            if (this.character.isColliding(enemy)) {
                if (this.isStomp(enemy)) {
                    this.characterStompEnemy(enemy);
                } else {
                    this.enemyHitCharacter(enemy);
                }
            }
        });
    }

    isStomp(enemy) {
        const isAboveEnemy = this.character.getLastHitboxBottom() <= enemy.getHitboxTop() + 10;
        const isFalling = this.character.speed_y <= 0;
        const isStomp = isAboveEnemy && isFalling;
        return isStomp;
    }

    enemyHitCharacter(enemy) {
        this.character.hit(enemy);
        this.updateStatusbars();
        this.checkGameOver();
    }

    checkGameOver() {
        if (this.gameOverTriggered) return;
        const characterDead = this.character.health <= 0;
        const endbossDead = this.endboss && this.endboss.health <= 0;
        if (!characterDead && !endbossDead) return;
        this.gameOverTriggered = true;
        this.stopInput();
        this.endScreenTimeout = setTimeout(() => {
            if (this.isDestroyed) return;
            this.showEndScreen = true;
            this.setPaused(true);
            window.showGameOverActions?.();
        }, 2000);
    }

    destroy() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        this.setPaused(true);
        this.stopInput();
        this.intervals.forEach((intervalId) => clearInterval(intervalId));
        this.intervals = [];
        if (this.endScreenTimeout) {
            clearTimeout(this.endScreenTimeout);
            this.endScreenTimeout = null;
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    stopInput() {
        this.keyboard.RIGHT = false;
        this.keyboard.LEFT = false;
        this.keyboard.SPACE = false;
        this.keyboard.THROW = false;
    }

    characterStompEnemy(enemy) {
        enemy.hit(this.character);
        this.character.speed_y = 10;
    }

    checkThrowObjects() {
        if (this.keyboard.THROW && !this.throwKeyHandled && this.throwableBottleCount > 0) {
            let bottle = new ThrowableObject(this.character.position_x + 30, this.character.position_y + 100, this.character.otherDirection, this);
            this.throwableObjects.push(bottle);
            this.collectObjectIntervals(bottle);
            this.throwableBottleCount--;
            this.updateStatusbars();
            this.throwKeyHandled = true;
        }
        if (!this.keyboard.THROW) {
            this.throwKeyHandled = false;
        }
    }
}