class MovableObject {
    position_x = 120;
    position_y = 250;
    img;
    height = 150;
    width = 100;
    imageCache = {};
    currentImage = 0;
    speed = 0.1;

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

    moveLeft() {
        if (this.position_x > 0) {
            this.position_x -= this.speed;
        } else {
            this.position_x = Math.random() * 720;
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