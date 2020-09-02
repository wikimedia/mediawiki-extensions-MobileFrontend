let sandbox, page, gateway, pageParser,
	references, Drawer, Page, PageHTMLParser;
const
	sinon = require( 'sinon' ),
	oo = require( '../../utils/oo' ),
	dom = require( '../../utils/dom' ),
	jQuery = require( '../../utils/jQuery' ),
	mediaWiki = require( '../../utils/mw' ),
	mustache = require( '../../utils/mustache' ),
	util = require( '../../../../src/mobile.startup/util' ),
	ReferencesGateway = require( '../../../../src/mobile.startup/references/ReferencesGateway' );

QUnit.module( 'MobileFrontend: references', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		Page = require( '../../../../src/mobile.startup/Page' );
		PageHTMLParser = require( '../../../../src/mobile.startup/PageHTMLParser' );
		Drawer = require( '../../../../src/mobile.startup/Drawer' );
		references = require( '../../../../src/mobile.startup/references/references.js' );
		gateway = {
			getReference: function () {}
		};
		pageParser = new PageHTMLParser( util.parseHTML( '<div>' ) );
		page = new Page( { title: 'reference test' } );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'Bad reference not shown', function ( assert ) {
	const promise = util.Deferred().reject( ReferencesGateway.ERROR_NOT_EXIST ).promise(),
		showSpy = sandbox.spy( Drawer.prototype, 'show' );

	sandbox.stub( gateway, 'getReference' ).returns( promise );
	references.showReference( '#cite_note-bad', page, '1', pageParser, gateway );

	return promise.catch( function () {
		assert.strictEqual( showSpy.callCount, 0, 'Show is not called.' );
	} );
} );

QUnit.test( 'Good reference causes render', function ( assert ) {
	const promise = util.Deferred().resolve( {
			text: 'I am a reference'
		} ).promise(),
		renderSpy = sandbox.spy( Drawer.prototype, 'render' ),
		done = assert.async();

	sandbox.stub( gateway, 'getReference' ).returns( promise );
	references.showReference( '#cite_note-good', page, '1', pageParser, gateway );

	return promise.then( function () {
		assert.strictEqual( renderSpy.callCount, 1, 'Render is called.' );
		done();
	} );
} );

QUnit.test( 'Reference failure renders error in drawer', function ( assert ) {
	const promise = util.Deferred().reject( ReferencesGateway.ERROR_OTHER ).promise(),
		renderSpy = sandbox.spy( Drawer.prototype, 'render' ),
		done = assert.async();

	sandbox.stub( gateway, 'getReference' ).returns( promise );
	references.showReference( '#cite_note-bad', page, '1', pageParser, gateway );

	return promise.catch( function () {
		assert.strictEqual( renderSpy.callCount, 1, 'Render is called.' );
		done();
	} );
} );

QUnit.test( 'makeOnNestedReferenceClickHandler runs when associated with link', function ( assert ) {
	const spy = sandbox.spy(),
		sup = document.createElement( 'sup' ),
		anchor = document.createElement( 'a' ),
		eventWithAnchor = {
			currentTarget: sup
		},
		eventWithDiv = {
			currentTarget: document.createElement( 'div' )
		},
		callback = references.test.makeOnNestedReferenceClickHandler( spy );

	sup.appendChild( anchor );
	anchor.setAttribute( 'href', 'https://wikipedia.org' );
	anchor.textContent = 'hello';
	callback( eventWithAnchor );
	assert.strictEqual( spy.calledOnce, true, 'The spy is called with a sup' );
	callback( eventWithDiv );
	assert.strictEqual( spy.calledOnce, true, 'The spy was not called with a div' );
} );
