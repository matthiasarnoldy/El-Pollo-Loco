class DrawableObject {
    position_x;
    position_y;
    img;
    height;
    width;
    imageCache = {};
    currentImage = 0;
    health;

    /**
     * Draws the object.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.drawImage(this.img, this.position_x, this.position_y, this.width, this.height);
    }

    /**
     * Loads image.
     * @param {string} path
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Loads images.
     * @param {string[]} arr
     */
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }
}