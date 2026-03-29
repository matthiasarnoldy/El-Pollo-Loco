class ThrowableObject extends MovableObject {
    position_x = 100;
    position_y = 100;
    speed_x = 0.1;
    speed_y = 0;;
    damage = 40;
    hasHit = false;
    isRemoved = false;
    groundBottom_y = 428;
    rotatingInterval;
    offset = {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
    };
    IMAGES_ROTATING = [
        "assets/img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png",
    ];
    IMAGES_SPLASH = [
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
    ];
    world;

    /**
     * Creates a new ThrowableObject instance.
        * @param {number} x
        * @param {number} y
        * @param {boolean} otherDirection
        * @param {World} world
     */
    constructor(x, y, otherDirection, world) {
        super().loadImage(this.IMAGES_ROTATING[0]);
        this.loadImages(this.IMAGES_ROTATING);
        this.loadImages(this.IMAGES_SPLASH);
        this.position_x = x;
        this.position_y = y;
        this.otherDirection = otherDirection;
        this.width = 50;
        this.height = 60;
        this.world = world;
        this.throw();
    }

    /**
     * Handles throw.
        * @returns {void}
     */
    throw() {
        this.animate();
        this.speed_y = 15;
        this.applyGravity();
        this.throwInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            if (this.hasHit) return;
            this.position_x += this.otherDirection ? -8 : 8;
            this.hitEnemy();
            this.hitGround();
        }, 1000 / 60);
        this.world?.registerInterval(this.throwInterval);
    }

    /**
     * Handles hit enemy.
        * @returns {void}
     */
    hitEnemy() {
        if (this.hasHit || !this.world) return;
        const enemy = this.findCollidingEnemy();
        if (!enemy) return;
        const zone = this.getHitZone(enemy);
        this.applyDamageToEnemy(enemy, zone);
        this.finishHit();
    }

    /**
     * Finds colliding enemy.
        * @returns {(MovableObject|null)}
     */
    findCollidingEnemy() {
        return this.world.level.enemies.find(enemy =>
            enemy.health > 0 && this.isEnemyColliding(enemy)
        );
    }

    /**
     * Checks whether enemy colliding.
        * @param {MovableObject} enemy
        * @returns {boolean}
     */
    isEnemyColliding(enemy) {
        if (enemy instanceof Endboss) {
            return !!enemy.getHitZoneForObject(this);
        }
        return this.isColliding(enemy);
    }

    /**
     * Returns hit zone.
        * @param {MovableObject} enemy
        * @returns {("head"|"body"|"feet"|null)}
     */
    getHitZone(enemy) {
        return enemy instanceof Endboss ? enemy.getHitZoneForObject(this) : null;
    }

    /**
     * Handles apply damage to enemy.
        * @param {MovableObject} enemy
        * @param {("head"|"body"|"feet"|null)} zone
     */
    applyDamageToEnemy(enemy, zone) {
        const baseDamage = this.damage;
        if (zone) this.damage = this.getDamageByZone(zone);
        enemy.hit(this);
        this.damage = baseDamage;
    }

    /**
     * Handles finish hit.
     */
    finishHit() {
        this.hasHit = true;
        this.stopGravity();
        this.playBottleBreakSound();
        this.playSplashAnimation();
        this.removeThrowableObject();
    }

    /**
     * Plays bottle break sound.
     * @returns {void}
     */
    playBottleBreakSound() {
        window.audioManager?.play("bottle.break");
    }

    /**
     * Returns damage by zone.
        * @param {("head"|"body"|"feet"|null)} zone
        * @returns {number}
     */
    getDamageByZone(zone) {
        const multipliers = {
            head: 1.5,
            body: 1.0,
            feet: 0.5
        };
        return Math.round(this.damage * (multipliers[zone] ?? 1));
    }

    /**
     * Handles hit ground.
        * @returns {void}
     */
    hitGround() {
        if (this.hasHit) return;
        const bottom = this.position_y + this.height;
        if (bottom >= this.groundBottom_y) {
            this.position_y = this.groundBottom_y - this.height;
            this.hasHit = true;
            this.stopGravity();
            clearInterval(this.throwInterval);
            this.playBottleBreakSound();
            this.playSplashAnimation();
            this.removeThrowableObject();
        }
    }

    /**
     * Handles remove throwable object.
     */
    removeThrowableObject() {
        if (!this.isRemoved) {
            this.isRemoved = true;
            setTimeout(() => {
                this.world.throwableObjects = this.world.throwableObjects.filter(bottle => bottle !== this);
            }, 2000);
        }
    }

    /**
     * Plays splash animation.
        * @returns {void}
     */
    playSplashAnimation() {
        clearInterval(this.rotatingInterval);
        this.splashInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            this.playAnimationOnce(this.IMAGES_SPLASH);
        }, 1000 / 6);
        this.world?.registerInterval(this.splashInterval);
    }

    /**
     * Handles animate.
        * @returns {void}
     */
    animate() {
        this.rotatingInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            this.playAnimation(this.IMAGES_ROTATING);
        }, 1000 / 12);
        this.world?.registerInterval(this.rotatingInterval);
    }
}