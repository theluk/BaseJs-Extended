/* 
 * Extended Javascript Inheritance
 * for supporting overridable getters and setters
 * By Lukas Klinzing  
 *
 * Based on the great John Resig's Simple Base.js
 * --------------------------------
 * Base.js
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 *  
*/
// Inspired by base2 and Prototype
(function() {
	
	var root = this;
	
	var initializing = false, fnTest = /xyz/.test(function() { xyz;
	}) ? /\b_super\b/ : /.*/;
	// The base Class implementation (does nothing)
	var Class = function() {
	};
	// Create a new Class that inherits from this class
	Class.extend = function(prop) {
		
		// I'm using underscore and use this one for mixing properties
		// actually I still have not used it
		if(arguments.length > 1) {
			var _ = require("lib/underscore");
			prop = _.extend.apply(this, arguments);
		}
		
		var _super = this.prototype, name;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;


		// John's nice _super thing; extended for supporting getters and setters
		// putted into a variable because it's used more than once.
		// extended this._super so that you don't need to pass in arguments. Usefull when you don't know what the _super method requests
		// if you know, you can pass them and _super will be called with the replaced one instead.
		var fnOverride = function(name, fn, setterFn, getterFn) {
			return function() {
				var tmp = this._super, self = this, args = arguments;

				// Add a new ._super() method that is the same method
				// but on the super-class
				this._super = function() {
					if (setterFn || getterFn) {
						return setterFn ? setterFn.apply(self, (arguments.length > 0 ? arguments : args)) : getterFn.apply(self, (arguments.length > 0 ? arguments : args));
					} else {
						return _super[name].apply(self, (arguments.length > 0 ? arguments : args));
					}
				}
				// The method only need to be bound temporarily, so we
				// remove it when we're done executing
				var ret = fn.apply(this, arguments);
				this._super = tmp;

				return ret;
			}
		}
		//Setters and Getters must be copied from _super unless they are going to be overriden
		//seems like "prototype = new this" doesnt copy getters and setters to the new prototype
		//this one is inspired (borrowed) from John Resig's post on  "JavaScript Getters and Setters"
		//http://ejohn.org/blog/javascript-getters-and-setters/
		for (var name in _super ) {
			var g = _super.__lookupGetter__(name), s = _super.__lookupSetter__(name), og = prop.__lookupGetter__(name), os = prop.__lookupSetter__(name);
			if ((g && !og) || (s && !os)) {
				if (g)
					prototype.__defineGetter__(name, g);
				if (s) 
					prototype.__defineSetter__(name, s);
			}
		} 
		// Copy the properties over onto the new prototype
		for(var name in prop) {
			
			var g = _super.__lookupGetter__(name), s = _super.__lookupSetter__(name), og = prop.__lookupGetter__(name), os = prop.__lookupSetter__(name);
			// os = current setter function
			// og = current getter function
			// s = _super setter function
			// g = _super getter function
			
			// if we have setters or getters in the current properties, pass them into the new prototype
			// if we have _super getters or setters make a override function using John's _super thing.
			// inspired by http://ejohn.org/blog/javascript-getters-and-setters/
			if (og || os) {
				if ( og )
					// If contains _super() create a override functions for getter, otherwise copy current getter into the current prototype
                	prototype.__defineGetter__(name, g && fnTest.test(og) ? fnOverride.call(this, name, og, null, g) : og);
	            if ( os )
	            	// If contains _super() create a override functions for setter, otherwise copy current setter into the current prototype
	                prototype.__defineSetter__(name, s && fnTest.test(os) ? fnOverride.call(this, name, os, s, null) : os);
			} else if (typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name])) {
				// John's function override method, if both current and super have functions with the same name and _super is called in current
				prototype[name] = fnOverride.call(this, name, prop[name], null, null);
			} else {
				prototype[name] = prop[name];
			}
			
		}

		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if(!initializing && this.init)
				this.init.apply(this, arguments);
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;

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
