class Chicken_small extends MovableObject {
    height = 48;
    width = 48;
    position_y = 365;
    health = 20;
    damage = 0.25;
    isRemoved = false;
    bottleDropChecked = false;
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
    world;


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);

        this.position_x = this.getRandomSpawnX();
        this.speed_x = 0.15 + Math.random() * 0.5;
        this.walkDirection = Math.random();

        this.animate();
    }

    animate() {
        this.movingChicken();
        this.animationInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            if (this.health == 0) {
                this.playAnimationOnce(this.IMAGES_DEAD);
                cancelAnimationFrame(this.animationID);
                this.damage = 0;
                this.removeEnemy();
            } else {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 1000 / 4);
        this.world?.registerInterval(this.animationInterval);
    }

    removeEnemy() {
        if (!this.bottleDropChecked) {
            this.bottleDropChecked = true;
            this.trySpawnBottleDrop();
        }
        super.removeEnemy();
    }

    trySpawnBottleDrop() {
        if (!this.world) return;
        const randomNumber = Math.random();
        if (randomNumber < 0.7 || randomNumber > 0.8) return;
        const bottle = new CollectibleBottle(this.position_x);
        bottle.world = this.world;
        this.world.collectibleBottles.push(bottle);
    }
}