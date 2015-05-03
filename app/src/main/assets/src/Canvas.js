/// <reference path="namespace.js" />

/**
 * Used for manipulating directly the main game canvas, i.e. drawing on it.
 * @class Canvas
 * @memberof Vastengine
 */
 vastengine.Canvas = (function () {
     var canvas, context, backgroundScrollFactor = 1, scaleFactor = 1,
         canvasId = 'vastCanvas', className = 'canvasStyle';

     return {
         visible: true,

         /** 
          * Build the HTML canvas and insert into the DOM.
          * @memberof! Vastengine.Canvas
          */
         buildCanvas: function () {
             canvas = document.createElement('canvas');
             canvas.id = canvasId;
             canvas.className = className;
             this.setVisible(false);

             // "wire up" mouse events to be handled by Input class.
             canvas.onmousedown = function (e) {
                 vastengine.Input.onTouch(e);
             };

             canvas.onmouseup = function (e) {
                 vastengine.Input.onTouchEnd(e);
             };

             context = canvas.getContext('2d');
             document.body.appendChild(canvas);
             this.updateCanvasSize();
         },

         /**
          * Set whether the canvas element is visible or not (Game will still run).
          * @memberof! Vastengine.Canvas
          * @param {bool} Whether to display the canvas element.
          */
         setVisible: function (isVisible) {
             this.visible = isVisible;
             canvas.style.display = isVisible ? 'block' : 'none';
         },

         /**
          * Updates the size of the canvas according to whether the game is fullscreen or not.
          * @memberof! Vastengine.Canvas
          */
         updateCanvasSize: function () {
             scaleFactor = vastengine.Config.scale;
             if (vastengine.Config.fullScreen) {
                 canvas.width = window.innerWidth;
                 canvas.height = window.innerHeight;
             } else {
                 canvas.width = vastengine.Config.canvasWidth * vastengine.Config.scale;
                 canvas.height = vastengine.Config.canvasHeight * vastengine.Config.scale;
             }
         },

         /**
          * Sets the background-color property of the game canvas.
          * @memberof! Vastengine.Canvas
          * @param {string} color CSS color value.
          */
         setBackgroundColor: function (color) {
             canvas.style.background = color;
         },
     
         /**
          * Sets the background-image property of the game canvas.
          * @memberof! Vastengine.Canvas
          * @param {string} url URL to image resource to use as background image.
          * @param {boolean} Whether to tile the background image or not.
          */
         setBackgroundImage: function (url, tiled) {
             canvas.style.backgroundImage = 'url(' + url + ')';
             if (!tiled) {
                 canvas.style.backgroundRepeat = 'no-repeat';
             }
         },
     
         /**
          * Sets the background-position property of the game canvas.
          * @memberof! Vastengine.Canvas
          * @param {number} x New X-offset from origin.
          * @param {number} y New Y-offset from origin.
          */
         setBackgroundPosition: function (x, y) {
             canvas.style.backgroundPosition = x + 'px ' + y + 'px';
         },
     
         /**
          * Sets the scroll factor (ratio) for the background image. A value of 0 results in a fixed background and a 
          * value of 1 results in the background scrolling proportionally to the active controller's view position.
          * @memberof! Vastengine.Canvas
          * @param {number} factor Scroll factor (ratio to active controller's view position).
          */
         setScrollFactor: function (factor) {
             backgroundScrollFactor = factor;
         },
     
         /**
          * Retrieves the width of the game canvas.
          * @memberof! Vastengine.Canvas
          * @return {number} Width of the game canvas.
          */
         getWidth: function () {
             return canvas.width;
         },
     
         /**
          * Retrieve the height of the game canvas.
          * @memberof! Vastengine.Canvas
          * @return {number} Height of the game canvas.
          */
         getHeight: function () {
             return canvas.height;
         },
     
         /**
          * Sets the width and height of the HTML canvas.
          * @memberof! Vastengine.Canvas
          * @param {number} w New width for the canvas.
          * @param {number} h New height for the canvas.
          */
         setSize: function (w, h) {
             canvas.width = w;
             canvas.height = h;
         },
     
         /**
          * Gets the scaling ratio of the canvas.
          * @memberof! Vastengine.Canvas
          */
         getScale: function () {
             return scaleFactor;
         },
     
         /**
          * Retrieve the horizontal position of the view.
          * @memberof! Vastengine.Canvas
          * @return {number} X-coordinate of the given Controller object's view property.
          */
         getViewRelativeX: function (controller) {
             if (controller.view !== undefined) {
                 return controller.view.x;
             } else {
                 return 0;
             }
         },
     
         /**
          * Retrieve the vertical position of the view.
          * @memberof! Vastengine.Canvas
          * @return {number} Y-coordinate of the given Controller object's view property.
          */
         getViewRelativeY: function (controller) {
             if (controller.view !== undefined) {
                 return controller.view.y;
             } else {
                 return 0;
             }
         },
     
         /**
          * Draw directly on the canvas, passing a delegate function to call with the Canvas's 2D drawing context.
          * @memberof! Vastengine.Canvas
          * @param {function} Delegate to call, passing the Canvas's 2D drawing context.
          */
         drawElement: function (func) {
             context.save();
             func(context);
             context.restore();
         },

         /**
          * Performs scaling and translation operations on the canvas element, then draws the active Controller and Debug objects.
          * @memberof! Vastengine.Canvas
          */
         draw: function () {
            var activeController, preCanvas,
                translateX = 0, translateY = 0, relativeX = 0, relativeY = 0;
             
            preCanvas = document.createElement('canvas');
            preCanvas.width = canvas.width > 0 ? canvas.width : 1;
            preCanvas.height = canvas.height > 0 ? canvas.height : 1;

            preContext = preCanvas.getContext('2d');

            // clear and save the drawing context, then scale.
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.save();
            preContext.scale(scaleFactor, scaleFactor);
     
            // translate context to account for scaling if scale mode is "from center"
            translateX = (canvas.width - (canvas.width / scaleFactor)) / 2;
            translateY = (canvas.height - (canvas.height / scaleFactor)) / 2;
            if (vastengine.Config.scaleCenter) {
                preContext.translate(-translateX, -translateY);
            }

            // relative (x,y) to the location of the controller's view.
            activeController = vastengine.Game.getActiveController();
            if (activeController) {
                relativeX = activeController.view.x;
                relativeY = activeController.view.y;
            }
     
            // adjust the background position according to the relative (x, y) of the view.
            this.setBackgroundPosition(-relativeX * backgroundScrollFactor, -relativeY * backgroundScrollFactor);

            if (activeController) {
                activeController.drawEntities(preContext);
                if (activeController.draw) {
                    activeController.draw();
                }
            }

            context.drawImage(preCanvas, 0, 0);
            context.restore();

            if (vastengine.Debug) {
                context.save();
                vastengine.Debug.draw(context);
                context.restore();
            }
         }
    };
 }());