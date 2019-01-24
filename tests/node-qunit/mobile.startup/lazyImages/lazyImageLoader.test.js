var
	jQuery = require( '../../utils/jQuery' ),
	dom = require( '../../utils/dom' ),
	lazyImageLoader = require( '../../../../src/mobile.startup/lazyImages/lazyImageLoader' ),
	mediaWiki = require( '../../utils/mw' ),
	sinon = require( 'sinon' ),
	sandbox;

QUnit.module( 'MobileFrontend lazyImageLoader.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global ); // Needed for Deferreds.
		mediaWiki.setUp( sandbox, global ); // util.Deferred() uses mw.log().
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
}, function () {
	QUnit.test( '#queryPlaceholders() empty', function ( assert ) {
		var
			root = document.createElement( 'div' ),
			actual = lazyImageLoader.queryPlaceholders( root );
		assert.propEqual( actual, [], 'The result is empty.' );
	} );

	QUnit.test( '#queryPlaceholders() nonempty', function ( assert ) {
		var
			root = document.createElement( 'div' ),
			placeholder = document.createElement( 'div' ),
			actual;
		placeholder.className = lazyImageLoader.test.placeholderClass;
		root.appendChild( placeholder );

		actual = lazyImageLoader.queryPlaceholders( root );
		assert.propEqual( actual, [ placeholder ], 'The result is nonempty.' );
	} );

	QUnit.test( '#loadImage() copy attributes', function ( assert ) {
		var
			attrs = {
				width: '1',
				height: '2',
				class: 'class',
				alt: 'alt',
				src: '/src',
				srcset: '/srcset'
			},
			placeholder = document.createElement( 'div' ),
			result;
		// Placeholder className is not copied (class), style (not data-style) is.
		placeholder.className = lazyImageLoader.test.placeholderClass;
		placeholder.style.width = '3px';
		Object.keys( attrs ).forEach( function ( name ) {
			placeholder.setAttribute( 'data-' + name, attrs[name] );
		} );

		result = lazyImageLoader.loadImage( placeholder );

		Object.keys( attrs ).forEach( function ( name ) {
			assert.strictEqual( result.image.getAttribute( name ), attrs[name], name + ' is set.' );
		} );
		assert.strictEqual( result.image.style.width, '3px', 'Style from placeholder is set.' );
	} );

	QUnit.test( '#loadImage() loaded', function ( assert ) {
		var
			placeholder = document.createElement( 'div' ),
			result;

		result = lazyImageLoader.loadImage( placeholder );
		result.image.dispatchEvent( new Event( 'load' ) );
		return result.promise.then( function ( status ) {
			assert.strictEqual( status, 'load', 'Promise resolves on load.' );
		} );
	} );

	QUnit.test( '#loadImage() load error', function ( assert ) {
		var
			placeholder = document.createElement( 'div' ),
			result;

		result = lazyImageLoader.loadImage( placeholder );
		result.image.dispatchEvent( new Event( 'error' ) );
		return result.promise.then( function ( status ) {
			assert.strictEqual( status, 'error', 'Promise resolves even on error.' );
		} );
	} );

	QUnit.test( '#loadImages() empty', function ( assert ) {
		return lazyImageLoader.loadImages( [] ).then( function () {
			assert.ok( true, 'Promise resolves.' );
		} );
	} );

	QUnit.test( '#loadImages() nonempty', function ( assert ) {
		var
			placeholder = document.createElement( 'div' ),
			image = new Image(),
			deferred;

		sandbox.stub( global, 'Image' ).returns( image );
		deferred = lazyImageLoader.loadImages( [ placeholder ] ).then( function () {
			assert.ok( true, 'Promise resolves.' );
		} );
		image.dispatchEvent( new Event( 'load' ) );

		return deferred;
	} );

	QUnit.test( '#loadImages() plural', function ( assert ) {
		var
			placeholder = document.createElement( 'div' ),
			image = new Image(),
			deferred;

		sandbox.stub( global, 'Image' ).returns( image );
		deferred = lazyImageLoader.loadImages( [ placeholder, placeholder ] ).then(
			function () { assert.ok( true, 'Promise resolves.' ); }
		);
		image.dispatchEvent( new Event( 'load' ) );

		return deferred;
	} );

	QUnit.test( '#loadImages() one fails to load, one succeeds', function ( assert ) {
		var
			placeholder = document.createElement( 'div' ),
			failureImage = new Image(),
			successImage = new Image(),
			deferred;

		sandbox
			.stub( global, 'Image' )
			.onFirstCall().returns( failureImage )
			.onSecondCall().returns( successImage );
		deferred = lazyImageLoader.loadImages( [ placeholder, placeholder ] ).then(
			function () { assert.ok( true, 'Promise resolves.' ); }
		);
		failureImage.dispatchEvent( new Event( 'error' ) );
		successImage.dispatchEvent( new Event( 'load' ) );

		return deferred;
	} );

} );
