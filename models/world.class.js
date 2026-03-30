class World {
    character = new Character();
    endboss = null;
    statusbar_health = new Statusbar("health", 16, 0);
    statusbar_coin = new Statusbar("coin", 168, 0);
    statusbar_bottle = new Statusbar("bottle", 280, 0);
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
    throwCooldownMs = 5000;
    lastThrowAt = 0;
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

    /**
     * Creates a new World instance.
        * @param {HTMLCanvasElement} canvas
        * @param {Keyboard} keyboard
     */
    constructor(canvas, keyboard) {
        this.initializeCoreState(canvas, keyboard);
        this.initializeEndScreenImages();
        this.startWorldSystems();
    }

    /**
     * Initializes core world state.
     * @param {HTMLCanvasElement} canvas
     * @param {Keyboard} keyboard
     * @returns {void}
     */
    initializeCoreState(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.level = createLevel1();
        this.renderer = new WorldRenderer(this);
    }

    /**
     * Initializes end screen images.
     * @returns {void}
     */
    initializeEndScreenImages() {
        this.gameOverImg = new Image();
        this.gameOverImg.src = "assets/img/You won, you lost/Game Over.png";
        this.youWinImg = new Image();
        this.youWinImg.src = "assets/img/You won, you lost/You win B.png";
    }

    /**
     * Starts world systems.
     * @returns {void}
     */
    startWorldSystems() {
        this.draw();
        this.setWorld();
        this.runInterval();
        this.character.applyGravity();
    }

    /**
     * Sets world.
     */
    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach((enemy) => enemy.world = this);
        this.level.clouds.forEach((cloud) => cloud.world = this);
        this.endboss = this.level.enemies.find((enemy) => enemy instanceof Endboss) || null;
        this.collectibleCoins = this.level.collectibleCoins || [];
        this.collectibleCoins.forEach((coin) => coin.world = this);
        this.collectibleBottles = this.level.collectibleBottles || [];
        this.collectibleBottles.forEach((bottle) => bottle.world = this);
        this.updateStatusbars();
        this.collectObjectIntervals(this.character);
        this.level.clouds.forEach((cloud) => this.collectObjectIntervals(cloud));
        this.level.enemies.forEach((enemy) => this.collectObjectIntervals(enemy));
    }

    /**
     * Draws the object.
        * @returns {void}
     */
    draw() {
        this.renderer.draw();
    }

    /**
     * Handles run interval.
        * @returns {void}
     */
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

    /**
     * Updates statusbars.
     */
    updateStatusbars() {
        this.statusbar_health.setPercentage(this.character.health);
        this.statusbar_coin.setByValue(this.coinCount, 5);
        this.statusbar_bottle.setByValue(this.throwableBottleCount, 5);
        if (this.endboss) {
            this.statusbar_endboss.setByValue(this.endboss.health, this.endboss.max_health || 180);
        }
    }

    /**
     * Checks whether endboss awake.
        * @returns {boolean}
     */
    isEndbossAwake() {
        return !!this.endboss && this.endboss.state !== "idle";
    }

    /**
     * Checks collectible coins.
        * @returns {void}
     */
    checkCollectibleCoins() {
        this.collectibleCoins = this.collectibleCoins.filter((coin) => {
            if (!this.character.isColliding(coin)) return true;
            this.coinCount++;
            window.audioManager?.play("collect.coin");
            this.updateStatusbars();
            return false;
        });
    }

    /**
     * Checks collectible bottles.
        * @returns {void}
     */
    checkCollectibleBottles() {
        this.collectibleBottles = this.collectibleBottles.filter((bottle) => {
            if (!this.character.isColliding(bottle)) return true;
            this.throwableBottleCount++;
            window.audioManager?.play("collect.bottle");
            this.updateStatusbars();
            return false;
        });
    }

    /**
     * Sets paused.
        * @param {boolean} value
     */
    setPaused(value) {
        this.isPaused = value;
    }

    /**
     * Handles register interval.
        * @param {(number|undefined)} intervalId
        * @returns {(number|undefined)}
     */
    registerInterval(intervalId) {
        if (!intervalId || this.intervals.includes(intervalId)) return intervalId;
        this.intervals.push(intervalId);
        return intervalId;
    }

    /**
     * Handles collect object intervals.
        * @param {object} object
        * @returns {void}
     */
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

    /**
     * Checks collisions.
        * @returns {void}
     */
    checkCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (enemy.health <= 0) return;
            if (this.isStomp(enemy)) return this.characterStompEnemy(enemy);
            if (!this.character.isColliding(enemy)) return;
            if (this.shouldEnemyDamageCharacter(enemy)) this.enemyHitCharacter(enemy);
        });
    }

    /**
     * Checks whether enemy collision should damage character.
     * @param {MovableObject} enemy
     * @returns {boolean}
     */
    shouldEnemyDamageCharacter(enemy) {
        const hitboxHeight = enemy.getHitboxBottom() - enemy.getHitboxTop();
        const safeTopZone = Math.max(10, Math.min(20, hitboxHeight * 0.4));
        const characterBottom = this.character.getHitboxBottom();
        return characterBottom > enemy.getHitboxTop() + safeTopZone;
    }

    /**
     * Checks whether stomp.
        * @param {MovableObject} enemy
        * @returns {boolean}
     */
    isStomp(enemy) {
        const isHorizontallyOverlapping = this.character.getHitboxRight() > enemy.getHitboxLeft() &&
            this.character.getHitboxLeft() < enemy.getHitboxRight();
        if (!isHorizontallyOverlapping) return false;
        const enemyTop = enemy.getHitboxTop();
        const previousBottom = this.character.getLastHitboxBottom();
        const currentBottom = this.character.getHitboxBottom();
        const isFalling = this.character.speed_y < 0;
        const crossedEnemyTop = previousBottom < enemyTop - 2 && currentBottom >= enemyTop - 2;
        const isAtTopEdge = currentBottom >= enemyTop - 6 && currentBottom <= enemyTop + 8;
        return isFalling && (crossedEnemyTop || isAtTopEdge);
    }

    /**
     * Handles enemy hit character.
        * @param {MovableObject} enemy
     */
    enemyHitCharacter(enemy) {
        this.character.hit(enemy);
        this.updateStatusbars();
        this.checkGameOver();
    }

    /**
     * Checks game over.
        * @returns {void}
     */
    checkGameOver() {
        if (this.gameOverTriggered) return;
        const characterDead = this.character.health <= 0;
        const endbossDead = this.endboss && this.endboss.health <= 0;
        if (!characterDead && !endbossDead) return;
        this.gameOverTriggered = true;
        const endSoundKey = characterDead ? "game.lose" : "game.win";
        this.stopInput();
        this.endScreenTimeout = setTimeout(() => {
            if (this.isDestroyed) return;
            this.showEndScreen = true;
            window.audioManager?.play(endSoundKey);
            this.setPaused(true);
            window.showGameOverActions?.();
        }, 2000);
    }

     /**
      * Disposes world runtime resources.
          * @returns {void}
      */
     disposeWorldRuntime() {
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

    /**
     * Stops input.
     */
    stopInput() {
        this.keyboard.RIGHT = false;
        this.keyboard.LEFT = false;
        this.keyboard.SPACE = false;
        this.keyboard.THROW = false;
    }

    /**
     * Handles character stomp enemy.
        * @param {MovableObject} enemy
     */
    characterStompEnemy(enemy) {
        enemy.hit(this.character);
        this.character.speed_y = 10;
    }

    /**
     * Checks throw objects.
     */
    checkThrowObjects() {
        if (!this.keyboard.THROW) return this.throwKeyHandled = false;
        if (this.throwKeyHandled || !this.canThrowBottleNow()) return;
        this.throwBottle();
        this.throwKeyHandled = true;
    }

    /**
     * Checks whether bottle can be thrown now.
     * @returns {boolean}
     */
    canThrowBottleNow() {
        if (this.throwableBottleCount <= 0) return false;
        return Date.now() - this.lastThrowAt >= this.throwCooldownMs;
    }

    /**
     * Throws one bottle and updates related state.
     * @returns {void}
     */
    throwBottle() {
        const bottle = new ThrowableObject(this.character.position_x + 30, this.character.position_y + 100, this.character.otherDirection, this);
        this.throwableObjects.push(bottle);
        this.collectObjectIntervals(bottle);
        this.throwableBottleCount--;
        this.lastThrowAt = Date.now();
        this.updateStatusbars();
    }

    /**
     * Returns normalized bottle throw cooldown progress.
     * @returns {number}
     */
    getThrowCooldownProgress() {
        if (this.lastThrowAt === 0) return 1;
        const elapsedMs = Date.now() - this.lastThrowAt;
        const progress = elapsedMs / this.throwCooldownMs;
        return Math.max(0, Math.min(1, progress));
    }
}