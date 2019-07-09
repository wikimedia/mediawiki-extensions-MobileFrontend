var pageHTMLParser, referencesGateway,
	sandbox, PageHTMLParser, ReferencesHtmlScraperGateway,
	sinon = require( 'sinon' ),
	ReferencesGateway = require( './../../../../src/mobile.startup/references/ReferencesGateway' ),
	referencesPage = require( '../../utils/PageInputs.html' ).referencesPage,
	util = require( '../../../../src/mobile.startup/util' ),
	oo = require( '../../utils/oo' ),
	dom = require( '../../utils/dom' ),
	jQuery = require( '../../utils/jQuery' ),
	mediaWiki = require( '../../utils/mw' );

QUnit.module( 'MobileFrontend ReferencesHtmlScraperGateway.test.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		PageHTMLParser = require( '../../../../src/mobile.startup/PageHTMLParser' );
		ReferencesHtmlScraperGateway = require( './../../../../src/mobile.startup/references/ReferencesHtmlScraperGateway' );
		pageHTMLParser = new PageHTMLParser(
			util.parseHTML( '<div>' ).html( referencesPage )
		);
		referencesGateway = new ReferencesHtmlScraperGateway( new mw.Api() );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'getReference() checking good reference', function ( assert ) {
	return referencesGateway.getReference( '#cite_note-1', pageHTMLParser ).then( function ( ref ) {
		assert.strictEqual( util.parseHTML( '<div>' ).html( ref.text ).find( '.reference-text' ).text(), 'hello' );
	} );
} );

QUnit.test( 'getReference() checking bad reference', function ( assert ) {
	return referencesGateway.getReference( '#cite_note-bad', pageHTMLParser ).catch( function ( err ) {
		assert.strictEqual( err, ReferencesGateway.ERROR_NOT_EXIST, 'When bad id given false returned.' );
	} );
} );

QUnit.test( 'getReference() checking encoded reference', function ( assert ) {
	var id = '#cite_note-Obama_1995,_2004,_pp._9%E2%80%9310-11';
	return referencesGateway.getReference( id, pageHTMLParser ).then( function ( ref ) {
		assert.strictEqual( util.parseHTML( '<div>' ).html( ref.text ).find( '.reference-text' ).text(), 'found',
			'If an encoded ID parameter is given it still resolves correctly.' );
	} );
} );

QUnit.test( 'getReference() adds an extra class for external links', function ( assert ) {
	return referencesGateway.getReference( '#cite_note-2', pageHTMLParser ).then( function ( ref ) {
		assert.strictEqual( ref.text.includes( referencesGateway.EXTERNAL_LINK_CLASS ), true );
	} );
} );
