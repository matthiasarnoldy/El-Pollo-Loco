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
        setInterval(() => {
            if (this.isAboveGround() || this.speed_y > 0) {
                this.position_y -= this.speed_y;
                this.speed_y -= this.acceleration;
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
}