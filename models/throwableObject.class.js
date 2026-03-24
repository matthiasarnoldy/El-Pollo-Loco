class ThrowableObject extends MovableObject {
    position_x = 100;
    position_y = 100;
    speed_x = 0.1;
    speed_y = 0;;
    damage = 40;
    IMAGES_ROTATING = [
        "assets/img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png",
    ];
    world;

    constructor(x, y, otherDirection) {
        super().loadImage(this.IMAGES_ROTATING[0]);
        this.loadImages(this.IMAGES_ROTATING);
        this.position_x = x;
        this.position_y = y;
        this.otherDirection = otherDirection;
        this.width = 50;
        this.height = 60;
        this.world = world;
        this.throw();
    }

    throw() {
        this.animate();
        this.speed_y = 15;
        this.applyGravity();
        setInterval(() => {
            if (this.otherDirection) {
                this.position_x -= 8;
            } else {
                this.position_x += 8;
            }
            this.world.level.enemies.forEach(enemy => {
                if (enemy.health > 0 && this.isColliding(enemy)) {
                    enemy.hit(this);
                }
            });
        }, 1000 / 60);
    }

    animate() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_ROTATING);
        }, 1000 / 12);
    }
}