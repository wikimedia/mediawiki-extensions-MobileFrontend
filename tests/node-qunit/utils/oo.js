var
	headless = typeof window !== 'object',
	newMockOO = require( './mockOO' );

module.exports = {
	/**
	 * @param {sinon.SinonSandbox} sandbox
	 * @param {NodeJS.Global} global
	 * @return {void}
	 */
	setUp: function ( sandbox, global ) {
		if ( headless ) {
			global.OO = global.OO || undefined;
			sandbox.stub( global, 'OO', newMockOO() );
		}
	}
};
