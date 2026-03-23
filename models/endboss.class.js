class Endboss extends MovableObject {
    height = 350;
    width = 300;
    position_x = 5700;
    position_y = 90;
    IMAGES_WALKING = [
        "assets/img/4_enemie_boss_chicken/2_alert/G5.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G6.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G7.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G8.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G9.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G10.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G11.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G12.png",
    ];


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);

        this.animate();
    }

    animate() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 1000 / 4)
    }
}