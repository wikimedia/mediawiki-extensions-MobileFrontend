mw.mobileFrontend = {
	_modules: {},

	/**
	 * Require (import) a module previously defined using define().
	 *
	 * @param {string} id Required module id.
	 * @return {Object} Required module, can be any JavaScript object.
	 */
	require: function( id ) {
		if ( !this._modules.hasOwnProperty( id ) ) {
			throw new Error( 'Module not found: ' + id );
		}
		return this._modules[ id ];
	},

	/**
	 * Define a module which can be later required (imported) using require().
	 *
	 * @param {string} id Defined module id.
	 * @param {Object} obj Defined module body, can be any JavaScript object.
	 */
	define: function( id, obj ) {
		if ( this._modules.hasOwnProperty( id ) ) {
			throw new Error( 'Module already exists: ' + id );
		}
		this._modules[ id ] = obj;
		// FIXME: modules should not self initialise
		if ( obj.init && mwMobileFrontendConfig.settings.initOnDefine !== false ) {
			obj.init();
		}
	}
};
