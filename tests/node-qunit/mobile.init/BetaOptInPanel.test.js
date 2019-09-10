let
	BetaOptInPanel,
	sandbox,
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	oo = require( '../utils/oo' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend mobile.init/BetaOptInPanel.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		BetaOptInPanel = require( '../../../src/mobile.init/BetaOptInPanel' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'renders correctly', function ( assert ) {
	const panel = new BetaOptInPanel( {} );

	assert.strictEqual( panel.$el.find( '.message .optin' ).length, 1, 'A opt in button is rendered' );
	assert.strictEqual( panel.$el.find( '.message .cancel' ).length, 1, 'A cancel button is rendered' );
} );
