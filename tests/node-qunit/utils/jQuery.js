var headless = typeof window !== 'object';

module.exports = {
	/**
	 * @param {sinon.SinonSandbox} sandbox
	 * @param {NodeJS.Global} global
	 * @return {void}
	 */
	setUp: function ( sandbox, global ) {
		if ( headless ) {
			global.$ = global.$ || undefined;
			sandbox.stub( global, '$', require( 'jquery' ) );
		}
	},
	tearDown: function () {
		if ( headless ) {
			// prevent jQuery from caching the global window object.
			delete require.cache[require.resolve( 'jquery' )];
		}
	}
};
