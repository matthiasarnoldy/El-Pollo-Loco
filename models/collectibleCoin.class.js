class CollectibleCoin extends MovableObject {
    width = 90;
    height = 90;
    position_y = 0;
    offset = {
        left: 30,
        right: 30,
        top: 30,
        bottom: 30
    };
    IMAGE_COIN = "assets/img/8_coin/coin_1.png";

    /**
     * Creates a new CollectibleCoin instance.
     * @param {number} positionX
     * @param {number} positionY
     */
    constructor(positionX = 0, positionY = 0) {
        super().loadImage(this.IMAGE_COIN);
        this.position_x = positionX;
        this.position_y = positionY;
    }
}
