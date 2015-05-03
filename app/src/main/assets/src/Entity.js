/// <reference path="namespace.js" />

/**
 * Represents one (usually visible) "thing" to exist in the game.
 * An Entity has an absolute position in the game, and properties for collision detection and motion.
 * @class Entity
 * @memberof Vastengine
 * @param {string=} type Use to group and retrieve similar Entity objects.
 * @param {number=} id  Use to reference this Entity by a unique ID value.
 */
vastengine.Entity = function (type, id) {
    this.type = type || '';
    this.id = id || 0;
    this.isDestroyed = false;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.depth = 0;
    this.speed = 0;
    this.direction = 0;
    this.onTouch = null;
    this.onTouchEnd = null;
    this.step = null;
    this.draw = null;
};

vastengine.Entity.prototype = {
    /** 
     * Determine if this Entity object's bounding area intersects with that of the given Entity object to compare to.
     * @memberof! Vastengine.Entity.prototype
     * @param {Entity} Other entity to check for a collision with.
     * @return {boolean} True if the other Entity object's bounding area intersects with this one's.
     */
    checkCollision: function (other) {
        return !((this.x + this.width < other.x + 1) || (other.x + other.width - 1 < this.x) || (this.y + this.height < other.y + 1) || (other.y + other.height - 1 < this.y));
    },

    /**
     * Determine if the given coordinates fall within the bounds of this Entity object.
     * @memberof! Vastengine.Entity.prototype
     * @param {number} onX X-coordinate to check.
     * @param {number} onY Y-coordinate to check.
     * @return Whether the given coordinates fall within the bounds of this Entity object.
     */
    onPosition: function (onX, onY) {
        return (onX > this.x && onY > this.y && onX < this.x + this.width && onY < this.y + this.height);
    },
    
    /**
     * Sets the Entity's absolute position.
     * @memberof! Vastengine.Entity.prototype
     * @param {number] x X position.
     * @param {number} y Y position.
     */
    setPosition: function (x, y) {
        this.x = x;
        this.y = y;
    },

    /**
     * Sets the width and height of the bounding box.
     * @memberof! Vastengine.Entity.prototype
     * @param {number} w Width
     * @param {number} h Height
     */
    setSize: function (w, h) {
        this.width = w;
        this.height = h;
    },

    /**
     * Sets the width and height of the bounding box to match that of its Sprite, if one is defined.
     * @memberof! Vastengine.Entity.prototype
     */
    setSizeFromSprite: function () {
        if (this.sprite) {
            this.width = this.sprite.width;
            this.height = this.sprite.height;
        }
    },

    /**
     * Destroy this Entity on the managing Controller's next step.
     * @memberof! Vastengine.Entity.prototype
     */
    destroy: function () {
        this.isDestroyed = true;
    },

    /**
     * Draws its Sprite, if one is defined.
     * @memberof! Vastengine.Entity.prototype
     * @param {object} context Drawing context to draw on.
     * @param {number} x Horizontal position relative to Controller's view.
     * @param {number} y Vertical position relative to Controller's view.
     */
    drawSprite: function (context, x, y) {
        if (this.sprite) {
            this.sprite.draw(context, x, y);
        }
    }
};
