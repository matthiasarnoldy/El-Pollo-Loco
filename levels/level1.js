/**
 * Creates level1.
 * @returns {Level}
 */
function createLevel1() {
    return new Level(
        createLevel1Enemies(),
        Level.createClouds(7),
        Level.createBackgroundObjects(10),
        Level.createCollectibleBottles(4),
        Level.createCollectibleCoins()
    );
}

/**
 * Creates enemy objects for level1.
 * @returns {Array<MovableObject>}
 */
function createLevel1Enemies() {
    return [
        ...createLevel1Chickens(8),
        ...createLevel1SmallChickens(8),
        new Endboss()
    ];
}

/**
 * Creates normal chickens for level1.
 * @param {number} amount
 * @returns {Array<Chicken>}
 */
function createLevel1Chickens(amount) {
    const chickens = [];
    for (let index = 0; index < amount; index++) {
        chickens.push(new Chicken());
    }
    return chickens;
}

/**
 * Creates small chickens for level1.
 * @param {number} amount
 * @returns {Array<Chicken_small>}
 */
function createLevel1SmallChickens(amount) {
    const chickens = [];
    for (let index = 0; index < amount; index++) {
        chickens.push(new Chicken_small());
    }
    return chickens;
}