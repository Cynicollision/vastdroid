/// <reference path="namespace.js" />

/**
 * Manages a collection of Entity objects and adjusts the visible view area.
 * @class Controller
 * @memberof Vastengine
 */
vastengine.Controller = function () {
    this.entities = [];
    this.view = { x: 0, y: 0 };

    this.preStep = null;
    this.postStep = null;
    this.onTouch = null;
    this.onTouchEnd = null;
    this.draw = null;
};

vastengine.Controller.prototype = {

    /**
     * Sets the view position to the given coordinates.
     * @memberof! Vastengine.Controller.prototype
     * @param {number} x New X-coordinate for the view position (horizontal offset).
     * @param {number} y New Y-coordinate for the view position (vertical offset)
     */
    setViewPosition: function (x, y) {
        this.view.x = x;
        this.view.y = y;
    },

    /** 
     * Called by the controller continuously while the game loop is running. Calls all managed entities' own step() functions, then its own postStep() function.
     * @memberof! Vastengine.Controller.prototype
     */
    step: function () {
        this.removeDestroyedEntities();

        if (this.preStep) {
            this.preStep();
        }

        for (var i = 0; i < this.entities.length; i++) {
            // apply Entity motion
            if (this.entities[i].speed !== 0) {
                this.entities[i].x += Math.round((vastengine.MathUtil.getLengthDirectionX(this.entities[i].speed, this.entities[i].direction) / 10));
                this.entities[i].y += Math.round((vastengine.MathUtil.getLengthDirectionY(this.entities[i].speed, this.entities[i].direction) / 10));
            }

            if (this.entities[i].step) {
                this.entities[i].step(this.entities[i]);
            }
        }

        if (this.postStep) {
            this.postStep();
        }
    },


    /**
     * Adds an Entity object to the collection of entities managed by this controller.
     * @memberof! Vastengine.Controller.prototype
     * @param {object} newEnt Entity object to add to the Controller.
     */
    addEntity: function (newEnt) {
        this.entities.push(newEnt);
    },

    /**
     * Retrieve the collection of entities managed by this controller.
     * @memberof! Vastengine.Controller.prototype
     * @return {Array.<Entity>} 
     */
    getEntities: function () {
        return this.entities;
    },

    /** 
     * Returns a single managed Entity with the given ID value if it exists (ID values are not enforced to be unique).
     * @memberof! Vastengine.Controller.prototype
     * @return {Entity} The Entity with the given id value, if one exists within the managed collection.
     */
    getEntityById: function (id) {
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].id === id) {
                return this.entities[i];
            }
        }
    },

    /**
     * Retrieves all managed entities with the given type.
     * @memberof! Vastengine.Controller.prototype
     * @param {string} type Find Entity objects with type property that matches.
     * @return {Array.<Entity>} Array of Entities with the given type.
     */
    getEntitiesByType: function (type) {
        var hits = [];
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].type === type) {
                hits.push(this.entities[i]);
            }
        }
        return hits;
    },

    /**
     * Retrieve all Entity objects at the given position.
     * @memberof! Vastengine.Controller.prototype
     * @param {number} x X-coordinate to check.
     * @param {number} y Y-coordinate to check.
     * @param {string=} type Optional type to check/filter for. If specified, only Entity objects with this type will be returned.
     * @return {Array.<Entity>} Cllection of Entity objects for which (x, y) falls within its width and height bounds.
     */
    getEntitiesAtPosition: function (x, y, type) {
        var hits = [];
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].onPosition(x, y)) {
                if (!type || this.entities[i].type === type) {
                    hits.push(this.entities[i]);
                }
            }
        }
        return hits;
    },

    /**
     * Determines if the given position is free of all managed Entity objects. If the given (x, y) falls within the (x, y) and (x+w, y+h) of any Entity objects this will return false.
     * @memberof! Vastengine.Controller.prototype
     * @param {number} x X-coordinate to check.
     * @param {number} y Y-coordinate to check.
     * @param {string=} type Optional type to check/filter for. If specified, only check for Entity objects with this type.
     */
    isPositionFree: function (x, y, type) {
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].onPosition(x, y)) {
                if (!type || type === this.entities[i].type) {
                    return false;
                }
            }
        }
        return true;
    },

    /**
     * Sorts managed entities in descending order by depth.
     * @memberof! Vastengine.Controller.prototype
     */
    sortEntitiesByDepth: function () {
        this.entities.sort(function (a, b) {
            return -(a.depth - b.depth);
        });
    },

    /** 
     * Removes all managed Entity object where property isDestroyed is true.
     * @memberof! Vastengine.Controller.prototype
     */
    removeDestroyedEntities: function () {
        if (this.entities !== undefined && this.entities.length > 0) {
            this.entities = this.entities.filter(function (entity) {
                return (!entity || !entity.isDestroyed);
            });
        }
    },

    /**
     * Draw each Entity (sorted in reverse order by depth) at their positions relative to the view.
     * If the Entity has a Sprite object, draw that first.
     * @memberof! Vastengine.Controller.prototype
     * @param {object} context The drawing context to draw on.
     */
    drawEntities: function (context) {
        var relativeX, relativeY;

        this.sortEntitiesByDepth();

        for (var i = 0; i < this.entities.length; i++) {
            if (!this.entities[i].isDestroyed) {
                relativeX = this.entities[i].x - this.view.x;
                relativeY = this.entities[i].y - this.view.y;

                this.entities[i].drawSprite(context, relativeX, relativeY);
                if (this.entities[i].draw) {
                    this.entities[i].draw(context, relativeX, relativeY);
                }
            }
        }
    }
};
