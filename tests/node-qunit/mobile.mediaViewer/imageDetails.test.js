let
	sandbox,
	imageDetails,
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	jQuery = require( '../utils/jQuery' ),
	oo = require( '../utils/oo' );

QUnit.module( 'MobileFrontend imageDetails.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		imageDetails = require( '../../../src/mobile.mediaViewer/imageDetails' );

	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'with defaults, only renders parent element with class', function ( assert ) {
	const view = imageDetails( {} );

	assert.strictEqual( view.$el.hasClass( 'image-details' ), true, 'default class is present' );
	assert.strictEqual( view.$el.children().length, 0, 'does not render children by default' );
} );

QUnit.test( 'when additionalClassNames is a string, renders additional class', function ( assert ) {
	const view = imageDetails( { additionalClassNames: 'foo' } );

	assert.strictEqual( view.$el.hasClass( 'image-details' ), true, 'default class is still present' );
	assert.strictEqual( view.$el.hasClass( 'foo' ), true, '.foo is added to parent element' );
} );

QUnit.test( 'when detailsLink present, renders details button', function ( assert ) {
	const view = imageDetails( { detailsLink: { href: 'foo' } } );

	assert.strictEqual( view.$el.find( 'a.button' ).length, 1, 'details button rendered' );
	assert.strictEqual( view.$el.find( 'a.button' ).attr( 'href' ), 'foo', 'details button rendered with correct link' );
} );

QUnit.test( 'when licenseLink present, renders licenseLink', function ( assert ) {
	const view = imageDetails( { licenseLink: { text: 'bar',
		href: 'foo' } } );

	assert.strictEqual( view.$el.find( '.license a' ).text(), 'bar', 'license link text rendered' );
	assert.strictEqual( view.$el.find( '.license a' ).attr( 'href' ), 'foo', 'license link href rendered' );
} );

QUnit.test( 'when author present, renders author', function ( assert ) {
	const view = imageDetails( { author: 'foo' } );

	assert.strictEqual( view.$el.find( '.license' ).text().indexOf( 'foo ' ), 0, 'author rendered' );
} );

QUnit.test( 'when caption present, renders caption', function ( assert ) {
	const view = imageDetails( { caption: 'foo' } );

	assert.strictEqual( view.$el.find( '.truncated-text' ).text(), 'foo', 'caption rendered' );
} );
