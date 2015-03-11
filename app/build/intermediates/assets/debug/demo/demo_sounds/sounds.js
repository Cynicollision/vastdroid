$vast.Game.init();

// add a test sound to the the asset manager - also works with mp3!
$vast.Game.Audio.add('zelda_rupee', '../sounds/LOZ_Get_Rupee.wav');
$vast.Game.Audio.load();

// set some ugly background color?
$vast.Game.Canvas.setBackgroundColor('#9A5');

var sound1 = $vast.Game.Audio.getById('zelda_rupee');
sound1.play();

// looping is annoying!

for (var i = 0; i <= 5; i++) {
    setTimeout(function () {
        sound1.play();
    }, i * 1000);
}