var headless = typeof window !== 'object';

module.exports = {
	/**
	 * @param {sinon.SinonSandbox} sandbox
	 * @param {NodeJS.Global} global
	 * @return {void}
	 */
	setUp: function ( sandbox, global ) {
		var OO;
		if ( headless ) {
			OO = require( 'oojs' );
			OO.ui = {
				Element: {
					static: {
						getClosestScrollableContainer: function () {}
					}
				},
				Tool: function () {}
			};
			global.OO = OO || undefined;
			sandbox.stub( global, 'OO' ).callsFake( () => OO );
		}
	}
};
