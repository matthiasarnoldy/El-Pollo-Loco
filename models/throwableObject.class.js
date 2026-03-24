class ThrowableObject extends MovableObject {
    position_x = 100;
    position_y = 100;
    speed_x = 0.1;
    speed_y = 0;
    acceleration = 1.5;
    touchDamage = 5;
    IMAGES_ROTATING = [
        "assets/img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png",
    ];

    constructor(x, y) {
        super().loadImage(this.IMAGES_ROTATING[0]);
        this.loadImages(this.IMAGES_ROTATING);
        this.position_x = x;
        this.position_y = y;
        this.width = 50;
        this.height = 60;
        this.throw();
    }

    throw() {
        this.speed_y = 25;
        this.applyGravity();
        setInterval(() => {
            this.position_x += 10;
        }, 25)
    }
}