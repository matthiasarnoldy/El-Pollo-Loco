class BackgroundObject extends MovableObject {
    position_x = 0;
    position_y = 0;
    img;
    height = 480;
    width = 720;

    constructor(imagePath) {
        super().loadImage(imagePath);
    }
}