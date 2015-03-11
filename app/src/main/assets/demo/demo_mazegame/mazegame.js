/// <reference path="C:\Users\Sean\workspace\vastengine\src/Dialog.js" />
/// <reference path="C:\Users\Sean\workspace\vastengine\src/Canvas.js" />
// set background color and load assets
(function () {
    // used for grid movement
    var TILE_SIZE = 64;

    // game config settings
    $vast.Game.Config.fps = 60;
    $vast.Game.Config.scaleFromCenter = true;
    $vast.Game.init();

    // images
    $vast.Game.Canvas.setBackgroundImage('../images/bg.png', true);
    $vast.Game.Images.add('sun', '../images/man.png');
    $vast.Game.Images.add('flag', '../images/flag.png');
    $vast.Game.Images.add('stone', '../images/stone.png');
    $vast.Game.Images.add('badguy', '../images/enemy.png');
    $vast.Game.Images.load();

    // one way to set a horizontal resolution...
    // TODO: better way to set resolution like this based on a target width/height
    var resX = (1 / (512 / $vast.Game.Canvas.getCanvasWidth()));
    $vast.Game.Canvas.setScale(resX);

    // cool background scolling effect
    $vast.Game.Canvas.setScrollFactor(0.6);

    // game components
    var ctrl = new $vast.Controller();
    var mainPlayer = buildPlayerEntity();
    var goal;
    var badguy = buildEnemyEntity();

    // setup Controller and Entity objects, then run the game
    function buildAndRun() {

        // set up the "controller" with the test Entity object
        ctrl.addEntity(mainPlayer);
        ctrl.addEntity(badguy);
        ctrl.setOnTouch(gameClick);
        ctrl.setPostStep(function () {
            // adjust the view's coordinates to follow the player Entity
            var x = (mainPlayer.getX() + (mainPlayer.width / 2)) - ($vast.Game.Config.canvasWidth / 2);
            var y = (mainPlayer.getY() + (mainPlayer.height / 2)) - ($vast.Game.Config.canvasHeight / 2);
            ctrl.setViewPosition(x, y);
        });

        buildWallMap(ctrl);
        $vast.Game.setActiveController(ctrl);

        // run the game
        $vast.Game.run();
    }


    // builds and returns the player Entity object
    function buildPlayerEntity() {
        var player = new $vast.Entity(null, 'player');
        player.setSize(TILE_SIZE, TILE_SIZE);
        player.setImage($vast.Game.Images.getById('sun'));
        player.setPosition(64, 64);
        player.depth = -100; // make sure player stays on top

        // define a step function
        player.setStep(function () {
            var x = Math.floor(mainPlayer.getX());
            var y = Math.floor(mainPlayer.getY());
            if ((x % TILE_SIZE < 5) && (y % TILE_SIZE < 5) && (mainPlayer.getSpeed() > 0)) {
                // "snap" to the grid
                mainPlayer.setSpeed(0);
                mainPlayer.setPosition(TILE_SIZE * Math.floor(x / TILE_SIZE), TILE_SIZE * Math.floor(y / TILE_SIZE));

                // see if we made it to the goal
                checkForWin();
            } else {
                // check to see if we died
                checkForDead();
            }
        });

        return player;
    }


    // builds and returns an enemy
    function buildEnemyEntity() {
        var enemy = new $vast.Entity(null, 'enemy');
        enemy.setImage($vast.Game.Images.getById('badguy'));
        enemy.setPosition(384, 256);
        enemy.setSize(TILE_SIZE, TILE_SIZE);
        enemy.setSpeed(10);
        enemy.setDirection(0); // right
        enemy.setStep(function () {
            // "bounce" left and right
            var toMyLeft = ctrl.getEntitiesAtPosition(enemy.getX() - 2, enemy.getY() + 2, 'wall');
            var toMyRight = ctrl.getEntitiesAtPosition(enemy.getX() + enemy.width + 2, enemy.getY() + 2, 'wall');

            if (enemy.getDirection() === 180 && toMyLeft.length > 0) {
                enemy.setDirection(0);
            } else if (enemy.getDirection() === 0 && toMyRight.length > 0) {
                enemy.setDirection(180);
            }
        });
        return enemy;
    }

    // sets up a room to move around in
    function buildWallMap(ctrl) {
        var levelMap = {
            0: '################',
            1: '#              #',
            2: '#####  ######  #',
            3: '#   ####  ###  #',
            4: '# ####      #  #',
            5: '# #  # ###  #  #',
            6: '#      #F#     #',
            7: '# ###### ####  #',
            8: '#           #  #',
            9: '################'

        }

        var rowCount = 10;

        for (var i = 0; i < rowCount; i++) {
            var row = levelMap[i];
            for (var j = 0; j < row.length; j++) {
                if (row.charAt(j) === '#') {
                    var wall = new $vast.Entity('wall', 0);
                    wall.setImage($vast.Game.Images.getById('stone'));
                    wall.setPosition(j * TILE_SIZE, i * TILE_SIZE);
                    wall.setSize(TILE_SIZE, TILE_SIZE);
                    ctrl.addEntity(wall);
                } else if (row.charAt(j) === 'F') {
                    goal = new $vast.Entity(null, 'goal');
                    goal.setImage($vast.Game.Images.getById('flag'));
                    goal.setPosition(j * TILE_SIZE, i * TILE_SIZE);
                    ctrl.addEntity(goal);
                }
            }
        }
    }

    // called when the user clicks on the screen
    function gameClick(x, y) {
        if (mainPlayer.getSpeed() === 0) {
            var speed = 50;
            var clickedTileX = Math.floor(x / TILE_SIZE);
            var clickedTileY = Math.floor(y / TILE_SIZE);
            var playerTileX = Math.floor(mainPlayer.x / TILE_SIZE);
            var playerTileY = Math.floor(mainPlayer.y / TILE_SIZE);

            if (ctrl.isPositionFree(x, y, 'wall')) {
                // determine which way to move
                if (clickedTileX === playerTileX) {
                    if (clickedTileY === playerTileY + 1) {
                        // move down
                        mainPlayer.setSpeed(speed);
                        mainPlayer.setDirection(90);
                    } else if (clickedTileY === playerTileY - 1) {
                        // move up
                        mainPlayer.setSpeed(speed);
                        mainPlayer.setDirection(270);
                    }
                } else if (clickedTileY === playerTileY) {
                    if (clickedTileX === playerTileX + 1) {
                        // move right
                        mainPlayer.setSpeed(speed);
                        mainPlayer.setDirection(0);
                    } else if (clickedTileX === playerTileX - 1) {
                        //move left
                        mainPlayer.setSpeed(speed);
                        mainPlayer.setDirection(180);
                    }
                }
            }
        }
    }

    // determine if the player ran into the enemy
    function checkForDead() {
        if (mainPlayer.checkCollision(badguy)) {
            var text = 'Dead!';
            var w = vastengine.Game.Canvas.getCanvasWidth() / 2;

            $vast.Game.setDialog(new $vast.Dialog(text, w, -1, ['Start over'], function () {
                mainPlayer.setPosition(64, 64);
                mainPlayer.setSpeed(0);
            }));
        }
    }

    // determine if the player made it to the goal
    function checkForWin() {
        var playerX = mainPlayer.getX();
        var playerY = mainPlayer.getY();
        var goalX = goal.getX();
        var goalY = goal.getY();

        var d = $vast.MathUtil.getPointDistance(playerX, playerY, goalX, goalY);
        if (d <= 1) {
            var text = 'Win!';
            var w = vastengine.Game.Canvas.getCanvasWidth() / 2;

            $vast.Game.setDialog(new $vast.Dialog(text, w, -1, ['Start over'], function () {
                mainPlayer.setPosition(64, 64);
            }));
        }
    }


    // kick it off
    buildAndRun();
})();
