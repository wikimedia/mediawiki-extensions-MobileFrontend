/**
 * Class for managing modules
 *
 * A module in this context is essentially a Javascript class (not to be confused with
 * ResourceLoader modules).
 *
 * @class ModuleLoader
 */
function ModuleLoader() {
	/**
	 * @property {Object} register of defined modules
	 * @private
	 */
	this._register = {};
}

ModuleLoader.prototype = {
	/**
	 * Require (import) a module previously defined using define().
	 * Searches core module registry using mw.loader.require before consulting
	 * its own local registry. This method is deprecated, please do not use.
	 *
	 * @memberof ModuleLoader
	 * @instance
	 * @param {string} id Required module id.
	 * @return {Object} Required module, can be any JavaScript object.
	 */
	require: function ( id ) {
		var module, args,
			registry = this._register;

		/**
		 * @return {Object} Module
		 */
		function localRequire() {
			if ( !Object.hasOwnProperty.call( registry, id ) ) {
				throw new Error( 'MobileFrontend Module not found: ' + id );
			}
			return registry[ id ];
		}
		args = id.split( '/' );
		try {
			module = mw.loader.require( args[0] );
			if ( module[ args[1] ] ) {
				return module[ args[1] ];
			} else {
				return localRequire();
			}
		} catch ( e ) {
			return localRequire();
		}
	},

	/**
	 * Define a module which can be later required (imported) using require().
	 *
	 * @memberof ModuleLoader
	 * @instance
	 * @param {string} id Defined module id.
	 * @param {Object} obj Defined module body, can be any JavaScript object.
	 * @return {Object}
	 */
	define: function ( id, obj ) {
		var self = this;

		if ( Object.hasOwnProperty.call( this._register, id ) ) {
			throw new Error( 'Module already exists: ' + id );
		}
		this._register[ id ] = obj;
		// return an object of additionally functions to do with the registered module
		return {
			/**
			 * @see ModuleLoader#deprecate
			 * @param {string} deprecatedId Defined module id, which is deprecated.
			 * @ignore
			 */
			deprecate: function ( deprecatedId ) {
				self.deprecate( deprecatedId, obj, id );
			}
		};
	},

	/**
	 * Deprecate a module and give an replacement (if there is any).
	 *
	 * @memberof ModuleLoader
	 * @instance
	 * @param {string} id Defined module id, which is deprecated.
	 * @param {Object} obj Defined module body, can be any JavaScript object.
	 * @param {string} [replacement] Give an optional replacement for this module (which
	 * needs to be already defined!)
	 */
	deprecate: function ( id, obj, replacement ) {
		var msg;
		if ( replacement ) {
			// add an alternative for this module, if any given
			msg = 'Use ' + replacement + ' instead.';
		}
		// register it as a deprecated one
		mw.log.deprecate( this._register, id, obj, msg );
	}
};

module.exports = ModuleLoader;
