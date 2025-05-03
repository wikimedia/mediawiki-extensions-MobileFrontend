const
	jQuery = require( '../../utils/jQuery' ),
	dom = require( '../../utils/dom' ),
	lazyImageLoader = require( '../../../../src/mobile.startup/lazyImages/lazyImageLoader' ),
	mediaWiki = require( '../../utils/mw' ),
	sinon = require( 'sinon' );
let
	sandbox;

QUnit.module( 'MobileFrontend lazyImageLoader.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global ); // Needed for Deferreds.
		mediaWiki.setUp( sandbox, global ); // util.Deferred() uses mw.log().
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
}, () => {
	QUnit.test( '#queryPlaceholders() empty', ( assert ) => {
		const
			root = document.createElement( 'div' ),
			actual = lazyImageLoader.queryPlaceholders( root );
		assert.propEqual( actual, [], 'The result is empty.' );
	} );

	QUnit.test( '#queryPlaceholders() nonempty', ( assert ) => {
		const
			root = document.createElement( 'div' ),
			placeholder = document.createElement( 'div' );
		// eslint-disable-next-line mediawiki/class-doc
		placeholder.className = lazyImageLoader.test.placeholderClass;
		root.appendChild( placeholder );

		const actual = lazyImageLoader.queryPlaceholders( root );
		assert.propEqual( actual, [ placeholder ], 'The result is nonempty.' );
	} );

	QUnit.test( '#loadImage() copy attributes', ( assert ) => {
		const
			attrs = {
				width: '1',
				height: '2',
				class: 'class',
				alt: 'alt',
				src: '/src',
				srcset: '/srcset',
				usemap: '#map'
			},
			placeholder = document.createElement( 'div' );
		// Placeholder className is not copied (class), style (not data-style) is.
		// eslint-disable-next-line mediawiki/class-doc
		placeholder.className = lazyImageLoader.test.placeholderClass;
		placeholder.style.width = '3px';
		Object.keys( attrs ).forEach( ( name ) => {
			const attrNamePrefix = [
				'src', 'srcset'
			].includes( name ) ? 'data-mw' : 'data';
			const attrName = `${ attrNamePrefix }-${ name }`;
			placeholder.setAttribute( attrName, attrs[name] );
		} );

		const result = lazyImageLoader.loadImage( placeholder );

		Object.keys( attrs ).forEach( ( name ) => {
			assert.strictEqual( result.image.getAttribute( name ), attrs[name], name + ' is set.' );
		} );
		assert.strictEqual( result.image.style.width, '3px', 'Style from placeholder is set.' );
	} );

	QUnit.test( '#loadImage() loaded', ( assert ) => {
		const
			placeholder = document.createElement( 'div' );

		const result = lazyImageLoader.loadImage( placeholder );
		result.image.dispatchEvent( new Event( 'load' ) );
		return result.promise.then( ( status ) => {
			assert.strictEqual( status, 'load', 'Promise resolves on load.' );
		} );
	} );

	QUnit.test( '#loadImage() load error', ( assert ) => {
		const
			placeholder = document.createElement( 'div' );

		const result = lazyImageLoader.loadImage( placeholder );
		result.image.dispatchEvent( new Event( 'error' ) );
		return result.promise.then( ( status ) => {
			assert.strictEqual( status, 'error', 'Promise resolves even on error.' );
		} );
	} );

	QUnit.test( '#loadImages() empty', ( assert ) => lazyImageLoader.loadImages( [] ).then( () => {
		assert.true( true, 'Promise resolves.' );
	} ) );

	QUnit.test( '#loadImages() nonempty', ( assert ) => {
		const
			placeholder = document.createElement( 'div' ),
			image = new Image();

		sandbox.stub( global, 'Image' ).returns( image );
		const deferred = lazyImageLoader.loadImages( [ placeholder ] ).then( () => {
			assert.true( true, 'Promise resolves.' );
		} );
		image.dispatchEvent( new Event( 'load' ) );

		return deferred;
	} );

	QUnit.test( '#loadImages() plural', ( assert ) => {
		const
			placeholder = document.createElement( 'div' ),
			image = new Image();

		sandbox.stub( global, 'Image' ).returns( image );
		const deferred = lazyImageLoader.loadImages( [ placeholder, placeholder ] ).then(
			() => {
				assert.true( true, 'Promise resolves.' );
			}
		);
		image.dispatchEvent( new Event( 'load' ) );

		return deferred;
	} );

	QUnit.test( '#loadImages() one fails to load, one succeeds', ( assert ) => {
		const
			placeholder = document.createElement( 'div' ),
			failureImage = new Image(),
			successImage = new Image();

		sandbox
			.stub( global, 'Image' )
			.onFirstCall().returns( failureImage )
			.onSecondCall().returns( successImage );
		const deferred = lazyImageLoader.loadImages( [ placeholder, placeholder ] ).then(
			() => {
				assert.true( true, 'Promise resolves.' );
			}
		);
		failureImage.dispatchEvent( new Event( 'error' ) );
		successImage.dispatchEvent( new Event( 'load' ) );

		return deferred;
	} );

} );
