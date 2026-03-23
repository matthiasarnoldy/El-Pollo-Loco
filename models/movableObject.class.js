class MovableObject {
    position_x;
    position_y;
    img;
    height;
    width;
    imageCache = {};
    currentImage = 0;
    speed = 0.1;
    speed_y = 0;
    acceleration = 1.5;
    otherDirection = false;
    energy = 100;
    touchDamage = 5;
    lastHit = 0;
    offset = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };

    draw(ctx) {
        ctx.drawImage(this.img, this.position_x, this.position_y, this.width, this.height);
    }

    drawFrame(ctx) {
        if (this instanceof Character || this instanceof Chicken || this instanceof Chicken_small || this instanceof Endboss) {
            // ctx.beginPath();
            // ctx.lineWidth = "5";
            // ctx.strokeStyle = "blue";
            // ctx.rect(this.position_x, this.position_y, this.width, this.height);
            // ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = "2";
            ctx.strokeStyle = "red";
            ctx.rect(
                this.getHitboxLeft(),
                this.getHitboxTop(),
                this.getHitboxRight() - this.getHitboxLeft(),
                this.getHitboxBottom() - this.getHitboxTop()
            );
            ctx.stroke();
        }
    }

    applyGravity() {
        if (this.gravityInterval) return;
        this.gravityInterval = setInterval(() => {
            if (this.isAboveGround() || this.speed_y > 0) {
                this.position_y -= this.speed_y;
                this.speed_y -= this.acceleration;
            }
            if (this.position_y > 198) {
                this.position_y = 198;
                this.speed_y = 0;
            }
        }, 1000 / 25);
    }

    isAboveGround() {
        return this.position_y < 198;
    }

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    playAnimations() {
        if (this.isDead()) {
            this.playAnimation(this.IMAGES_DEAD);
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
            this.position_x -= this.speed;
        } else {
            this.position_x = Math.random() * 5700;
            this.position_x -= this.speed;
        }
        let self = this;
        requestAnimationFrame(function() {
            self.moveLeft();
        });
    }

    moveRight() {
        this.position_x += this.speed;
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
        this.energy -= enemy.touchDamage;
        if (this.energy < 0) {
            this.energy = 0
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit;
        return timePassed < 1000;
    }

    isDead() {
        return this.energy == 0;
    }
}