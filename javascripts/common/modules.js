mw.mobileFrontend = {
	_modules: {},

	/**
	 * @name M.isAlphaGroupMember
	 * @function
	 * @return {Boolean}
	 */
	isAlphaGroupMember: function() {
		return mw.config.get( 'wgMFMode' ) === 'alpha';
	},

	/**
	 * @name M.isBetaGroupMember
	 * @function
	 * @return {Boolean}
	 */
	isBetaGroupMember: function() {
		return mw.config.get( 'wgMFMode' ) === 'beta' || this.isAlphaGroupMember();
	},

	/**
	 * @name M.isApp
	 * @function
	 * @return {Boolean}
	 */
	isApp: function() {
		return mw.config.get( 'wgMFMode' ) === 'app';
	},

	/**
	 * @name M.assertMode
	 * @function
	 * @throws Error when a module is run out of its allowed modes
	 */
	assertMode: function( modes ) {
		var mode = mw.config.get( 'wgMFMode' );
		if ( modes.indexOf( mode ) === -1 ) {
			throw new Error( 'Attempt to run module outside declared environment mode ' + mode  );
		}
	},

	/**
	 * Require (import) a module previously defined using define().
	 *
	 * @name M.require
	 * @param {string} id Required module id.
	 * @return {Object} Required module, can be any JavaScript object.
	 */
	require: function( id ) {
		if ( !this._modules.hasOwnProperty( id ) ) {
			throw new Error( 'Module not found: ' + id );
		}
		return this._modules[ id ];
	},
	testMode: mw.config.get( 'wgCanonicalSpecialPageName' ) === 'JavaScriptTest',

	/**
	 * Define a module which can be later required (imported) using require().
	 *
	 * @name M.define
	 * @param {string} id Defined module id.
	 * @param {Object} obj Defined module body, can be any JavaScript object.
	 */
	define: function( id, obj ) {
		if ( this._modules.hasOwnProperty( id ) ) {
			throw new Error( 'Module already exists: ' + id );
		}
		this._modules[ id ] = obj;
		// FIXME: modules should not self initialise
		if ( obj.init && !this.testMode ) {
			obj.init();
		}
	}
};
