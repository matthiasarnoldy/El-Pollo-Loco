class CollectibleBottle extends MovableObject {
    width = 50;
    height = 60;
    position_y = 360;
    offset = {
        left: 10,
        right: 10,
        top: 10,
        bottom: 8
    };
    IMAGES_BOTTLE = [
        "assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png",
        "assets/img/6_salsa_bottle/2_salsa_bottle_on_ground.png"
    ];

    /**
     * Creates a new CollectibleBottle instance.
     * @param {number} positionX
     */
    constructor(positionX) {
        super().loadImage(this.IMAGES_BOTTLE[this.getRandomBottleImage()]);
        this.loadImages(this.IMAGES_BOTTLE);
        this.position_x = positionX;
    }

    /**
     * Returns random bottle image.
     * @returns {number}
     */
    getRandomBottleImage() {
        const randomNumber = Math.random();
        return randomNumber < 0.5 ? 1 : 0;
    }
}