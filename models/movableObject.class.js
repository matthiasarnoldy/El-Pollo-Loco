class MovableObject extends DrawableObject {
    speed_x = 0.1;
    speed_y = 0;
    acceleration = 1.5;
    otherDirection = false;
    touchDamage = 5;
    lastHit = 0;
    offset = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };

    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speed_y > 0) {
                this.position_y -= this.speed_y;
                this.speed_y -= this.acceleration;
            }
            if (this.position_y > 198 && !(this instanceof ThrowableObject)) {
                this.position_y = 198;
                this.speed_y = 0;
            }
        }, 1000 / 25);
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
        for (let index = 0; index < images.length; index++) {
            let path = images[index];
            this.img = this.imageCache[path];
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

    moveLeft() {
        if (this.position_x > -720) {
            this.position_x -= this.speed_x;
        } else {
            this.position_x = Math.random() * 5700;
            this.position_x -= this.speed_x;
        }
        let self = this;
        requestAnimationFrame(function() {
            self.moveLeft();
        });
    }

    moveRight() {
        this.position_x += this.speed_x;
        this.otherDirection = false;
    }

    jump() {
        this.speed_y = 20;
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

    isColliding(mo) {
        return this.getHitboxRight() > mo.getHitboxLeft() &&
               this.getHitboxLeft() < mo.getHitboxRight() &&
               this.getHitboxBottom() > mo.getHitboxTop() &&
               this.getHitboxTop() < mo.getHitboxBottom();
    }

    hit(enemy) {
        this.health -= enemy.touchDamage;
        if (this.health < 0) {
            this.health = 0
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit;
        return timePassed < 1000;
    }

    isDead() {
        return this.health == 0;
    }
}