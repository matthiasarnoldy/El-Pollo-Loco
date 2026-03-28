class Cloud extends MovableObject {
    position_y = 0;
    height = 480;
    width = 720;

    /**
     * Creates a new Cloud instance.
     * @param {string} path
     */
    constructor(path) {
        super().loadImage(path);

        this.position_x = Math.random() * 720;
        this.moveLeft();
    }
}