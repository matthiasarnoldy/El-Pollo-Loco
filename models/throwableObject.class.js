class ThrowableObject extends MovableObject {
    position_x = 100;
    position_y = 100;
    speed_x = 0.1;
    speed_y = 0;;
    damage = 40;
    hasHit = false;
    isRemoved = false;
    groundBottom_y = 428;
    rotatingInterval;
    IMAGES_ROTATING = [
        "assets/img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png",
    ];
    IMAGES_SPLASH = [
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
    ];
    world;

    constructor(x, y, otherDirection, world) {
        super().loadImage(this.IMAGES_ROTATING[0]);
        this.loadImages(this.IMAGES_ROTATING);
        this.loadImages(this.IMAGES_SPLASH);
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
            if (this.hasHit) return;
            this.position_x += this.otherDirection ? -8 : 8;
            this.hitEnemy();
            this.hitGround();
        }, 1000 / 60);
    }

    hitEnemy() {
        if (this.hasHit || !this.world) return;
        this.world.level.enemies.forEach(enemy => {
            if (enemy.health > 0 && this.isColliding(enemy)) {
                this.getObjectCenter(enemy);
                this.hasHit = true;
                enemy.hit(this);
                this.stopGravity();
                this.playSplashAnimation();
                this.removeThrowableObject();
            }
        });
    }

    hitGround() {
        if (this.hasHit) return;
        const bottom = this.position_y + this.height;
        if (bottom >= this.groundBottom_y) {
            this.position_y = this.groundBottom_y - this.height;
            this.hasHit = true;
            this.stopGravity();
            clearInterval(this.throwInterval);
            this.playSplashAnimation();
            this.removeThrowableObject();
        }
    }

    removeThrowableObject() {
        if (!this.isRemoved) {
            this.isRemoved = true;
            setTimeout(() => {
                this.world.throwableObjects = this.world.throwableObjects.filter(bottle => bottle !== this);
            }, 2000);
        }
    }

    playSplashAnimation() {
        clearInterval(this.rotatingInterval);
        setInterval(() => {
            this.playAnimationOnce(this.IMAGES_SPLASH);
        }, 1000 / 6);
    }

    animate() {
        this.rotatingInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_ROTATING);
        }, 1000 / 12);
    }
}