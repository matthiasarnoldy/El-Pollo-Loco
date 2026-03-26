class Level {
    enemies;
    clouds;
    backgroundObjects;
    collectibleBottles;
    level_end_x = 720 * 9;

    constructor(enemies, clouds, backgroundObjects, collectibleBottles = []) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.collectibleBottles = collectibleBottles;
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

    static createCollectibleBottles(amount) {
        const bottles = [];
        const spawnRange = this.getCollectibleBottleSpawnRange();
        for (let index = 0; index < amount; index++) {
            const randomValue = Math.random() * spawnRange.totalRangeLength;
            const randomX = randomValue < spawnRange.leftRangeLength
                ? spawnRange.minX + randomValue
                : spawnRange.rightStart + (randomValue - spawnRange.leftRangeLength);
            bottles.push(new CollectibleBottle(randomX));
        }
        return bottles;
    }

    static getCollectibleBottleSpawnRange() {
        const minX = -700;
        const leftEnd = -300;
        const rightStart = 300;
        const maxX = 720 * 9 - 720;
        const leftRangeLength = leftEnd - minX;
        const rightRangeLength = maxX - rightStart;
        const totalRangeLength = leftRangeLength + rightRangeLength;
        return { minX, rightStart, leftRangeLength, totalRangeLength };
    }
}