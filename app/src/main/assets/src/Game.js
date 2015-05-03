/// <reference path="namespace.js" />

/**
 * Enumeration of states that the game loop can be in (stopped or running).
 * @class GameState
 * @memberof Vastengine
 */
vastengine.GameState = {
    STOPPED: 0,
    RUNNING: 1
};

/**
 * Manages game-level components such as the currently running Controller object, routing input, and accessing assets through AssetManager instances.
 * @class Game
 * @memberof Vastengine
 */
vastengine.Game = (function () {
    var activeController = new vastengine.Controller();

    // initialize Canvas, Images, and Audio
    vastengine.Canvas.buildCanvas();
    vastengine.Images = new vastengine.AssetManager(vastengine.AssetType.IMAGE);
    vastengine.Audio = new vastengine.AssetManager(vastengine.AssetType.AUDIO);

    // default state is stopped. run() must be called to start the game.
    state = vastengine.GameState.STOPPED;

    return {
        /**
         * Sets the game state, used to pause and resume the game loop.
         * @memberof! Vastengine.Game
         * @param {GameState} state.
         */
        setState: function (newState) {
            state = newState;
        },

        /**
         * Returns the current game state.
         * @memberof! Vastengine.Game
         * @return {GameState} The current state of the game.
         */
        getState: function () {
            return state;
        },

        /** 
         * Sets the running Controller to the given Controller object.
         * @memberof! Vastengine.Game
         * @param {object} controller New active Controller object to run.
         */
        setActiveController: function (newActiveController) {
            activeController = newActiveController;
        },

        /** 
         * Returns the running Controller
         * @memberof! Vastengine.Game
         * @returns {object} Current active Controller object.
         */
        getActiveController: function () {
            return activeController;
        },

        /**
         * The main game loop. Starts the game and keeps it running at a fixed FPS.
         * @memberof! Vastengine.Game
         */
        run: function () {
            var stepSize, previous, now, offset = 0;
            stepSize = 1 / vastengine.Config.gameSpeed;
            state = vastengine.GameState.RUNNING;
            now = (function () {
                return function () {
                    if (window.performance && window.performance.now) {
                        return window.performance.now();
                    } else {
                        return (new Date()).getTime();
                    }
                };
            })();

            previous = now();

            function stepAndDraw() {
                var current = now();
                offset += (Math.min(1, (current - previous) / 1000));

                while (offset > stepSize) {
                    if (state === vastengine.GameState.RUNNING) {
                        if (activeController) {
                            activeController.step(stepSize);
                        }
                    }

                    offset -= stepSize;
                }

                vastengine.Canvas.draw();

                previous = current;
                requestAnimationFrame(stepAndDraw);
            }

            vastengine.Canvas.updateCanvasSize();
            vastengine.Canvas.setVisible(true);
            requestAnimationFrame(stepAndDraw);
        },

        /**
         * For throwing exceptions by errors raised by vastengine itself.
         * @memberof! Vastengine.Game
         * @param {string} message Error message.
         * @param {string} (optional) e Inner exception.
         */
        setError: function (message, e) {
            var error = "vastengine error: ";
            if (message) {
                error += message;
            }
            if (e) {
                error += '\n\n' + e;
            }

            throw error;
        }
    };
}());
