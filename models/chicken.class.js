class Chicken extends MovableObject {
    height = 68;
    width = 68;
    position_y = 347;
    IMAGES_WALKING = [
        "assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
        "assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
        "assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
    ];


    constructor() {
        super().loadImage("assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
        this.loadImages(this.IMAGES_WALKING);

        this.position_x = 200 + Math.random() * 5700;
        this.speed = 0.15 + Math.random() * 0.3;

        this.animate();
    }

    animate() {
        this.moveLeft();
        setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 1000 / 4)
    }
}