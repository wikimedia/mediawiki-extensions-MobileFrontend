var headless = typeof window !== 'object';

module.exports = {
	/**
	 * @param {sinon.SinonSandbox} sandbox
	 * @param {NodeJS.Global} global
	 * @return {void}
	 */
	setUp: function ( sandbox, global ) {
		if ( headless ) {
			const Mustache = require( 'mustache' );
			global.Mustache = Mustache || undefined;
			sandbox.stub( global, 'Mustache' ).callsFake( () => Mustache );
		}
	}
};
