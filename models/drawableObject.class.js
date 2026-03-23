class DrawableObject {
    position_x;
    position_y;
    img;
    height;
    width;
    imageCache = {};
    currentImage = 0;
    health = 100;

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
}