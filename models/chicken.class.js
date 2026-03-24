class Chicken extends MovableObject {
    height = 68;
    width = 68;
    position_y = 347;
    health = 40;
    touchDamage = 0.5;
    offset = {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
    };
    IMAGES_WALKING = [
        "assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
        "assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
        "assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
    ];
    IMAGES_DEAD = [
        "assets/img/3_enemies_chicken/chicken_normal/2_dead/dead.png"
    ];


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);

        this.position_x = 200 + Math.random() * 5700;
        this.speed_x = 0.15 + Math.random() * 0.3;

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