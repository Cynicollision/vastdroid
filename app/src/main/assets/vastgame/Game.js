(function () {
    // one way to set a horizontal resolution...
    // TODO: better way to set resolution like this based on a target width/height (target size and then horizontally or vertically oriented)
    // just need better way to set scale in general
    //vastengine.Config.scaleToHorizontalResolution ?
    var resX = (1 / (320 / window.innerWidth));
    $vast.Config.scale = resX;
    $vast.Config.scaleCenter = true;
    $vast.Config.fullScreen = true;
    $vast.Debug.show = true;

    $vast.Canvas.setBackgroundImage('../images/bg.png', true);
    $vast.Canvas.setScrollFactor(0.6);

    $vast.Images.add('playersheet', 'playersheet.png');
    $vast.Images.add('box', 'box.png');
    $vast.Images.add('stone', '../images/stone.png');

    $vast.Images.load();

    var gameController = vastgame.buildGameController();
    $vast.Game.setActiveController(gameController);

    // start with the canvas invisible, gameController will show it once ready
    $vast.Game.run();
    $vast.Canvas.setVisible(false);
}());