class BackgroundObject extends MovableObject {
    position_x = 0;
    position_y = 0;
    img;
    height = 480;
    width = 720;

    /**
     * Creates a new BackgroundObject instance.
     * @param {string} imagePath
     * @param {number} position_x
     */
    constructor(imagePath, position_x) {
        super().loadImage(imagePath);
        this.position_x = position_x;
    }
}