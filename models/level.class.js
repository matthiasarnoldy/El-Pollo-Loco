class Level {
    enemies;
    clouds;
    backgroundObjects;
    level_end_x = 720 * 8;

    constructor(enemies, clouds, backgroundObjects) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
    }


    static createBackgroundObjects(amount) {
        let backgrounds = [];
        for (let i = 0; i < amount; i++) {
            let x = (i - 1) * 720;
            let imageNumber = (i % 2) + 1;
            backgrounds.push(
                new BackgroundObject("assets/img/5_background/layers/air.png", x),
                new BackgroundObject(`assets/img/5_background/layers/3_third_layer/${imageNumber}.png`, x),
                new BackgroundObject(`assets/img/5_background/layers/2_second_layer/${imageNumber}.png`, x),
                new BackgroundObject(`assets/img/5_background/layers/1_first_layer/${imageNumber}.png`, x)
            );
        }
        return backgrounds;
    }
}