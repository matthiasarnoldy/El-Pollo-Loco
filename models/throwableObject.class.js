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
    offset = {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
    };
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
        const enemy = this.findCollidingEnemy();
        if (!enemy) return;
        const zone = this.getHitZone(enemy);
        this.alignBottleOnHit(enemy);
        this.applyDamageToEnemy(enemy, zone);
        this.finishHit();
    }

    findCollidingEnemy() {
        return this.world.level.enemies.find(enemy =>
            enemy.health > 0 && this.isEnemyColliding(enemy)
        );
    }

    isEnemyColliding(enemy) {
        if (enemy instanceof Endboss) {
            return !!enemy.getHitZoneForObject(this);
        }
        return this.isColliding(enemy);
    }

    getHitZone(enemy) {
        return enemy instanceof Endboss ? enemy.getHitZoneForObject(this) : null;
    }

    alignBottleOnHit(enemy) {
        if (!(enemy instanceof Endboss)) this.getObjectCenter(enemy);
    }

    applyDamageToEnemy(enemy, zone) {
        const baseDamage = this.damage;
        if (zone) this.damage = this.getDamageByZone(zone);
        enemy.hit(this);
        this.damage = baseDamage;
    }

    finishHit() {
        this.hasHit = true;
        this.stopGravity();
        this.playSplashAnimation();
        this.removeThrowableObject();
    }

    getDamageByZone(zone) {
        const multipliers = {
            head: 1.5,
            body: 1.0,
            feet: 0.5
        };
        return Math.round(this.damage * (multipliers[zone] ?? 1));
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