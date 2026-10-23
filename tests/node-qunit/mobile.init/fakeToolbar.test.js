/* global $ */
const
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	oo = require( '../utils/oo' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' );
let fakeToolbar, sandbox;

QUnit.module( 'MobileFrontend fakeToolbar.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();

		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		sandbox.stub( mw, 'hook' ).returns( { fire: sandbox.stub() } );

		fakeToolbar = require( '../../../resources/mobile.init/editor/fakeToolbar' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'fires mobileFrontend.fakeToolbar.ready with element references and options, and listeners can append further phrases', ( assert ) => {
	const $toolbar = fakeToolbar( { isSourceMode: true } );

	assert.strictEqual( mw.hook.calledWith( 'mobileFrontend.fakeToolbar.ready' ), true,
		'hook is fired with the right name' );

	const fireStub = mw.hook.returnValues[ 0 ].fire;
	assert.strictEqual( fireStub.calledOnce, true, 'fire is called once' );

	const [ data ] = fireStub.firstCall.args;
	assert.strictEqual( data.$fakeToolbar.is( $toolbar ), true,
		'$fakeToolbar is the fake toolbar element returned by the function' );
	assert.strictEqual( data.$loadingMessage.hasClass( 've-mobile-fakeToolbar-loading' ), true,
		'$loadingMessage is the spinner + label element' );
	assert.strictEqual( data.$goBack.hasClass( 'cancel' ), true,
		'$goBack is the go-back button element' );
	assert.strictEqual( data.isSourceMode, true,
		'isSourceMode carries the passed-in option' );

	data.$loadingMessage.find( '.ve-mobile-fakeToolbar-loading-label' ).append(
		$( '<span>' )
			.addClass( 've-mobile-fakeToolbar-loading-label-text' )
			.text( 'Looking for suggestions…' )
	);
	assert.strictEqual( $toolbar.find( '.ve-mobile-fakeToolbar-loading-label-text' ).length, 2,
		'a listener can append further phrases via $loadingMessage' );
} );
