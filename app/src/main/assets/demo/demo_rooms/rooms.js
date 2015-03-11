/// <reference path="C:\Users\Sean\workspace\vastengine\src/Dialog.js" />
/// <reference path="C:\Users\Sean\workspace\vastengine\src/Canvas.js" />
/// <reference path="C:\Users\Sean\workspace\vastengine\src/Entity.js" />
/// <reference path="C:\Users\Sean\workspace\vastengine\src/Controller.js" />
/// <reference path="C:\Users\Sean\workspace\vastengine\src/Game.js" />
// set background color and load assets
(function () {

    $vast.Game.init();

    // game config settings
    //$vast.Game.Config.canvasWidth = 640;
    //$vast.Game.Config.canvasHeight = 512;

    // images
    $vast.Game.Images.add('sun', '../images/sun.jpg');
    $vast.Game.Images.add('stone', '../images/stone.png');
    $vast.Game.Images.add('badguy', '../images/enemy.png');
    $vast.Game.Images.load();

    // build the game
    var room1 = buildController1();
    var room2 = buildController2();
    var room3 = buildController3();
    setRoom(room1);
    $vast.Game.run();

    function setRoom(room) {
        $vast.Game.Canvas.setBackgroundColor(room.bgcolor);
        $vast.Game.setActiveController(room);
    }

    function buildController1() {
        var ent = new $vast.Entity();
        ent.setPosition(400, 100);
        ent.setImage($vast.Game.Images.getById('sun'));
        ent.setSize(64, 64);
        ent.setOnTouch(function () {
            setRoom(room2);
        });
        var ctrl = new $vast.Controller();
        ctrl.addEntity(ent);
        ctrl.bgcolor = '#00B';
        return ctrl;
    };

    function buildController2() {
        var ent = new $vast.Entity();
        ent.setPosition(100, 100);
        ent.setImage($vast.Game.Images.getById('stone'));
        ent.setSize(64, 64);
        ent.setOnTouch(function () {
            setRoom(room3);
        });
        var ctrl = new $vast.Controller();
        ctrl.addEntity(ent);
        ctrl.bgcolor = '#B00';
        return ctrl;
    };

    function buildController3() {
        var ent = new $vast.Entity();
        ent.setPosition(100, 400);
        ent.setImage($vast.Game.Images.getById('badguy'));
        ent.setSize(64, 64);
        ent.setOnTouch(function () {
            setRoom(room1);
        });
        var ctrl = new $vast.Controller();
        ctrl.addEntity(ent);
        ctrl.bgcolor = '#0B0';
        return ctrl;
    };
    
})();
