class World {
    character = new Character();
    endboss = null;
    statusbar_health = new Statusbar();
    throwableObjects = [];
    level = level1;
    canvas;
    ctx;
    keyboard;
    throwKeyHandled = false;
    camera_x = 0;
    intervals = [];
    isPaused = false;
    gameOverTriggered = false;


    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
        this.runInterval();
        this.character.applyGravity();
    }

    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach((enemy) => enemy.world = this);
        this.endboss = this.level.enemies.find((enemy) => enemy instanceof Endboss) || null;
        this.collectObjectIntervals(this.character);
        this.level.enemies.forEach((enemy) => this.collectObjectIntervals(enemy));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);

        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusbar_health);
        this.ctx.translate(this.camera_x, 0);

        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.ctx.translate(-this.camera_x, 0);

        let self = this;
        requestAnimationFrame(function() {
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
            this.checkGameOver();
            if (this.isPaused) return;
            this.checkThrowObjects();
        }, 1000 / 60);
        this.registerInterval(this.mainInterval);
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
        this.statusbar_health.setPercentage(this.character.health);
        this.checkGameOver();
    }

    checkGameOver() {
        if (this.gameOverTriggered) return;
        const characterDead = this.character.health <= 0;
        const endbossDead = this.endboss && this.endboss.health <= 0;
        if (!characterDead && !endbossDead) return;
        this.gameOverTriggered = true;
        setTimeout(() => {
            this.setPaused(true);
            this.keyboard.RIGHT = false;
            this.keyboard.LEFT = false;
            this.keyboard.SPACE = false;
            this.keyboard.THROW = false;
        }, 2000);
    }

    characterStompEnemy(enemy) {
        enemy.hit(this.character);
        this.character.speed_y = 10;
    }

    checkThrowObjects() {
        if (this.keyboard.THROW && !this.throwKeyHandled) {
            let bottle = new ThrowableObject(this.character.position_x + 30, this.character.position_y + 100, this.character.otherDirection, this);
            this.throwableObjects.push(bottle);
            this.collectObjectIntervals(bottle);
            this.throwKeyHandled = true;
        }
        if (!this.keyboard.THROW) {
            this.throwKeyHandled = false;
        }
    }
}