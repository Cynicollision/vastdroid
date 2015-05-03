/// <reference path="C:\Users\Sean\workspace\vastengine\engine\src/namespace.js" />
(function () {
    var player,
        moveSpeed = 50,
        frameSpeed = 4,
        facingRight = true;
   
    var State = {
        idle: 0,
        falling: 1,
        moving: 2,
        stopping: 3,
        jumpingRight: 4,
        jumpingLeft: 5
    };

    var Sprite = {
        idleRight:0,
        idleLeft: 1,
        moveRight: 2,
        moveLeft: 3,
        moveRightHandsFull: 4,
        moveLeftHandsFull: 5,
        liftRight: 6,
        liftLeft: 7,
        idleRightHandsFull: 8,
        idleLeftHandsFull: 9,
        dropRight: 10,
        dropLeft: 11
    };

    vastgame.buildPlayer = function (ctrl) {
        player = new $vast.Entity(null, 'player');
        player.state = State.idle;
        player.handsFull = false;
        player.setSize(64, 64);
        player.depth = -100;
        player.step = function () {
            var x = Math.floor(player.x),
                y = Math.floor(player.y),
                distanceThreshold = 5;

            switch (player.state) {
                case State.moving:
                    if ((x % vastgame.TILE_SIZE < distanceThreshold) && (y % vastgame.TILE_SIZE < distanceThreshold)) {
                        if (ctrl.isPositionFree(player.x + 2, player.y + 66)) {
                            player.fall();
                        } else if (!ctrl.moving) {
                            player.stop();
                        }
                    }

                    if (!ctrl.isPositionFree(player.x + 65, player.y + 2, 'wall')) {
                        player.stop();
                    } else if (!ctrl.isPositionFree(player.x - 1, player.y + 2, 'wall')) {
                        player.stop();
                    }
                    break;

                case State.jumpingLeft:
                    if ((x % vastgame.TILE_SIZE < distanceThreshold) && (y % vastgame.TILE_SIZE < distanceThreshold)) {
                        player.stop();
                        player.moveLeft();
                    }
                    break;
                case State.jumpingRight:
                    if ((x % vastgame.TILE_SIZE < distanceThreshold) && (y % vastgame.TILE_SIZE < distanceThreshold)) {
                        player.stop();
                        player.moveRight();
                    }
                    break;
                case State.falling:
                    if (!ctrl.isPositionFree(player.x + 2, player.y + 63, 'wall') || !ctrl.isPositionFree(player.x + 2, player.y + 63, 'box')) {
                        player.stop();
                    }
                    break;
                case State.stopping:
                    if (ctrl.isPositionFree(player.x + 2, player.y + 65)) {
                        player.fall();
                    } else {
                        player.state = State.idle;
                    }
            }
        };

        player.setSprite = function (spr) {
            var newSprite,
                srcImage = $vast.Images.getById('playersheet');

            switch (spr) {
                case (Sprite.moveRight):
                    newSprite = $vast.Sprite.fromImage(srcImage, 64, 64, 0, 3, 1);
                    break;

                case (Sprite.moveLeft):
                    newSprite = $vast.Sprite.fromImage(srcImage, 64, 64, 4, 7, 1);
                    break;

                case (Sprite.idleLeft):
                    newSprite = $vast.Sprite.fromImage(srcImage, 64, 64, 4, 4);
                    break;

                case (Sprite.idleRight):
                    newSprite = $vast.Sprite.fromImage(srcImage, 64, 64, 0, 0);
                    break;

                case (Sprite.liftRight):
                    newSprite = $vast.Sprite.fromImage(srcImage, 64, 64, 16, 18);
                    newSprite.onAnimationEnd = function () {
                        player.setSprite(Sprite.idleRightHandsFull);
                        player.sprite.onAnimationEnd = null;
                        player.handsFull = true;
                    };
                    break;

                case (Sprite.liftLeft):
                    newSprite = $vast.Sprite.fromImage(srcImage, 64, 64, 20, 22);
                    newSprite.onAnimationEnd = function () {
                        player.setSprite(Sprite.idleLeftHandsFull);
                        player.sprite.onAnimationEnd = null;
                        player.handsFull = true;
                    };
                    break;

                case (Sprite.idleRightHandsFull):
                    newSprite = $vast.Sprite.fromImage(srcImage, 64, 64, 8, 8);
                    break;

                case (Sprite.idleLeftHandsFull):
                    newSprite = $vast.Sprite.fromImage(srcImage, 64, 64, 12, 12);
                    break;

                case (Sprite.moveRightHandsFull):
                    newSprite = $vast.Sprite.fromImage(srcImage, 64, 64, 8, 11);
                    break;

                case (Sprite.moveLeftHandsFull):
                    newSprite = $vast.Sprite.fromImage(srcImage, 64, 64, 12, 15);
                    break;

                case (Sprite.dropRight):
                    newSprite = $vast.Sprite.fromImage(srcImage, 64, 64, 24, 26);
                    break;

                case (Sprite.dropLeft):
                    newSprite = $vast.Sprite.fromImage(srcImage, 64, 64, 28, 30);
                    break;
            }

            newSprite.frameSpeed = frameSpeed;
            player.sprite = newSprite;
        };

        player.moveRight = function () {
            facingRight = true;
            player.state = State.moving;
            player.direction = 0;
            player.speed = moveSpeed;

            if (player.handsFull) {
                player.setSprite(Sprite.moveRightHandsFull);
            } else {
                player.setSprite(Sprite.moveRight);
            }
        };

        player.moveLeft = function () {
            facingRight = false;
            player.state = State.moving;
            player.direction = 180;
            player.speed = moveSpeed;

            if (player.handsFull) {
                player.setSprite(Sprite.moveLeftHandsFull);
            } else {
                player.setSprite(Sprite.moveLeft);
            }
        };

        player.stop = function () {
            if (facingRight) {
                if (player.handsFull) {
                    player.setSprite(Sprite.idleRightHandsFull);
                } else {
                    player.setSprite(Sprite.idleRight);
                }
            } else {
                if (player.handsFull) {
                    player.setSprite(Sprite.idleLeftHandsFull);
                } else {
                    player.setSprite(Sprite.idleLeft);
                }
            }

            player.state = State.stopping;
            player.speed = 0;

            // snap to the grid
            // TODO: this should probably be in vastengine.Controller?
            var xL = Math.floor(player.x / vastgame.TILE_SIZE) * vastgame.TILE_SIZE,
                xR = Math.floor((player.x + vastgame.TILE_SIZE) / vastgame.TILE_SIZE) * vastgame.TILE_SIZE,
                yU = Math.floor(player.y / vastgame.TILE_SIZE) * vastgame.TILE_SIZE,
                yD = Math.floor((player.t + vastgame.TILE_SIZE) / vastgame.TILE_SIZE) * vastgame.TILE_SIZE,
                targetX = xL,
                targetY = yU,
                distanceToLeft = player.x - xL,
                distanceToRight = xR - player.x,
                distanceToUp = player.y - yU,
                distanceToDown = yD - player.y;

            if (distanceToLeft > distanceToRight) {
                targetX = xR;
            }
            if (distanceToDown > distanceToUp) {
                targetY = yU;
            }

            player.setPosition(targetX, targetY);
        };

        player.fall = function () {
            player.state = State.falling;
            player.direction = 90;
            player.speed = moveSpeed;
        };

        player.jumpRight = function () {
            player.state = State.jumpingRight;
            player.direction = 270;
            player.speed = moveSpeed * 2;
        };

        player.jumpLeft = function () {
            player.state = State.jumpingLeft;
            player.direction = 270;
            player.speed = moveSpeed * 2;

        };

        player.liftBox = function (boxEntity) {
            if (!player.handsFull) {
                if (boxEntity.x > player.x) {
                    player.setSprite(Sprite.liftRight);
                } else {
                    player.setSprite(Sprite.liftLeft);
                }

                return boxEntity;
            }
        };

        player.tryDrop = function (boxEntity, rightFree, rightUpFree, leftFree, leftUpFree) {
            var dropped = false;
            if (facingRight) {
                if (rightFree) {
                    boxEntity.x = player.x + vastgame.TILE_SIZE;
                    boxEntity.y = player.y;
                    dropped = true;
                } else if (rightUpFree) {
                    boxEntity.x = player.x + vastgame.TILE_SIZE;
                    boxEntity.y = player.y - vastgame.TILE_SIZE;
                    dropped = true;
                }
            } else {
                if (leftFree) {
                    boxEntity.x = player.x - vastgame.TILE_SIZE;
                    boxEntity.y = player.y;
                    dropped = true;
                } else if (leftUpFree) {
                    boxEntity.x = player.x - vastgame.TILE_SIZE;
                    boxEntity.y = player.y - vastgame.TILE_SIZE;
                    dropped = true;
                }
            }

            if (dropped) {
                player.handsFull = false;
                player.setSprite(facingRight ? Sprite.dropRight : Sprite.dropLeft);
                player.sprite.onAnimationEnd = function () {
                    player.setSprite(facingRight ? Sprite.idleRight : Sprite.idleLeft);
                    player.sprite.onAnimationEnd = null;
                };
            }
        };

        // default sprite
        player.setSprite(Sprite.idleRight);
        return player;
    }
}());
