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
			global.window = global.window || undefined;
			global.document = global.document || undefined;
			sandbox.stub( global, 'window', new jsdom.JSDOM().window );
			sandbox.stub( global, 'document', window.document );
			global.Image = global.window.Image;
			global.Event = global.window.Event;
		}
	}
};
