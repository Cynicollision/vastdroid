/// <reference path="namespace.js" />

/**
 * Abstracts click and touch event handling, adjusting for scaling and type of event.
 * @class Input
 * @memberof Vastengine
 */
vastengine.Input = (function () {
    /**
     * Enumeration of touch input event types.
     */
        var InputEventType = {
            TOUCH_START: 0,
            TOUCH_END: 1
        };

    return {
        /**
         * Called at the beginning of a touch event.
         * @memberof! Vastengine.Input
         * @param {object} e Event object.
         */
        onTouch: function (e) {
            this.onTouchEvent(InputEventType.TOUCH_START, e.pageX, e.pageY);
        },

        /**
         * Called when a touch event ends (un-touch).
         * @memberof! Vastengine.Input
         * @param {object} e Event object.
         */
        onTouchEnd: function (e) {
            this.onTouchEvent(InputEventType.TOUCH_END, e.pageX, e.pageY);
        },

        /**
         * Call the correct onTouch or onTouchEnd method for the active Dialog or Controller object and any of its managed Entity objects.
         * @memberof! Vastengine.Input
         * @param {InputEventType} eventType Determines whether to call onTouch or onTouchEnd.
         * @param {number} actualX X-coordinate of the touch event after un-scaling.
         * @param {number} actualY Y-coordinate of the touch event after un-scaling.
        */
        onTouchEvent: function (eventType, actualX, actualY) {
            var ctrl, scale, translateX, translateY, clickX, clickY;

            // translate to account for scaling.
            scale = vastengine.Canvas.getScale();
            translateX = (window.innerWidth - (vastengine.Canvas.getWidth() / scale)) / 2;
            translateY = (window.innerHeight - (vastengine.Canvas.getHeight() / scale)) / 2;

            // adjust for scale
            clickX = (actualX / scale);
            clickY = (actualY / scale);

            if (vastengine.Config.scaleCenter) {
                clickX += translateX;
                clickY += translateY;
            }

            ctrl = vastengine.Game.getActiveController();
            if (ctrl) {
                // adjust for view's coordinates
                if (eventType === InputEventType.TOUCH_START && ctrl.onTouch) {
                    ctrl.onTouch(clickX + ctrl.view.x, clickY + ctrl.view.y);
                } else if (ctrl.onTouchEnd) {
                    ctrl.onTouchEnd(clickX + ctrl.view.x, clickY + ctrl.view.y);
                }
            }

            if (vastengine.Game.getState() === vastengine.GameState.RUNNING) {
                // call onTouch for each of the active Controller's Entity collection.
                var entities = ctrl.getEntities();
                for (var i = 0; i < entities.length; i++) {
                    var ent = entities[i];
                    if (ent.width > 0 && ent.height > 0) {
                        if ((clickX > ent.x) && (clickY > ent.y) && (clickX < ent.x + ent.width) && (clickY < ent.y + ent.height)) {
                            if (eventType === InputEventType.TOUCH_START && ent.onTouch) {
                                ent.onTouch(clickX, clickY);
                            } else if (ent.onTouchEnd) {
                                ent.onTouchEnd(clickX, clickY);
                            }
                        }
                    }
                }
            }
        }
    };
}());
