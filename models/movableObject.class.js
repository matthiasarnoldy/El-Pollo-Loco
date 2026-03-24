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
    offset = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };

    applyGravity() {
        setInterval(() => {
            this.lastPosition_y =this.position_y;
            if (this.isAboveGround() || this.speed_y > 0) {
                this.position_y -= this.speed_y;
                this.speed_y -= this.acceleration;
            }
            if (this.position_y > 198 && !(this instanceof ThrowableObject)) {
                this.position_y = 198;
                this.speed_y = 0;
            }
        }, 1000 / 60);
    }

    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            return this.position_y < 198;
        }
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    playAnimationOnce(images) {
        if (this.onceDone) return;

        this.img = this.imageCache[images[this.onceIndex]];

        if (this.onceIndex < images.length - 1) {
            this.onceIndex++;
        } else {
            this.onceDone = true;
        }
    }

    playAnimations() {
        if (this.isDead()) {
            this.playAnimationOnce(this.IMAGES_DEAD);
        } else if (this.isHurt()) {
            this.playAnimation(this.IMAGES_HURT);
        } else if (this.isAboveGround()) {
            this.playAnimation(this.IMAGES_JUMPING);
        } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
            this.playAnimation(this.IMAGES_WALKING);
        } else {
            this.setDefaultImage();
        }
    }

    movingChicken() {
        if (this.walkDirection < 0.5) {
            this.position_x -= this.speed_x;
            this.otherDirection = false;
        } else {
            this.position_x += this.speed_x;
            this.otherDirection = true;
        }
        this.changeDirectionEndOfMap();
        this.changeDirectionCollision();
        let self = this;
        this.animationID = requestAnimationFrame(function() {
            self.movingChicken();
        });
    }

    changeDirectionEndOfMap() {
        if (this.position_x <= this.min_x || this.position_x >= this.max_x) {
            this.walkDirection = this.walkDirection < 0.5 ? 1 : 0;
        }
    }

    changeDirectionCollision() {
        if (!this.world || !this.world.level?.enemies) return;
        const enemy = this.world.level.enemies.find(e =>
            e !== this && e.health > 0 && this.isColliding(e)
        );
        if (!enemy) return;
        if (this.speed_x <= enemy.speed_x) return;
        this.directionCooldown(enemy);
    }

    getRandomSpawnX() {
        const leftRangeLength = 0 - (-720);
        const rightRangeLength = 5700 - 500;
        const total = leftRangeLength + rightRangeLength;
        const r = Math.random() * total;
        if (r < leftRangeLength) {
            return -720 + r;
        } else {
            return 500 + (r - leftRangeLength);
        }
    }

    directionCooldown(enemy) {
        const now = Date.now();
        if (now - this.lastDirectionChange < 10000) return;
        this.walkDirection = this.walkDirection < 0.5 ? 1 : 0;
        this.lastDirectionChange = now;
        this.position_x += (this.position_x < enemy.position_x) ? -1 : 1;
    }

    moveLeft() {
        this.position_x -= this.speed_x;
        this.otherDirection = true;
    }

    moveRight() {
        this.position_x += this.speed_x;
        this.otherDirection = false;
    }

    jump() {
        this.speed_y = 14;
    }
    

    getHitboxLeft() {
        return this.position_x + this.offset.left;
    }

    getHitboxRight() {
        return this.position_x + this.width - this.offset.right;
    }

    getHitboxTop() {
        return this.position_y + this.offset.top;
    }

    getHitboxBottom() {
        return this.position_y + this.height - this.offset.bottom;
    }

    getLastHitboxBottom() {
        return this.lastPosition_y + this.height - this.offset.bottom;
    }

    isColliding(mo) {
        return this.getHitboxRight() > mo.getHitboxLeft() &&
               this.getHitboxLeft() < mo.getHitboxRight() &&
               this.getHitboxBottom() > mo.getHitboxTop() &&
               this.getHitboxTop() < mo.getHitboxBottom();
    }

    hit(object) {
        this.health -= object.damage;
        if (this.health < 0) {
            this.health = 0
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt() {
        if (this instanceof Character || this instanceof Endboss) {
            let timePassed = new Date().getTime() - this.lastHit;
            return timePassed < 1000;
        } else return false;
    }

    isDead() {
        return this.health == 0;
    }
}