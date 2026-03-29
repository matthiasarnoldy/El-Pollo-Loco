class Cloud extends MovableObject {
    position_y = 0;
    height = 480;
    width = 720;
    direction = 1;

    /**
     * Creates a new Cloud instance.
     * @param {string} path
     * @param {number} positionX
     * @param {number} direction
     */
    constructor(path, positionX, direction) {
        super();
        this.loadImage(path);
        this.position_x = positionX;
        this.direction = direction;
        this.speed_x = 0.06 + Math.random() * 0.14;
        this.startMovement();
    }

    /**
     * Starts cloud movement.
     * @returns {void}
     */
    startMovement() {
        this.movementInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            this.position_x += this.speed_x * this.direction;
            this.wrapAroundMap();
        }, 1000 / 60);
    }

    /**
     * Wraps cloud around level bounds.
     * @returns {void}
     */
    wrapAroundMap() {
        const minX = -this.width;
        const levelEndX = this.world?.level?.level_end_x ?? 720 * 9;
        const maxX = levelEndX + this.width;
        if (this.position_x < minX) this.position_x = maxX;
        if (this.position_x > maxX) this.position_x = minX;
    }
}