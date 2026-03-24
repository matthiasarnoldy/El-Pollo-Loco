class Chicken_small extends MovableObject {
    height = 48;
    width = 48;
    position_y = 365;
    health = 20;
    touchDamage = 0.25;
    offset = {
        left: 10,
        right: 10,
        top: 10,
        bottom: 8
    };
    IMAGES_WALKING = [
        "assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
        "assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
        "assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png",
    ];
    IMAGES_DEAD = [
        "assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png"
    ];


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);

        this.position_x = 200 + Math.random() * 5700;
        this.speed_x = 0.15 + Math.random() * 0.5;

        this.animate();
    }

    animate() {
        this.moveLeft();
        setInterval(() => {
            if (this.health == 0) {
                this.playAnimationOnce(this.IMAGES_DEAD);
                cancelAnimationFrame(this.animationID);
                this.touchDamage = 0;
            } else {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 1000 / 4)
    }
}