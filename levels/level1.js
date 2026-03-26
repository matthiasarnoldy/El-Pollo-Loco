const level1 = new Level(
    [
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new Chicken_small(),
        new Chicken_small(),
        new Chicken_small(),
        new Chicken_small(),
        new Chicken_small(),
        new Chicken_small(),
        new Chicken_small(),
        new Chicken_small(),
        new Endboss()
    ],
    [
        new Cloud("assets/img/5_background/layers/4_clouds/1.png"),
        // new Cloud("assets/img/5_background/layers/4_clouds/2.png"),
    ],
    Level.createBackgroundObjects(10),
    Level.createCollectibleBottles(3)
);