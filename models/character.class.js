class Character extends MovableObject {
    height = 220;
    width = 112;
    position_x = 0;
    position_y = 198;
    speed_x = 4;
    health = 100;
    damage = 40;
    offset = {
        left: 25,
        right: 35,
        top: 110,
        bottom: 10
    };
    IMAGES_WALKING = [
        "assets/img/2_character_pepe/2_walk/W-21.png",
        "assets/img/2_character_pepe/2_walk/W-22.png",
        "assets/img/2_character_pepe/2_walk/W-23.png",
        "assets/img/2_character_pepe/2_walk/W-24.png",
        "assets/img/2_character_pepe/2_walk/W-25.png",
        "assets/img/2_character_pepe/2_walk/W-26.png",
    ];
    IMAGES_JUMPING = [
        "assets/img/2_character_pepe/3_jump/J-31.png",
        "assets/img/2_character_pepe/3_jump/J-32.png",
        "assets/img/2_character_pepe/3_jump/J-33.png",
        "assets/img/2_character_pepe/3_jump/J-34.png",
        "assets/img/2_character_pepe/3_jump/J-35.png",
        "assets/img/2_character_pepe/3_jump/J-36.png",
        "assets/img/2_character_pepe/3_jump/J-37.png",
        "assets/img/2_character_pepe/3_jump/J-38.png",
        "assets/img/2_character_pepe/3_jump/J-39.png",
    ];
    IMAGES_IDLE = [
        "assets/img/2_character_pepe/1_idle/idle/I-1.png",
        "assets/img/2_character_pepe/1_idle/idle/I-2.png",
        "assets/img/2_character_pepe/1_idle/idle/I-3.png",
        "assets/img/2_character_pepe/1_idle/idle/I-4.png",
        "assets/img/2_character_pepe/1_idle/idle/I-5.png",
        "assets/img/2_character_pepe/1_idle/idle/I-6.png",
        "assets/img/2_character_pepe/1_idle/idle/I-7.png",
        "assets/img/2_character_pepe/1_idle/idle/I-8.png",
        "assets/img/2_character_pepe/1_idle/idle/I-9.png",
        "assets/img/2_character_pepe/1_idle/idle/I-10.png",
    ];
    IMAGES_IDLE_LONG = [
        "assets/img/2_character_pepe/1_idle/long_idle/I-11.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-12.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-13.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-14.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-15.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-16.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-17.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-18.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-19.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-20.png",
    ];
    IMAGES_HURT = [
        "assets/img/2_character_pepe/4_hurt/H-41.png",
        "assets/img/2_character_pepe/4_hurt/H-42.png",
        "assets/img/2_character_pepe/4_hurt/H-43.png",
    ];
    IMAGES_DEAD = [
        "assets/img/2_character_pepe/5_dead/D-51.png",
        "assets/img/2_character_pepe/5_dead/D-52.png",
        "assets/img/2_character_pepe/5_dead/D-53.png",
        "assets/img/2_character_pepe/5_dead/D-54.png",
        "assets/img/2_character_pepe/5_dead/D-55.png",
        "assets/img/2_character_pepe/5_dead/D-56.png",
        "assets/img/2_character_pepe/5_dead/D-57.png",
    ];
    wasAboveGround = false;
    world;



    /**
     * Creates a new Character instance.
     */
    constructor() {
        super().loadImage(this.IMAGES_IDLE[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_IDLE_LONG);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.wasAboveGround = this.isAboveGround();
        this.animate();
    }

    /**
     * Sets default image.
     */
    setDefaultImage() {
        const path = this.IMAGES_IDLE[0];
        if (this.imageCache[path]) {
            this.img = this.imageCache[path];
        } else {
            this.loadImage(path);
        }
    }

    /**
     * Handles animate.
        * @returns {void}
     */
    animate() {
        this.movementInterval = setInterval(() => {
            if (this.world?.isPaused) {
                this.stopRunningSound();
                this.stopSnoreSound();
                return;
            }
            this.characterMoveRight();
            this.characterMoveLeft();
            this.characterJump();
            this.handleLandingSound();
            this.handleRunningSound();
            this.handleSnoreSound();
            this.updateCamera();
        }, 1000 / 60);
        this.animationInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            this.playAnimations();
        }, 1000 / 8);
        this.world?.registerInterval(this.movementInterval);
        this.world?.registerInterval(this.animationInterval);
    }

    /**
     * Handles landing sound transitions.
     * @returns {void}
     */
    handleLandingSound() {
        const isCurrentlyAboveGround = this.isAboveGround();
        if (this.wasAboveGround && !isCurrentlyAboveGround && this.speed_y === 0) {
            window.audioManager?.play("character.land");
        }
        this.wasAboveGround = isCurrentlyAboveGround;
    }

    /**
     * Handles running sound transitions.
     * @returns {void}
     */
    handleRunningSound() {
        const isMoving = this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
        const isOnGround = !this.isAboveGround();
        const canRunSound = isMoving && isOnGround && this.health > 0;
        if (canRunSound) {
            this.stopSnoreSound();
            window.audioManager?.playLoop("character.running");
            return;
        }
        this.stopRunningSound();
    }

    /**
     * Stops running sound.
     * @returns {void}
     */
    stopRunningSound() {
        window.audioManager?.stopByKey("character.running");
    }

    /**
     * Handles snore sound transitions.
     * @returns {void}
     */
    handleSnoreSound() {
        const isMoving = this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
        const isActing = this.world.keyboard.SPACE || this.world.keyboard.THROW;
        const canSnore = this.isLongIdle() && !isMoving && !isActing && !this.isAboveGround() && !this.isDead() && !this.isHurt();
        if (canSnore) {
            window.audioManager?.playLoop("character.snore", { fadeInMs: 150 });
            return;
        }
        this.stopSnoreSound();
    }

    /**
     * Stops snore sound.
     * @returns {void}
     */
    stopSnoreSound() {
        window.audioManager?.stopByKey("character.snore", { fadeOutMs: 150 });
    }

    /**
     * Handles character move right.
     */
    characterMoveRight() {
        if (this.world.keyboard.RIGHT && this.getHitboxRight() + 10 < this.world.level.level_end_x) {
            this.moveRight();
        }
    }

    /**
     * Handles character move left.
     */
    characterMoveLeft() {
        if (this.world.keyboard.LEFT && this.getHitboxLeft() > -720) {
            this.moveLeft();
        }
    }

    /**
     * Handles character jump.
     */
    characterJump() {
        if (this.world.keyboard.SPACE && !this.isAboveGround() && !this.jumpKeyHandled) {
            this.jump();
            this.jumpKeyHandled = true;
        }
        if (!this.world.keyboard.SPACE) {
            this.jumpKeyHandled = false;
        }
    }

    /**
     * Updates camera.
     */
    updateCamera() {
        const followOffset = 180;
        const maxCameraX = 720;
        const minCameraX = -(this.world.level.level_end_x - this.world.canvas.width);
        const targetCameraX = -this.position_x + followOffset;
        this.world.camera_x = Math.max(minCameraX, Math.min(maxCameraX, targetCameraX));
    }
}