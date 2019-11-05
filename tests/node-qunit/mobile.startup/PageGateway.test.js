var util,
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	mediawiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	jQuery = require( '../utils/jQuery' ),
	examples = require( './../utils/PageInputs.html' ),
	page = examples.page,
	page2 = examples.page2,
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

QUnit.test( '#getSections (has sections)', function ( assert ) {
	var gateway = new PageGateway();
	sandbox.stub( gateway, 'getPage' ).returns(
		util.Deferred().resolve( {
			sections: [ { line: '1' } ]
		} )
	);
	return gateway.getSections( gateway, 'Title' ).then( function ( sections ) {
		assert.strictEqual( sections.length, 1, '1 section is returned' );
	} );
} );

QUnit.test( '#getSections (missing titles)', function ( assert ) {
	var gateway = new PageGateway();
	sandbox.stub( gateway, 'getPage' ).returns(
		util.Deferred().reject( 'missingtitle' )
	);
	return gateway.getSections( gateway, 'Title' ).then( function ( sections ) {
		assert.strictEqual( sections.length, 0, '0 sections are returned' );
	} );
} );

QUnit.test( '#getSections (other failures)', function ( assert ) {
	var gateway = new PageGateway();
	sandbox.stub( gateway, 'getPage' ).returns(
		util.Deferred().reject()
	);
	assert.throws( gateway.getSections( gateway, 'Title' ), 'an exception is thrown' );
} );

QUnit.test( '#getPage (h1s)', function ( assert ) {

	sandbox.stub( this.api, 'get' ).returns( util.Deferred().resolve( testData.getPageHeadings.input ) );
	pageGateway.invalidatePage( 'Test' );

	sandbox.stub( mw.util, 'getUrl' ).returns( 'Test:History' );

	return pageGateway.getPage( 'Test' ).then( function ( resp ) {
		assert.propEqual( resp, testData.getPageHeadings.output, 'return lead and sections test 1' );
	} );
} );

QUnit.test( '#getPage', function ( assert ) {
	var api = sandbox.stub( this.api, 'get' ).returns( util.Deferred().resolve( testData.getPage.input ) );

	sandbox.stub( mw.util, 'getUrl' ).returns( 'Test:History' );

	pageGateway.invalidatePage( 'Test' );
	return pageGateway.getPage( 'Test' ).then( function ( resp ) {
		assert.propEqual( resp, testData.getPage.output, 'return lead and sections test 2' );

		return pageGateway.getPage( 'Test' );
	} ).then( function () {
		assert.strictEqual( api.callCount, 1, 'cache page' );
	} );
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
	var spy = sandbox.stub( this.api, 'get' ).returns( util.Deferred().reject() );
	// prevent rogue ajax request
	/* global $ */
	sandbox.stub( $, 'ajax' ).returns( util.Deferred().resolve() );
	pageGateway.getPageLanguages( 'Title', 'fr' );
	assert.ok(
		spy.calledWith( testData.getPageLanguagesCall.output )
	);
} );

QUnit.test( '#_getAPIResponseFromHTML', function ( assert ) {
	var resp = pageGateway._getAPIResponseFromHTML(
		util.parseHTML( page )
	);
	assert.propEqual( testData.getAPIResponseFromHTML.input, resp );
} );

QUnit.test( '#getSectionsFromHTML malformed (h2 before h1)', function ( assert ) {
	var resp = pageGateway.getSectionsFromHTML(
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

QUnit.test( '#getPage (forwards api errors)', function ( assert ) {
	sandbox.stub( this.api, 'get' ).returns( util.Deferred().reject( 'missingtitle' ) );
	return pageGateway.getPage( 'Err' ).catch( function ( msg ) {
		assert.strictEqual( msg, 'missingtitle' );
	} );
} );

QUnit.test( '#getPage (move protected page)', function ( assert ) {
	var expected = {
		edit: [ '*' ],
		move: [ 'sysop' ]
	};
	sandbox.stub( this.api, 'get' ).returns( util.Deferred().resolve( {
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
		assert.propEqual( resp.protection, expected );
	} );
} );
