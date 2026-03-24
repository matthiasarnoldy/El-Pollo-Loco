class World {
    character = new Character();
    statusbar_health = new Statusbar();
    throwableObjects = [];
    level = level1;
    canvas;
    ctx;
    keyboard;
    throwKeyHandled = false;
    camera_x = 0;


    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
        this.runInterval();
        this.character.applyGravity();
    }

    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach((enemy) => enemy.world = this);
        this.throwableObjects.forEach((bottle) => bottle.world = this);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);

        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusbar_health);
        this.ctx.translate(this.camera_x, 0);

        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.ctx.translate(-this.camera_x, 0);

        let self = this;
        requestAnimationFrame(function() {
            self.draw();
        });
    }

    addObjectsToMap(objects) {
        objects.forEach((object => {
            this.addToMap(object);
        }));
    }

    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        }
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);
        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.position_x = mo.position_x * -1;
    }

    flipImageBack(mo) {
        mo.position_x = mo.position_x * -1;
        this.ctx.restore();
    }

    runInterval() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
        }, 1000 / 60);
    }

    checkCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (enemy.health <= 0) return;
            if (this.character.isColliding(enemy)) {
                if (this.isStomp(enemy)) {
                    this.characterStompEnemy(enemy);
                } else {
                    this.enemyHitCharacter(enemy);
                }
            }
        });
    }

    isStomp(enemy) {
        const isAboveEnemy = this.character.getLastHitboxBottom() <= enemy.getHitboxTop() + 10;
        const isFalling = this.character.speed_y <= 0;
        const isStomp = isAboveEnemy && isFalling;
        return isStomp;
    }

    enemyHitCharacter(enemy) {
        this.character.hit(enemy);
        this.statusbar_health.setPercentage(this.character.health);
    }

    characterStompEnemy(enemy) {
        enemy.hit(this.character);
        this.character.speed_y = 10;
    }

    checkThrowObjects() {
        if (this.keyboard.THROW && !this.throwKeyHandled) {
            let bottle = new ThrowableObject(this.character.position_x + 30, this.character.position_y + 100, this.character.otherDirection);
            this.throwableObjects.push(bottle);
            this.throwKeyHandled = true;
        }
        if (!this.keyboard.THROW) {
            this.throwKeyHandled = false;
        }
    }
}