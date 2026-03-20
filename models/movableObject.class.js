class MovableObject {
    position_x = 120;
    position_y = 250;
    img;
    height = 150;
    width = 100;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    moveRight() {
        console.log("Moving right");
    }

    moveLeft() {
        console.log("Moving left");
    }
}