var
	headless = typeof window !== 'object',
	newMockMediaWiki = require( './mockMediaWiki' );

module.exports = {
	/**
	 * @param {sinon.SinonSandbox} sandbox
	 * @param {NodeJS.Global} global
	 * @return {void}
	 */
	setUp: function ( sandbox, global ) {
		const mw = newMockMediaWiki();
		if ( headless ) {
			global.mw = mw || undefined;
			sandbox.stub( global, 'mw' ).callsFake( () => mw );
		}
	}
};
