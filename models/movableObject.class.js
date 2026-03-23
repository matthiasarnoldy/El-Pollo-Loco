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

    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround()) {
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
        console.log("Moving right");
    }
}