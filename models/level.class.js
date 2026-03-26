class Level {
    enemies;
    clouds;
    backgroundObjects;
    collectibleBottles;
    collectibleCoins;
    level_end_x = 720 * 9;

    constructor(enemies, clouds, backgroundObjects, collectibleBottles = [], collectibleCoins = []) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.collectibleBottles = collectibleBottles;
        this.collectibleCoins = collectibleCoins;
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

    static createCollectibleCoins() {
        const coins = [];
        this.addSingleCoins(coins, 14);
        this.addStraightCoinRows(coins, 4);
        this.addArcCoinRows(coins, 5);
        return coins;
    }

    static addSingleCoins(coins, amount) {
        for (let index = 0; index < amount; index++) {
            const x = this.getRandomCoinX();
            const y = this.getRandomCoinY(140, 320);
            this.tryAddCoin(coins, x, y);
        }
    }

    static addStraightCoinRows(coins, rowAmount) {
        for (let rowIndex = 0; rowIndex < rowAmount; rowIndex++) {
            const coinsInRow = 4 + Math.floor(Math.random() * 3);
            const spacing = 90;
            const rowY = this.getRandomCoinY(150, 300);
            const startX = this.getRandomCoinX();
            for (let coinIndex = 0; coinIndex < coinsInRow; coinIndex++) {
                const coinX = startX + coinIndex * spacing;
                this.tryAddCoin(coins, coinX, rowY);
            }
        }
    }

    static addArcCoinRows(coins, arcAmount) {
        for (let arcIndex = 0; arcIndex < arcAmount; arcIndex++) {
            const coinsInArc = 7;
            const spacing = 70;
            const baseY = this.getRandomCoinY(220, 330);
            const arcHeight = 90;
            const startX = this.getRandomCoinX();
            const centerIndex = (coinsInArc - 1) / 2;
            this.addArcCoins(coins, coinsInArc, spacing, baseY, arcHeight, startX, centerIndex);
        }
    }

    static addArcCoins(coins, coinsInArc, spacing, baseY, arcHeight, startX, centerIndex) {
        for (let coinIndex = 0; coinIndex < coinsInArc; coinIndex++) {
            const normalized = (coinIndex - centerIndex) / centerIndex;
            const arcOffset = (1 - normalized * normalized) * arcHeight;
            const x = startX + coinIndex * spacing;
            const y = baseY - Math.round(arcOffset);
            this.tryAddCoin(coins, x, y);
        }
    }

    static tryAddCoin(coins, initialX, initialY) {
        const maxTries = 12;
        for (let attempt = 0; attempt < maxTries; attempt++) {
            const jitterX = attempt === 0 ? 0 : (Math.random() * 80 - 40);
            const jitterY = attempt === 0 ? 0 : (Math.random() * 50 - 25);
            const x = initialX + jitterX;
            const y = initialY + jitterY;
            if (this.hasCoinOverlap(coins, x, y)) continue;
            coins.push(new CollectibleCoin(x, y));
            return;
        }
    }

    static hasCoinOverlap(coins, x, y) {
        const minDistance = 64;
        const minDistanceSquared = minDistance * minDistance;
        return coins.some((coin) => {
            const dx = coin.position_x - x;
            const dy = coin.position_y - y;
            return dx * dx + dy * dy < minDistanceSquared;
        });
    }

    static getRandomCoinX() {
        const minX = -700;
        const maxX = 720 * 9 - 900;
        return minX + Math.random() * (maxX - minX);
    }

    static getRandomCoinY(minY, maxY) {
        return minY + Math.random() * (maxY - minY);
    }
}