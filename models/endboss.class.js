class Endboss extends MovableObject {
    height = 350;
    width = 300;
    position_x = 6000;
    position_y = 90;
    speed_x = 4;
    triggerDistance = 400;
    state = "idle";
    currentAttack = false;
    attackInterval = null;
    attackDamageDealt = false;
    deathAnimationStarted = false;
    attackCount = 0;
    health = 180;
    max_health = 180;
    damage = 0.8;
    attackDamage = 15;
    bodyDimensions = { headH: 65, headW: 65, headL: 20, bodyH: 125, bodyW: 200, bodyL: 20, feetW: 80, feetL: 80 };
    offset = {
        left: 35,
        right: 40,
        top: 80,
        bottom: 10
    };
    IMAGES_WALKING = [
        "assets/img/4_enemie_boss_chicken/1_walk/G1.png",
        "assets/img/4_enemie_boss_chicken/1_walk/G2.png",
        "assets/img/4_enemie_boss_chicken/1_walk/G3.png",
        "assets/img/4_enemie_boss_chicken/1_walk/G4.png",
    ];
    IMAGES_ALERT = [
        "assets/img/4_enemie_boss_chicken/2_alert/G6.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G5.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G6.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G7.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G8.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G9.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G10.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G11.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G12.png",
    ];
    IMAGES_ATTACK = [
        "assets/img/4_enemie_boss_chicken/3_attack/G13.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G14.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G15.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G16.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G17.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G18.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G19.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G20.png",
    ];
    IMAGES_HURT = [
        "assets/img/4_enemie_boss_chicken/4_hurt/G21.png",
        "assets/img/4_enemie_boss_chicken/4_hurt/G22.png",
        "assets/img/4_enemie_boss_chicken/4_hurt/G23.png",
    ];
    IMAGES_DEAD = [
        "assets/img/4_enemie_boss_chicken/5_dead/G24.png",
        "assets/img/4_enemie_boss_chicken/5_dead/G25.png",
        "assets/img/4_enemie_boss_chicken/5_dead/G26.png",
    ];
    world;

    /**
     * Creates a new Endboss instance.
     */
    constructor() {
        super().loadImage(this.IMAGES_ALERT[0]);
        [this.IMAGES_WALKING, this.IMAGES_ALERT, this.IMAGES_ATTACK, this.IMAGES_HURT, this.IMAGES_DEAD].forEach((images) => this.loadImages(images));
        this.animate();
    }

    /**
     * Returns hitbox areas.
        * @returns {{head: {x: number, y: number, w: number, h: number}, body: {x: number, y: number, w: number, h: number}, feet: {x: number, y: number, w: number, h: number}}}
     */
    getHitboxAreas() {
        const { headH, headW, headL, bodyH, bodyW, bodyL, feetW, feetL } = this.bodyDimensions;
        const x = this.getHitboxLeft(), y = this.getHitboxTop();
        const feetH = this.getHitboxBottom() - y - headH - bodyH;
        return {
            head: { x: x + headL, y, w: headW, h: headH },
            body: { x: x + bodyL, y: y + headH, w: bodyW, h: bodyH },
            feet: { x: x + feetL, y: y + headH + bodyH, w: feetW, h: feetH }
        };
    }

    /**
     * Returns hit zone for object.
        * @param {MovableObject} object
        * @returns {("head"|"body"|"feet"|null)}
     */
    getHitZoneForObject(object) {
        for (const [zone, area] of Object.entries(this.getHitboxAreas())) {
            if (this.overlapsArea(object, area)) return zone;
        }
        return null;
    }

    /**
     * Handles overlaps area.
        * @param {MovableObject} object
        * @param {{x: number, y: number, w: number, h: number}} area
        * @returns {boolean}
     */
    overlapsArea(object, area) {
        const left = object.position_x + (object.offset?.left || 0);
        const right = object.position_x + object.width - (object.offset?.right || 0);
        const top = object.position_y + (object.offset?.top || 0);
        const bottom = object.position_y + object.height - (object.offset?.bottom || 0);
        return right > area.x &&
               left < area.x + area.w &&
               bottom > area.y &&
               top < area.y + area.h;
    }

    /**
     * Handles animate.
        * @returns {void}
     */
    animate() {
        this.animationInterval = setInterval(() => {
            this.handleAnimationTick();
        }, 1000 / 4);
        this.world?.registerInterval(this.animationInterval);
    }

    /**
     * Handles one animation tick.
     * @returns {void}
     */
    handleAnimationTick() {
        if (this.shouldSkipAnimationTick()) return;
        this.updateState();
        this.handleStateAnimation();
    }

    /**
     * Checks whether animation tick should be skipped.
     * @returns {boolean}
     */
    shouldSkipAnimationTick() {
        if (this.world?.isPaused || !this.world?.character || this.health <= 0) {
            this.stopMovementSound();
            if (this.health <= 0) this.handleDeath();
            return true;
        }
        return false;
    }

    /**
     * Handles animation behavior by state.
     * @returns {void}
     */
    handleStateAnimation() {
        if (this.state === "active") {
            this.moveTowardsCharacter();
            this.isAttacking();
            return;
        }
        if (this.state === "idle") {
            this.img = this.imageCache[this.IMAGES_ALERT[0]];
            return;
        }
        if (this.state === "alerting") this.playAlertAnimation();
    }

    /**
     * Starts attack cycle.
        * @returns {void}
     */
    startAttackCycle() {
        if (this.attackInterval) return;
        this.attackInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            if (this.state !== "active") return;
            const randomFactor = Math.random() * 5 + 5;
            const delayMs = randomFactor * 1000;
            this.attackDelay(delayMs);
        }, 10000);
        this.world?.registerInterval(this.attackInterval);
    }

    /**
     * Handles attack delay.
        * @param {number} delayMs
     */
    attackDelay(delayMs) {
        setTimeout(() => {
            if (this.state === "active") this.currentAttack = true;
            this.startAttackCycle();
        }, delayMs);
    }

    /**
     * Plays alert animation.
     */
    playAlertAnimation() {
        this.playAnimationOnce(this.IMAGES_ALERT);
        if (this.onceDone) {
            this.onceDone = false;
            this.onceIndex = 0;
            this.state = "active";
            this.attackDelay(5000);
        }
    }

    /**
     * Plays attack animation.
     */
    playAttackAnimation() {
        this.playAnimationOnce(this.IMAGES_ATTACK);
        if (!this.attackDamageDealt) {
            window.audioManager?.play("enemy.endboss.attack");
            this.attackCount++;
            this.dealAttackDamage();
            if (this.attackCount >= 2) {
                this.spawnChickenOnAttack();
            }
            this.attackDamageDealt = true;
        }
        if (this.onceDone) {
            this.resetCounter();
        }
    }

    /**
     * Resets counter.
     */
    resetCounter() {
        this.onceDone = false;
        this.onceIndex = 0;
        this.currentAttack = false;
        this.attackDamageDealt = false;
    }

    /**
     * Handles spawn chicken on attack.
        * @returns {void}
     */
    spawnChickenOnAttack() {
        if (!this.world) return;
        const chicken = new Chicken_small();
        chicken.position_x = this.position_x + (this.otherDirection ? 10 : -10);
        chicken.walkDirection = this.otherDirection ? 1 : 0;
        chicken.speed_x = 3;
        chicken.world = this.world;
        this.world.level.enemies.push(chicken);
        this.world.collectObjectIntervals(chicken);
    }

    /**
     * Checks whether attacking.
        * @returns {void}
     */
    isAttacking() {
        if (this.currentAttack) {
            this.playAttackAnimation();
        } else if (this.isLowHealth()) {
            this.playAnimation(this.IMAGES_HURT);
        } else {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }

    /**
     * Checks whether low health.
        * @returns {boolean}
     */
    isLowHealth() {
        return this.health <= this.max_health * 0.2;
    }

    /**
     * Handles deal attack damage.
        * @returns {void}
     */
    dealAttackDamage() {
        setTimeout(() => {
            if (!this.world?.character || this.onceDone) return;
            const distance = Math.abs((this.position_x + this.width / 2) - (this.world.character.position_x + this.world.character.width / 2));
            const isAngry = this.isLowHealth();
            const rangeMultiplier = isAngry ? 1.5 : 1;
            const damageMultiplier = isAngry ? 1.5 : 1;
            this.applyAttackDamage(distance, rangeMultiplier, damageMultiplier);
            this.onceDone = false;
        }, 500);
    }

    /**
     * Applies attack damage with range and damage multipliers.
        * @param {number} distance
        * @param {number} rangeMultiplier
        * @param {number} damageMultiplier
     */
    applyAttackDamage(distance, rangeMultiplier, damageMultiplier) {
        if (distance > this.triggerDistance * rangeMultiplier) return;
        const previousDamage = this.damage;
        this.damage = this.attackDamage * damageMultiplier;
        this.world.enemyHitCharacter(this);
        this.damage = previousDamage;
    }

    /**
     * Updates state.
        * @returns {void}
     */
    updateState() {
        if (this.state !== "idle") return;
        const distance = Math.abs(this.position_x - this.world.character.position_x);
        if (distance <= this.triggerDistance) this.state = "alerting";
    }

    /**
     * Moves towards character.
     */
    moveTowardsCharacter() {
        const startX = this.position_x;
        const characterX = this.world.character.position_x;
        if (characterX < this.position_x) {
            this.moveLeft();
            this.otherDirection = false;
        } else if (characterX > this.position_x) {
            this.moveRight();
            this.otherDirection = true;
        }
        this.handleMovementSound(startX !== this.position_x);
    }

    /**
     * Handles endboss movement sound.
     * @param {boolean} isMoving
     * @returns {void}
     */
    handleMovementSound(isMoving) {
        if (!isMoving) {
            this.stopMovementSound();
            return;
        }
        window.audioManager?.playLoop("enemy.endboss.move");
    }

    /**
     * Stops endboss movement sound.
     * @returns {void}
     */
    stopMovementSound() {
        window.audioManager?.stopByKey("enemy.endboss.move", { fadeOutMs: 120 });
    }

    /**
     * Handles hit.
     * @param {MovableObject} object
     * @returns {void}
     */
    hit(object) {
        const wasAlive = this.health > 0;
        super.hit(object);
        if (!wasAlive) return;
        window.audioManager?.play("enemy.endboss.hit", {
            playbackRate: this.getHitPlaybackRate()
        });
    }

    /**
     * Returns randomized playback rate for endboss hit sound.
     * @returns {number}
     */
    getHitPlaybackRate() {
        return 0.86 + Math.random() * 0.12;
    }

    /**
     * Handles endboss death flow.
     * @returns {void}
     */
    handleDeath() {
        this.startDeathAnimation();
        this.stopMovementSound();
        this.speed_x = 0;
        this.currentAttack = false;
        this.state = "dead";
        this.playAnimationOnce(this.IMAGES_DEAD);
        if (this.onceDone) {
            this.onceDone = false;
            this.removeEnemy();
        }
    }

    /**
     * Starts death animation state.
     * @returns {void}
     */
    startDeathAnimation() {
        if (this.deathAnimationStarted) return;
        this.deathAnimationStarted = true;
        this.onceDone = false;
        this.onceIndex = 0;
    }
}