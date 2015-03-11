/// <reference path="C:\Users\Sean\workspace\vastengine\src/Game.js" />
(function () {
    $vast.Game.init();

    var DIALOG_TEXT = 'Hello, world! Here is a whole bunch of text that hopefully fits in this dialog.';
    var DIALOG_TEXT2 = 'Pick your favorite one. The consequences could be dire! YOLO SWAG YOLOSWAG here are several more words too why not';
    var text = 'Click to be PROMPTED!!!';

    // set the background color
    $vast.Game.Canvas.setBackgroundColor('#ecc');

    // set up Controller;
    var ctrl = new $vast.Controller();
    $vast.Game.setActiveController(ctrl);
    ctrl.setOnTouch(function () {
        var dialog = new $vast.Dialog(DIALOG_TEXT, 480, 0, ['vast1', 'vast2'], function (choice) {
            var response1 = new $vast.Dialog('Option number ' + (choice + 1) + '... meh...', 250, 0, ['OK'], function (unusedChoice) {
                var moreOptions = new $vast.Dialog(DIALOG_TEXT2, 800, 0, ['Red', 'Blue', 'Green'], function (choice) {
                    switch (choice) {
                        case 0:
                            $vast.Game.Canvas.setBackgroundColor('#F00');
                            break;
                        case 1:
                            $vast.Game.Canvas.setBackgroundColor('#00F');
                            break;
                        default:
                            $vast.Game.Canvas.setBackgroundColor('#0F0');

                    }
                });
                $vast.Game.setDialog(moreOptions);
            });
            $vast.Game.setDialog(response1);
            text = 'You picked ' + (choice + 1) + '!';
        });
        $vast.Game.setDialog(dialog);
    });


    // show some text
    var ent = new $vast.Entity();
    ent.setSpeed(10);
    ent.setDirection(90);

    ent.setDraw(function () {
        var context = $vast.Game.Canvas.getDrawingContext();
        context.font = '48px "Courier New"';
        context.fillText(text, 25, ent.y);
    });
    ctrl.addEntity(ent);

    // run the game
    $vast.Game.run();
})();