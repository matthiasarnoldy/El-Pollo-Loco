class Chicken extends MovableObject {
    height = 68;
    width = 68;
    position_y = 347;
    health = 40;
    damage = 0.5;
    isRemoved = false;
    coinDropChecked = false;
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
    world;

    /**
     * Creates a new Chicken instance.
     */
    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);

        this.position_x = this.getRandomSpawnX();
        this.speed_x = 0.15 + Math.random() * 0.3;
        this.walkDirection = Math.random();

        this.animate();
    }

    /**
     * Handles animate.
        * @returns {void}
     */
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

    /**
     * Handles remove enemy.
     */
    removeEnemy() {
        if (!this.coinDropChecked) {
            this.coinDropChecked = true;
            this.trySpawnCoinDrop();
        }
        super.removeEnemy();
    }

    /**
     * Handles try spawn coin drop.
        * @returns {void}
     */
    trySpawnCoinDrop() {
        if (!this.world) return;
        const randomNumber = Math.random();
        if (randomNumber < 0.2 || randomNumber > 0.4) return;
        const spawnX = this.position_x;
        const world = this.world;
        setTimeout(() => {
            if (!world) return;
            const coin = new CollectibleCoin(spawnX, 280);
            coin.world = world;
            world.collectibleCoins.push(coin);
        }, 200);
    }
}