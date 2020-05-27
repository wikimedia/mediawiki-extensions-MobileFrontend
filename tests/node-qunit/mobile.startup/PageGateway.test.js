const
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	mediawiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	jQuery = require( '../utils/jQuery' ),
	examples = require( './../utils/PageInputs.html' ),
	page = examples.page,
	page2 = examples.page2,
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
	const spy = sandbox.stub( this.api, 'get' ).returns( util.Deferred().reject() );
	// prevent rogue ajax request
	/* global $ */
	sandbox.stub( $, 'ajax' ).returns( util.Deferred().resolve() );
	pageGateway.getPageLanguages( 'Title', 'fr' );
	assert.ok(
		spy.calledWith( testData.getPageLanguagesCall.output )
	);
} );

QUnit.test( '#_getAPIResponseFromHTML', function ( assert ) {
	const resp = pageGateway._getAPIResponseFromHTML(
		util.parseHTML( page )
	);
	assert.propEqual( testData.getAPIResponseFromHTML.input, resp );
} );

QUnit.test( '#getSectionsFromHTML malformed (h2 before h1)', function ( assert ) {
	const resp = pageGateway.getSectionsFromHTML(
		util.parseHTML( page2 )
	);
	assert.propEqual( resp, [
		{
			line: 'A1',
			level: '2',
			anchor: '1.0',
			text: '<h3 id="">A2.1</h3>\n',
			subsections: [ {
				line: 'A2.1',
				level: '3',
				anchor: '',
				text: '',
				subsections: []
			} ]
		},
		{
			line: 'A2.2',
			level: '2',
			anchor: '',
			text: '',
			subsections: []
		},
		{
			line: 'A2',
			level: '1',
			anchor: '',
			text: '<h2 id="">A2.1</h2>\n',
			subsections: [ {
				line: 'A2.1',
				level: '2',
				anchor: '',
				text: '',
				subsections: []
			} ]
		}
	] );
} );
