
(function () {
    var gameController, heldBox;

    vastgame.buildGameController = function () {
        gameController = new vastengine.Controller();

        // build entities
        var mainPlayer = vastgame.buildPlayer(gameController);
        gameController.addEntity(mainPlayer);
        buildRoom();

        gameController.moving = false;

        gameController.onTouch = function (x, y) {
            if (mainPlayer.speed === 0) {
                var speed = 50, clickedTileX, clickedTileY, playerTileX, playerTileY;
                clickedTileX = Math.floor(x / vastgame.TILE_SIZE);
                clickedTileY = Math.floor(y / vastgame.TILE_SIZE);
                playerTileX = Math.floor(mainPlayer.x / vastgame.TILE_SIZE);
                playerTileY = Math.floor(mainPlayer.y / vastgame.TILE_SIZE);

                // moving/jumping
                // TODO: special checks if player's hands are held (i.e. heldBox is defined?) to make sure the space next to the block is free too
                if (gameController.isPositionFree(x, y)) {
                    if (clickedTileX === playerTileX + 1) {
                        if (clickedTileY === playerTileY || clickedTileY === playerTileY + 1) {
                            gameController.moving = true;
                            mainPlayer.moveRight();
                        } else if (clickedTileY === playerTileY - 1 && !gameController.isPositionFree(mainPlayer.x + vastgame.TILE_SIZE + 1, mainPlayer.y + 1)) {
                            mainPlayer.jumpRight();
                        }
                    } else if (clickedTileX === playerTileX - 1) {
                        if (clickedTileY === playerTileY || clickedTileY === playerTileY + 1) {
                            gameController.moving = true;
                            mainPlayer.moveLeft();
                        } else if (clickedTileY === playerTileY - 1 && !gameController.isPositionFree(mainPlayer.x - 1, mainPlayer.y + 1)) {
                            mainPlayer.jumpLeft();
                        }
                    }
                } else {
                    gameController.moving = false;
                }

                // lifting a block
                var box = gameController.getEntitiesAtPosition(x, y, 'box');
                if (box.length > 0) {
                    // make sure box is immediately left or right of the player
                    if (box[0].y === mainPlayer.y && (box[0].x === (playerTileX * vastgame.TILE_SIZE) - vastgame.TILE_SIZE || box[0].x === (playerTileX * vastgame.TILE_SIZE) + vastgame.TILE_SIZE)) {
                        // also make sure the space above the box is clear
                        if (gameController.isPositionFree(box[0].x + 5, box[0].y - 5)) {
                            var attemptedLift = mainPlayer.liftBox(box[0]);
                            if (attemptedLift) {
                                heldBox = attemptedLift;
                            }
                        }
                    }
                }

                // dropping a block
                if (heldBox) {
                    if (clickedTileX === playerTileX && clickedTileY === playerTileY - 1) {
                        var rightFree = gameController.isPositionFree(mainPlayer.x + vastgame.TILE_SIZE + 5, mainPlayer.y + 5);
                        var leftFree = gameController.isPositionFree(mainPlayer.x - 5, mainPlayer.y + 5);
                        var rightUpFree = gameController.isPositionFree(mainPlayer.x + vastgame.TILE_SIZE + 5, mainPlayer.y - 5);
                        var leftUpFree = gameController.isPositionFree(mainPlayer.x - 5, mainPlayer.y - 5);

                        mainPlayer.tryDrop(heldBox, rightFree, rightUpFree, leftFree, leftUpFree);
                    }
                }
            }
        };

        gameController.onTouchEnd = function () {
            if (gameController.moving) {
                gameController.moving = false;
            }
        }

        gameController.postStep = function () {
            // trick to avoid "jumping" effect on load if you call Canvas.setVisible(false) right after Game.run(), then this.
            // (when view is drawn at (0, 0) briefly before "snapping" to desired position)
            if (!$vast.Canvas.visible) {
                $vast.Canvas.setVisible(true);
            }

            // adjust the view's coordinates to follow the player Entity
            var viewX = (mainPlayer.x + (mainPlayer.width / 2)) - ($vast.Canvas.getWidth() / 2),
                viewY = (mainPlayer.y + (mainPlayer.height / 2)) - ($vast.Canvas.getHeight() / 2);
            gameController.setViewPosition(viewX, viewY);

            // if the player is holding a box, update its position
            if (heldBox && mainPlayer.handsFull) {
                heldBox.x = mainPlayer.x;
                heldBox.y = mainPlayer.y - heldBox.height;
            }
        };

        // sets up a room to move around in
        function buildRoom() {
            var levelMap = [
                '##################',
                '#                #',
                '#                #',
                '#                #',
                '#XX              #',
                '#####           X#',
                '####### P      ###',
                '##########    ####',
                '##########  ######',
                '##################'
            ];

            for (var i = 0; i < levelMap.length; i++) {
                var row = levelMap[i];
                for (var j = 0; j < row.length; j++) {
                    switch (row.charAt(j)) {
                        case '#':
                            var wall = new $vast.Entity('wall', 0);
                            wall.sprite = $vast.Sprite.fromImage($vast.Images.getById('stone'), 64, 64);
                            wall.setPosition(j * vastgame.TILE_SIZE, i * vastgame.TILE_SIZE);
                            wall.setSize(vastgame.TILE_SIZE, vastgame.TILE_SIZE);
                            gameController.addEntity(wall);
                            break;
                        case 'P':
                            mainPlayer.setPosition(j * vastgame.TILE_SIZE, i * vastgame.TILE_SIZE);
                            break;
                        case 'X':
                            var box = new $vast.Entity('box', 0);
                            box.sprite = $vast.Sprite.fromImage($vast.Images.getById('box'), 64, 64);
                            box.setPosition(j * vastgame.TILE_SIZE, i * vastgame.TILE_SIZE);
                            box.setSize(vastgame.TILE_SIZE, vastgame.TILE_SIZE);
                            gameController.addEntity(box);
                            break;
                    }
                }
            }

            var boxes = gameController.getEntitiesByType('box');
            for (var i = 0; i < boxes.length; i++) {
                boxes[i].falling = false;
                boxes[i].step = function (me) {
                    if (!me.falling) {
                        if (gameController.isPositionFree(me.x + 5, me.y + vastgame.TILE_SIZE + 5)) {
                            me.falling = true;
                            me.speed = 50;
                            me.direction = 90;
                        }
                    } else if (!gameController.isPositionFree(me.x + 2, me.y + vastgame.TILE_SIZE + 5, 'wall') || !gameController.isPositionFree(me.x + 2, me.y + vastgame.TILE_SIZE + 5, 'box')) {
                        me.falling = false;
                        // snap to the grid
                        // TODO: this should probably be in vastengine.Controller?
                        var xL = Math.floor(me.x / vastgame.TILE_SIZE) * vastgame.TILE_SIZE,
                            xR = Math.floor((me.x + vastgame.TILE_SIZE) / vastgame.TILE_SIZE) * vastgame.TILE_SIZE,
                            yU = Math.floor(me.y / vastgame.TILE_SIZE) * vastgame.TILE_SIZE,
                            yD = Math.floor((me.y + vastgame.TILE_SIZE) / vastgame.TILE_SIZE) * vastgame.TILE_SIZE,
                            targetX = xL,
                            targetY = yU,
                            distanceToLeft = me.x - xL,
                            distanceToRight = xR - me.x,
                            distanceToUp = me.y - yU,
                            distanceToDown = yD - me.y;


                        me.y = yD;
                        me.speed = 0;
                    }
                };
            }
        }

        return gameController;
    }
}());
