var headless = typeof window !== 'object';

module.exports = {
	/**
	 * @param {sinon.SinonSandbox} sandbox
	 * @param {NodeJS.Global} global
	 * @return {void}
	 */
	setUp: function ( sandbox, global ) {
		if ( headless ) {
			global.Mustache = global.Mustache || undefined;
			sandbox.stub( global, 'Mustache', require( 'mustache' ) );
		}
	}
};
