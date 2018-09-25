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
		if ( headless ) {
			global.mw = global.mw || undefined;
			sandbox.stub( global, 'mw', newMockMediaWiki() );
		}
	}
};
