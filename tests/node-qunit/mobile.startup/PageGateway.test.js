/* global $ */
var
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	mediawiki = require( '../utils/mw' ),
	jQuery = require( '../utils/jQuery' ),
	testData = require( '../utils/PageGateway.responses' ),
	PageGateway,
	pageGateway,
	sandbox;

QUnit.module( 'MobileFrontend PageGateway', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediawiki.setUp( sandbox, global );
		PageGateway = require( '../../../src/mobile.startup/PageGateway' );
		this.api = new mw.Api();
		pageGateway = new PageGateway( this.api );
	},
	afterEach: function () { sandbox.restore(); }
} );

QUnit.test( '#getPage (h1s)', function ( assert ) {

	sandbox.stub( this.api, 'get' ).returns( $.Deferred().resolve( testData.getPageHeadings.input ) );
	pageGateway.invalidatePage( 'Test' );

	sandbox.stub( mw.util, 'getUrl' ).returns( 'Test:History' );

	return pageGateway.getPage( 'Test' ).then( function ( resp ) {
		assert.propEqual( resp, testData.getPageHeadings.output, 'return lead and sections test 1' );
	} );
} );

QUnit.test( '#getPage', function ( assert ) {
	var api = sandbox.stub( this.api, 'get' ).returns( $.Deferred().resolve( testData.getPage.input ) );

	sandbox.stub( mw.util, 'getUrl' ).returns( 'Test:History' );

	pageGateway.invalidatePage( 'Test' );
	return pageGateway.getPage( 'Test' ).then( function ( resp ) {
		assert.deepEqual( resp, testData.getPage.output, 'return lead and sections test 2' );

		return pageGateway.getPage( 'Test' );
	} ).then( function () {
		assert.strictEqual( api.callCount, 1, 'cache page' );
	} );
} );

QUnit.test( '#getPageLanguages (response)', function ( assert ) {
	sandbox.stub( this.api, 'get' ).returns( $.Deferred().resolve( testData.getPageLanguagesResponse.input ) );

	return pageGateway.getPageLanguages( 'Test' ).then( function ( resp ) {
		assert.deepEqual( resp.languages,
			testData.getPageLanguagesResponse.output.languages,
			'return augmented language links' );

		assert.deepEqual( resp.variants,
			testData.getPageLanguagesResponse.output.variants,
			'return augmented language variant links' );
	} );
} );

QUnit.test( '#getPageLanguages (call)', function ( assert ) {
	var spy = sandbox.stub( this.api, 'get' ).returns( $.Deferred().reject() );
	// prevent rogue ajax request
	sandbox.stub( $, 'ajax' ).returns( $.Deferred().resolve() );
	pageGateway.getPageLanguages( 'Title', 'fr' );
	assert.ok(
		spy.calledWith( testData.getPageLanguagesCall.output )
	);
} );

QUnit.test( '#_getAPIResponseFromHTML', function ( assert ) {
	var resp = pageGateway._getAPIResponseFromHTML(
		$( mw.template.get( 'tests.mobilefrontend', 'page.html' ).render() )
	);
	assert.deepEqual( testData.getAPIResponseFromHTML.input, resp );
} );

QUnit.test( '#getSectionsFromHTML malformed (h2 before h1)', function ( assert ) {
	var resp = pageGateway.getSectionsFromHTML(
		$( mw.template.get( 'tests.mobilefrontend', 'page2.html' ).render() )
	);
	assert.propEqual( resp, [
		{
			line: 'A1',
			level: '2',
			anchor: '1.0',
			text: '<h3 id="">A2.1</h3>\n\n',
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
			text: '<h2 id="">A2.1</h2>\n\n',
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

QUnit.test( '#getPage (forwards api errors)', function ( assert ) {
	sandbox.stub( this.api, 'get' ).returns( $.Deferred().reject( 'missingtitle' ) );
	return pageGateway.getPage( 'Err' ).catch( function ( msg ) {
		assert.strictEqual( msg, 'missingtitle' );
	} );
} );

QUnit.test( '#getPage (move protected page)', function ( assert ) {
	var expected = {
		edit: [ '*' ],
		move: [ 'sysop' ]
	};
	sandbox.stub( this.api, 'get' ).returns( $.Deferred().resolve( {
		mobileview: {
			id: -1,
			displaytitle: 'Test',
			revId: 42,
			lastmodifiedby: {
				name: 'bob',
				gender: 'unknown'
			},
			protection: {
				move: [ 'sysop' ]
			},
			lastmodified: '2013-10-28T18:49:56Z',
			languagecount: 10,
			sections: [
				{
					id: 0,
					text: ''
				}
			]
		}
	} ) );

	pageGateway.invalidatePage( 'Test' );
	return pageGateway.getPage( 'Test' ).then( function ( resp ) {
		assert.deepEqual( resp.protection, expected );
	} );
} );
