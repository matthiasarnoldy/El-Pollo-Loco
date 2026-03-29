class Chicken_small extends MovableObject {
    height = 48;
    width = 48;
    position_y = 365;
    health = 20;
    damage = 0.25;
    isRemoved = false;
    bottleDropChecked = false;
    lastWalkSoundAt = 0;
    offset = {
        left: 10,
        right: 10,
        top: 10,
        bottom: 8
    };
    IMAGES_WALKING = [
        "assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
        "assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
        "assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png",
    ];
    IMAGES_DEAD = [
        "assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png"
    ];
    world;

    /**
     * Creates a new Chicken_small instance.
     */
    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);

        this.position_x = this.getRandomSpawnX();
        this.speed_x = 0.15 + Math.random() * 0.5;
        this.walkDirection = Math.random();

        this.animate();
    }

    /**
     * Handles animate.
        * @returns {void}
     */
    animate() {
        this.movingChicken();
        this.animationInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            if (this.health == 0) {
                this.playAnimationOnce(this.IMAGES_DEAD);
                cancelAnimationFrame(this.animationID);
                this.damage = 0;
                this.removeEnemy();
            } else {
                this.playAnimation(this.IMAGES_WALKING);
                this.playWalkSound();
            }
        }, 1000 / 4);
        this.world?.registerInterval(this.animationInterval);
    }

    /**
     * Plays small chicken walk sound with cooldown.
     * @returns {void}
     */
    playWalkSound() {
        if (this.health <= 0) return;
        if (!this.isVisibleInCamera()) return;
        const now = Date.now();
        if (now - this.lastWalkSoundAt < 1400) return;
        this.lastWalkSoundAt = now;
        window.audioManager?.play("enemy.chicken_small.walk", {
            volumeMultiplier: this.getCameraDistanceVolumeMultiplier()
        });
    }

    /**
     * Checks whether small chicken is inside current camera viewport.
     * @returns {boolean}
     */
    isVisibleInCamera() {
        if (!this.world?.canvas) return false;
        const viewLeft = -this.world.camera_x;
        const viewRight = viewLeft + this.world.canvas.width;
        return this.getHitboxRight() >= viewLeft && this.getHitboxLeft() <= viewRight;
    }

    /**
     * Returns volume multiplier based on distance to viewport center.
     * @returns {number}
     */
    getCameraDistanceVolumeMultiplier() {
        if (!this.world?.canvas) return 0.25;
        const viewLeft = -this.world.camera_x;
        const viewportCenterX = viewLeft + this.world.canvas.width / 2;
        const chickenCenterX = this.getHitboxLeft() + (this.getHitboxRight() - this.getHitboxLeft()) / 2;
        const distanceToCenter = Math.abs(chickenCenterX - viewportCenterX);
        const maxDistance = this.world.canvas.width / 2;
        const normalized = Math.min(1, distanceToCenter / maxDistance);
        return 1 - normalized * 0.75;
    }

    /**
     * Handles remove enemy.
     */
    removeEnemy() {
        if (!this.bottleDropChecked) {
            this.bottleDropChecked = true;
            this.trySpawnBottleDrop();
        }
        super.removeEnemy();
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
        window.audioManager?.play("enemy.chicken.hit", {
            playbackRate: this.getHitPlaybackRate()
        });
        if (this.health <= 0) window.audioManager?.stopByKey("enemy.chicken_small.walk");
    }

    /**
     * Returns randomized playback rate for hit sound.
     * @returns {number}
     */
    getHitPlaybackRate() {
        return 0.95 + Math.random() * 0.14;
    }

    /**
     * Handles try spawn bottle drop.
        * @returns {void}
     */
    trySpawnBottleDrop() {
        if (!this.world) return;
        const randomNumber = Math.random();
        if (randomNumber < 0.7 || randomNumber > 0.8) return;
        const bottle = new CollectibleBottle(this.position_x);
        bottle.world = this.world;
        this.world.collectibleBottles.push(bottle);
    }
}