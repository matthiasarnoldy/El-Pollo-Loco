class DrawableObject {
    position_x;
    position_y;
    img;
    height;
    width;
    imageCache = {};
    currentImage = 0;
    health;

    draw(ctx) {
        ctx.drawImage(this.img, this.position_x, this.position_y, this.width, this.height);
    }

    drawFrame(ctx) {
        if (this instanceof Character || this instanceof Chicken || this instanceof Chicken_small || this instanceof ThrowableObject) {
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

        // Endboss: 3 Bereiche aus getHitboxAreas() zeichnen
        if (this instanceof Endboss) {
            const { head, body, feet } = this.getHitboxAreas();

            ctx.lineWidth = "2";

            ctx.strokeStyle = "lime";
            ctx.strokeRect(head.x, head.y, head.w, head.h);
            ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
            ctx.fillRect(head.x, head.y, head.w, head.h);

            ctx.strokeStyle = "yellow";
            ctx.strokeRect(body.x, body.y, body.w, body.h);
            ctx.fillStyle = "rgba(255, 255, 0, 0.1)";
            ctx.fillRect(body.x, body.y, body.w, body.h);

            ctx.strokeStyle = "orange";
            ctx.strokeRect(feet.x, feet.y, feet.w, feet.h);
            ctx.fillStyle = "rgba(255, 165, 0, 0.1)";
            ctx.fillRect(feet.x, feet.y, feet.w, feet.h);
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