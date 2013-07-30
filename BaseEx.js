/*
 * Extended Javascript Inheritance
 * for supporting overridable getters and setters
 * By Lukas Klinzing
 *
 * Based on the great John Resigs Simple Base.js
 * --------------------------------
 * Base.js
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 *
 * --------------------------------
 * Replaced deprecated functions __defineGetter__, __defineSetter__, __lookupGetter__
 * with new ECMAScript standards (supporting all browsers + ie)
 * By Eray Hanoglu
 * MIT Licensed.
 */

// Inspired by base2 and Prototype
(function () {

    var root = this;

    var initializing = false,
        fnTest = /xyz/.test(function () {
            /**
             * This is a function where type checking is disabled.
             * @suppress {suspiciousCode}
             */
            xyz;
        }) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    var Class = function () {
    };

    // Create a new Class that inherits from this class
    Class.extend = function (prop) {

        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;


        // Johns nice _super thing; extended for supporting getters and setters
        // putted into a variable because it's used more than once.
        // extended this._super so that you don't need to pass in arguments. Usefull when you don't know what the _super method requests
        // if you know, you can pass them and _super will be called with the replaced one instead.
        var fnOverride = function (name, fn, superFn) {
            return function () {
                var tmp = this._super, self = this, args = arguments;

                // Add a new ._super() method that is the same method
                // but on the super-class
                this._super = function () {
                    if (superFn) return superFn.apply(self, (arguments.length > 0 ? arguments : args));
                    return null;
                };
                // The method only need to be bound temporarily, so we
                // remove it when we're done executing
                var ret = fn.apply(this, arguments);
                this._super = tmp;

                return ret;
            }
        };

        var override = function (name, fn, source, target) {
            var descriptor;
            if (typeof (fn) == "function" && typeof (source[name]) == "function" && fnTest.test(fn)) {
                target[name] = fnOverride(name, fn, source[name]);
            } else if (fn && (fn.get || fn.set)) {
                var obj1 = Object.getOwnPropertyDescriptor(source, name),
                    sGetter = (obj1 && obj1.get),
                    sSetter = (obj1 && obj1.set);

                descriptor = {configurable: true, enumerable: true};
                if (fn.get) descriptor.get = (sGetter && fnTest.test(fn.get) ? fnOverride(name, fn.get, sGetter) : fn.get);
                if (fn.set) descriptor.set = (sSetter && fnTest.test(fn.set) ? fnOverride(name, fn.set, sSetter) : fn.set);
                Object.defineProperty(target, name, descriptor);
            } else {
                if (target[name]) delete target[name];
                target[name] = fn;            }
        };

        //Setters and Getters must be copied from _super unless they are going to be overriden
        //seems like "prototype = new this" doesnt copy getters and setters to the new prototype
        //this one is inspired (borrowed) from John Resigs post on  "JavaScript Getters and Setters"
        //http://ejohn.org/blog/javascript-getters-and-setters/
        var name, obj1, obj2;
        for (name in _super) {

            if (_super.hasOwnProperty(name)) {
                obj1 = Object.getOwnPropertyDescriptor(_super, name);
                obj2 = Object.getOwnPropertyDescriptor(prop, name);
                var g = (obj1 && obj1.get),
                    s = (obj1 && obj1.set),
                    og = (obj2 && obj2.get),
                    os = (obj2 && obj2.set);

                if ((g && !og) || (s && !os)) {
                    var descriptor = {configurable: true, enumerable: true};
                    if (g) descriptor.get = g;
                    if (s) descriptor.set = s;
                    Object.defineProperty(prototype, name, descriptor);
                }
            }
        }

        // Copy the properties over onto the new prototype
        for (name in prop) {

            if (prop.hasOwnProperty(name)) {
                obj1 = Object.getOwnPropertyDescriptor(prop, name);
                var getter = obj1.get,
                    setter = obj1.set;
                var options = (getter || setter) ? { get: getter, set: setter} : prop[name];
                override(name, options, _super, prototype);
            }
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // Set the _super as static method if needed later
        Class.__super__ = _super;

        Class.override = function (name, fn) {
            override(name, fn, prototype, prototype);
        };

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };

    // Export Class for Node.js and other module implementations (require)
    // if in browser set reference to the root (mostly window)
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Class;
        }
        exports.Class = Class;
    } else {
        root['Class'] = Class;
    }

})();
