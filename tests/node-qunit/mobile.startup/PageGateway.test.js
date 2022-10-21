const
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	mediawiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	jQuery = require( '../utils/jQuery' ),
	testData = require( '../utils/PageGateway.responses' );
let
	util,
	PageGateway,
	pageGateway,
	sandbox;

QUnit.module( 'MobileFrontend PageGateway', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediawiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		util = require( '../../../src/mobile.startup/util' );
		PageGateway = require( '../../../src/mobile.startup/PageGateway' );
		this.api = new mw.Api();
		pageGateway = new PageGateway( this.api );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#getPageLanguages (response)', function ( assert ) {
	sandbox.stub( mw.config, 'get' )
		.withArgs( 'wgVariantArticlePath' ).returns( '/$2/$1' )
		.withArgs( 'wgContentLanguage' ).returns( 'sr' )
		.withArgs( 'wgPageContentLanguage' ).returns( 'sr-ec' );
	sandbox.stub( this.api, 'get' ).returns( util.Deferred().resolve( testData.getPageLanguagesResponse.input ) );

	return pageGateway.getPageLanguages( 'Test' ).then( function ( resp ) {
		assert.propEqual( resp.languages,
			testData.getPageLanguagesResponse.output.languages,
			'return augmented language links' );

		assert.propEqual( resp.variants,
			testData.getPageLanguagesResponse.output.variants,
			'return augmented language variant links' );
	} );
} );

QUnit.test( '#getPageLanguages (call)', function ( assert ) {
	sandbox.stub( mw.config, 'get' ).withArgs( 'wgPageContentLanguage' ).returns( 'fr' );
	const spy = sandbox.stub( this.api, 'get' ).returns( util.Deferred().reject() );
	// prevent rogue ajax request
	/* global $ */
	sandbox.stub( $, 'ajax' ).returns( util.Deferred().resolve() );
	pageGateway.getPageLanguages( 'Title', 'fr' );
	assert.true(
		spy.calledWith( testData.getPageLanguagesCall.output )
	);
} );
