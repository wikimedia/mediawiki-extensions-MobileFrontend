let page, pageHTMLParser, referencesGateway,
	sandbox, Page, PageHTMLParser, ReferencesHtmlScraperGateway;
const
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
		Page = require( '../../../../src/mobile.startup/Page' );
		PageHTMLParser = require( '../../../../src/mobile.startup/PageHTMLParser' );
		ReferencesHtmlScraperGateway = require( './../../../../src/mobile.startup/references/ReferencesHtmlScraperGateway' );
		page = new Page( {
			title: 'Reftest'
		} );
		pageHTMLParser = new PageHTMLParser(
			util.parseHTML( '<div>' ).html( referencesPage )
		);
		referencesGateway = new ReferencesHtmlScraperGateway( new mw.Api() );
		global.mw.util.percentDecodeFragment = function ( decoded ) {
			// We're not testing percentDecodeFragment here, so only test with decoded values
			return decoded;
		};
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'getReference() checking good reference', ( assert ) => referencesGateway.getReference( '#cite_note-1', page, pageHTMLParser ).then( ( ref ) => {
	assert.strictEqual( ref.text, 'hello' );
} ) );

QUnit.test( 'getReference() checking bad reference', ( assert ) => referencesGateway.getReference( '#cite_note-bad', page, pageHTMLParser ).catch( ( err ) => {
	assert.strictEqual( err, ReferencesGateway.ERROR_NOT_EXIST, 'When bad id given false returned.' );
} ) );

QUnit.test( 'getReference() adds an extra class for external links', ( assert ) => referencesGateway.getReference( '#cite_note-2', page, pageHTMLParser ).then( ( ref ) => {
	assert.notStrictEqual( ref.text.indexOf( referencesGateway.EXTERNAL_LINK_CLASS ), -1 );
} ) );
