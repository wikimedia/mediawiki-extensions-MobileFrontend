var headless = typeof window !== 'object';

module.exports = {
	/**
	 * @param {sinon.SinonSandbox} sandbox
	 * @param {NodeJS.Global} global
	 * @return {void}
	 */
	setUp: function ( sandbox, global ) {
		if ( headless ) {
			global.OO = global.OO || undefined;
			sandbox.stub( global, 'OO', require( 'oojs' ) );
		}
	}
};
