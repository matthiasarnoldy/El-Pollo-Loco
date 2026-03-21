class Cloud extends MovableObject {
    position_y = 20;
    height = 300;
    width = 450;


    constructor(path) {
        super().loadImage(path);

        this.position_x = Math.random() * 500;
    }
}