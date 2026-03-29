class MovableObject extends DrawableObject {
    speed_x = 0.1;
    speed_y = 0;
    min_x = -720;
    max_x = 5700;
    acceleration = 0.625;
    otherDirection = false;
    health;
    damage = 5;
    lastHit = 0;
    lastPosition_y = 0;
    animationID;
    onceIndex = 0;
    onceDone = false;
    jumpKeyHandled = false;
    lastDirectionChange = 0;
    idleLongThreshold = 10000;
    lastActionTime = Date.now();
    offset = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };

    /**
     * Handles apply gravity.
        * @returns {void}
     */
    applyGravity() {
        this.gravityInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            this.lastPosition_y = this.position_y;
            if (this.isAboveGround() || this.speed_y > 0) {
                this.position_y -= this.speed_y;
                this.speed_y -= this.acceleration;
            }
            if (this.position_y > 198 && !(this instanceof ThrowableObject)) {
                this.position_y = 198;
                this.speed_y = 0;
            }
        }, 1000 / 60);
        this.world?.registerInterval(this.gravityInterval);
    }

    /**
     * Stops gravity.
     */
    stopGravity() {
        this.lastPosition_y = this.position_y;
        this.speed_x = 0;
        this.speed_y = 0;
        this.acceleration = 0;
    }

    /**
     * Checks whether above ground.
        * @returns {boolean}
     */
    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            return this.position_y < 198;
        }
    }

    /**
     * Plays animation.
        * @param {string[]} images
     */
    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    /**
     * Plays animation once.
        * @param {string[]} images
        * @returns {void}
     */
    playAnimationOnce(images) {
        if (this.onceDone) return;
        this.img = this.imageCache[images[this.onceIndex]];
        if (this.onceIndex < images.length - 1) {
            this.onceIndex++;
        } else {
            this.onceDone = true;
        }
    }

    /**
     * Updates last action time.
     */
    updateLastActionTime() {
        const keyboard = this.world?.keyboard;
        const isMoving = !!(keyboard?.RIGHT || keyboard?.LEFT);
        const isJumping = this.isAboveGround();
        const isThrowing = !!keyboard?.THROW;
        if (isMoving || isJumping || isThrowing) {
            this.lastActionTime = Date.now();
        }
    }

    /**
     * Checks whether long idle.
        * @returns {boolean}
     */
    isLongIdle() {
        if (!this.IMAGES_IDLE_LONG) return false;
        return Date.now() - this.lastActionTime >= this.idleLongThreshold;
    }

    /**
     * Plays animations.
     */
    playAnimations() {
        this.updateLastActionTime();
        const images = this.getAnimationImages();
        const isDeadAnim = this.isDead();
        isDeadAnim ? this.playAnimationOnce(images) : this.playAnimation(images);
    }

    /**
     * Returns animation images based on character state.
     * @returns {string[]}
     */
    getAnimationImages() {
        if (this.isDead()) return this.IMAGES_DEAD;
        if (this.isHurt()) return this.IMAGES_HURT;
        if (this.isAboveGround()) return this.IMAGES_JUMPING;
        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) return this.IMAGES_WALKING;
        if (this.isLongIdle()) return this.IMAGES_IDLE_LONG;
        return this.IMAGES_IDLE;
    }

    /**
     * Handles moving chicken.
     */
    movingChicken() {
        if (!this.world?.isPaused) {
            if (this.walkDirection < 0.5) {
                this.moveLeft();
                this.otherDirection = false;
            } else {
                this.moveRight();
                this.otherDirection = true;
            }
            this.changeDirection();
        }
        let self = this;
        this.animationID = requestAnimationFrame(function() {
            self.movingChicken();
        });
    }

    /**
     * Handles change direction.
     */
    changeDirection() {
        this.changeDirectionEndOfMap();
        this.changeDirectionCollision();
    }

    /**
     * Handles change direction end of map.
     */
    changeDirectionEndOfMap() {
        if (this.position_x <= this.min_x || this.position_x >= this.max_x) {
            this.walkDirection = this.walkDirection < 0.5 ? 1 : 0;
        }
    }

    /**
     * Handles change direction collision.
        * @returns {void}
     */
    changeDirectionCollision() {
        if (!this.world || !this.world.level?.enemies) return;
        const enemy = this.world.level.enemies.find(e =>
            e !== this && e.health > 0 && this.isColliding(e)
        );
        if (!enemy) return;
        if (this.speed_x <= enemy.speed_x) return;
        this.directionCooldown(enemy);
    }

    /**
     * Returns random spawn x.
        * @returns {number}
     */
    getRandomSpawnX() {
        const leftEnd = -300;
        const rightStart = 300;
        const leftRangeLength = leftEnd - this.min_x;
        const rightRangeLength = this.max_x - rightStart;
        const total = leftRangeLength + rightRangeLength;
        const randomValue = Math.random() * total;
        if (randomValue < leftRangeLength) {
            return this.min_x + randomValue;
        } else {
            return rightStart + (randomValue - leftRangeLength);
        }
    }

    /**
     * Handles direction cooldown.
        * @param {MovableObject} enemy
        * @returns {void}
     */
    directionCooldown(enemy) {
        const now = Date.now();
        if (now - this.lastDirectionChange < 10000) return;
        this.walkDirection = this.walkDirection < 0.5 ? 1 : 0;
        this.lastDirectionChange = now;
        this.position_x += (this.position_x < enemy.position_x) ? -1 : 1;
    }

    /**
     * Moves left.
     */
    moveLeft() {
        this.position_x -= this.speed_x;
        this.otherDirection = true;
    }

    /**
     * Moves right.
     */
    moveRight() {
        this.position_x += this.speed_x;
        this.otherDirection = false;
    }

    /**
     * Handles jump.
     */
    jump() {
        this.speed_y = 14;
    }
    
    /**
     * Returns hitbox left.
        * @returns {number}
     */
    getHitboxLeft() {
        return this.position_x + this.offset.left;
    }

    /**
     * Returns hitbox right.
        * @returns {number}
     */
    getHitboxRight() {
        return this.position_x + this.width - this.offset.right;
    }

    /**
     * Returns hitbox top.
        * @returns {number}
     */
    getHitboxTop() {
        return this.position_y + this.offset.top;
    }

    /**
     * Returns hitbox bottom.
        * @returns {number}
     */
    getHitboxBottom() {
        return this.position_y + this.height - this.offset.bottom;
    }

    /**
     * Returns last hitbox bottom.
        * @returns {number}
     */
    getLastHitboxBottom() {
        return this.lastPosition_y + this.height - this.offset.bottom;
    }

    /**
     * Checks whether colliding.
        * @param {MovableObject} mo
        * @returns {boolean}
     */
    isColliding(mo) {
        return this.getHitboxRight() > mo.getHitboxLeft() &&
               this.getHitboxLeft() < mo.getHitboxRight() &&
               this.getHitboxBottom() > mo.getHitboxTop() &&
               this.getHitboxTop() < mo.getHitboxBottom();
    }

    /**
     * Handles hit.
        * @param {MovableObject} object
     */
    hit(object) {
        const previousHealth = this.health;
        this.health -= object.damage;
        if (this.health < 0) {
            this.health = 0
        } else {
            this.lastHit = new Date().getTime();
        }
        if (this instanceof Character && this.health < previousHealth) {
            window.audioManager?.play("character.hurt");
        }
    }

    /**
     * Checks whether hurt.
        * @returns {boolean}
     */
    isHurt() {
        if (this instanceof Character || this instanceof Endboss) {
            let timePassed = new Date().getTime() - this.lastHit;
            return timePassed < 1000;
        } else return false;
    }

    /**
     * Checks whether dead.
        * @returns {boolean}
     */
    isDead() {
        return this.health == 0;
    }

    /**
     * Handles remove enemy.
     */
    removeEnemy() {
        if (!this.isRemoved) {
            this.isRemoved = true;
            setTimeout(() => {
                this.world.level.enemies = this.world.level.enemies.filter(enemy => enemy !== this);
            }, 2000);
        }
    }
}