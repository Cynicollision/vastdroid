/// <reference path="Game.js" />
/// <reference path="Canvas.js" />
var vastengine = vastengine || {};
(function () {
    /**
     * Used to pause the game while waiting for user input. Uses the Canvas to 
     * show a HTML/CSS dialog box, returns the selection, closes, and resumes the game.
     * @constructor
     * @param {string} text The text to show in the dialog message (prompt).
     * @param {number} width The width of the dialog box.
     * @param {number} height Optional height of the dialog box. Use 0 to auto-size to the given text and options.
     * @param {Array.<string>} options List of options to choose from.
     * @param {function} callback Function to call when an option is selected, passing selected index.
     */
    vastengine.Dialog = function (text, width, height, options, callback) {
        this.width = width;
        this.height = height;
        this.callback = callback;

        // TODO: better place to get these from?
        this.buttonHeight = 80;
        this.lineSpacing = 50;
        this.textFont = (this.lineSpacing - 10) + 'pt Calibri';
        this.textPadding = 10;
    
        // build text lines
        this.textLines = this.buildTextLines(text, this.width - this.textPadding, this.textFont);

        // auto-height if not given a height.
        if (height <= 0) {
            this.height = (this.textLines.length * this.lineSpacing) + this.textPadding + (options.length * this.buttonHeight);
        }
    
        // position such that the dialog box will be centered, build buttons and text.
        this.x = 0;
        this.y = 0;
        if (vastengine.Canvas) {
            this.x = (vastengine.Canvas.getCanvasWidth() / 2) - (this.width / 2);
            this.y = (vastengine.Canvas.getCanvasHeight() / 2) - (this.height / 2);
        }
    
        this.buttons = this.buildButtons(options, this.x, this.y, this.width, this.height, this.buttonHeight);
        this.visible = false;

        // for a zoom-in animation when created.
        this.scale = function () {
            var currentScale = 0;
            return {
                get: function () { return currentScale; },
                update: function () {
                    if (currentScale < 1) {
                        currentScale += (1 - currentScale) * 0.25;
                    }
                    if (currentScale > 0.99) {
                        currentScale = 1;
                    }
                }
            };
        }();
    };

    vastengine.Dialog.prototype = {

        /**
         * Builds an array of individual lines of the dialog text based
         * such that it wraps neatly in the dialog box.
         * @param {string} text The text to build into lines.
         * @return {Array.<string>} Individual lines of wrapped text.
         */
        buildTextLines: function (text, maxWidth, font) {
            // determine line width.
            var lineWidth = -1;

            var context;
            if (vastengine.Canvas) {
                context = vastengine.Canvas.getDrawingContext();
                if (context) {
                    context.font = font;
                }
            }

            var textLines = [];
            var words = text.split(' ');
            var line = '';
            for (var i = 0; i < words.length; i++) {
                var currentLine = line + words[i] + ' ';
                if (context) {
                    var currentLineWidth = context.measureText(currentLine).width;
                    if (currentLineWidth > maxWidth && i > 0) {
                        textLines.push(line);
                        line = words[i] + ' ';
                    }
                    else {
                        line = currentLine;
                    }
                }

            }
            textLines.push(line); // the rest.

            return textLines;
        },

        /**
         * Builds buttons to be clicked on, including their position and size, for each of the given options.
         * @param {Array.<string>} options The options to build buttons for.
         */
        buildButtons: function (options, dialogX, dialogY, dialogW, dialogH, buttonHeight) {
            var buttons = [];
            for (var i = options.length - 1; i >= 0; i--) {
                buttons.push({ text: options[options.length - i - 1], x: dialogX, y: dialogY + dialogH - ((i + 1) * buttonHeight), w: dialogW, h: buttonHeight });
            }
            return buttons;
        },

        /**
         * Sets whether this Dialog object is visible on the screen.
         * @param {boolean} isVisible True to show the dialog.
         */
        setVisible: function (isVisible) {
            this.visible = isVisible;
        },

        /**
         * Determines whether this Dialog is currently visible.
         * @return {boolean} True if the Dialog object is currently visible (being drawn).
         */
        isVisible: function () {
            return this.visible;
        },

        /**
         * Touch event-handler. Determine if any of the buttons were clicked on, and if 
         * so call this Dialog object's callback function with the selected index then hide this dialog.
         * @param {number} x X-coordinate of touch event.
         * @param {number} y Y-coordinate of touch event.
         */
        onTouch: function (x, y) {
            var clickedOn = -1;

            // see if a button was clicked on.
            for (var i = 0; i < this.buttons.length; i++) {
                if (x > this.buttons[i].x && x < (this.buttons[i].x + this.buttons[i].w) && y > this.buttons[i].y && (y < this.buttons[i].y + this.buttons[i].h)) {
                    clickedOn = i;
                }
            }

            // destroy the dialog if a button was clicked and call the callback.
            if (clickedOn > -1) {
                vastengine.Game.setDialog(undefined);
                this.doCallback(clickedOn);
            }
        },

        /**
         * Calls the Dialog's callback with the given input.
         * @param {number} Integer selection.
         */
        doCallback: function (input) {
            if (this.callback) {
                this.callback(input);
            }
        },

        /**
         * Draw the dialog box and its components.
         */
        draw: function () {
            if (this.visible) {
                var context = vastengine.Canvas.getDrawingContext();
                context.save();
                this.scale.update();

                // background shadow
                context.fillStyle = '#000';
                context.globalAlpha = 0.5;
                context.fillRect(0, 0, vastengine.Canvas.getCanvasWidth(), vastengine.Canvas.getCanvasHeight());

                // dialog background
                context.globalAlpha = 1;
                context.shadowBlur = 20;
                context.shadowColor = "black";
                context.fillStyle = '#FFF';
                context.fillRect(this.x + ((this.width - this.width * this.scale.get()) / 2), this.y + ((this.height - this.height * this.scale.get()) / 2), this.width * this.scale.get(), this.height * this.scale.get());
                context.shadowBlur = 0;

                // draw text and buttons only when animation is finished.
                if (this.scale.get() === 1) {
                    // text
                    context.textBaseline = 'top';
                    context.fillStyle = '#000';
                    context.font = this.textFont;

                    for (var i = 0; i < this.textLines.length; i++) {
                        context.fillText(this.textLines[i], this.x + this.textPadding, this.y + i * this.lineSpacing);
                    }
                    // buttons
                    context.font = (this.buttonHeight / 2) + 'pt Calibri';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    for (var n = 0; n < this.buttons.length; n++) {
                        context.fillText(this.buttons[n].text, this.buttons[n].x + (this.buttons[n].w / 2), this.buttons[n].y + (this.buttons[n].h / 2));
                    }
                }

                // reset context styles
                context.restore();
            }
        }
    };
})();