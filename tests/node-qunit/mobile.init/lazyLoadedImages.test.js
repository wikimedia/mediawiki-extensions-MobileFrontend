const sinon = require( 'sinon' );
const dom = require( '../utils/dom' );
const mediaWiki = require( '../utils/mw' );
let sandbox, lazyLoadedImages;

QUnit.module( 'MobileFrontend lazyLoadedImages', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		lazyLoadedImages = require( '../../../src/mobile.init/lazyLoadedImages' );
	},
	afterEach: function () {
		sandbox.restore();
	}
} );

QUnit.test( 'initNative', ( assert ) => {
	const spy = sandbox.spy();
	global.window.addEventListener = spy;
	lazyLoadedImages.test.initNative();
	assert.true( spy.calledOnce, 'the initNative method registers an event to the window object' );
} );
