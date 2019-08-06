var
	headless = typeof window !== 'object',
	jsdom = headless && require( 'jsdom' );

module.exports = {
	/**
	 * @param {sinon.SinonSandbox} sandbox
	 * @param {NodeJS.Global} global
	 * @return {void}
	 */
	setUp: function ( sandbox, global ) {
		if ( headless ) {
			const window = new jsdom.JSDOM().window,
				document = window.document;

			global.window = window || undefined;
			global.document = document || undefined;
			sandbox.stub( global, 'window' ).callsFake( () => window );
			sandbox.stub( global, 'document' ).callsFake( () => document );
			global.Image = global.window.Image;
			global.Event = global.window.Event;
			global.navigator = global.window.navigator;
		}
	}
};
