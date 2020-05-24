const
	// Imports
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	mw = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );
let
	CtaDrawer,
	Anchor,
	Button,
	sandbox;

QUnit.module( 'MobileFrontend CtaDrawer.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();

		// Set up required by all Views.
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );

		// Additional CtaDrawer global dependency.
		mw.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		// Force consistent messaging between Special:JavaScriptTest and Node.js.
		sandbox.stub( global.mw, 'msg' ).callsFake( function ( id ) {
			switch ( id ) {
				case 'mobile-frontend-watchlist-cta-button-login': return 'Log in';
				case 'mobile-frontend-watchlist-cta-button-signup': return 'Sign up';
			}
			return id;
		} );
		sandbox.stub( global.mw.util, 'getUrl' ).callsFake( function ( pageName, params ) {
			return params.type ? 'signUp' : 'logIn';
		} );

		// Dynamically import Views to use fresh sandboxed dependencies.
		Anchor = require( '../../../src/mobile.startup/Anchor' );
		Button = require( '../../../src/mobile.startup/Button' );
		CtaDrawer = require( '../../../src/mobile.startup/CtaDrawer' );
	},

	afterEach: function () {
		CtaDrawer = undefined;
		Button = undefined;
		Anchor = undefined;

		jQuery.tearDown();

		sandbox.restore();
	}
}, function () {
	QUnit.module( 'redirectParams()', function () {
		QUnit.test( 'empty props, default URL', function ( assert ) {
			const subject = CtaDrawer.prototype.test.redirectParams;
			sandbox.stub( global.mw.config, 'get' ).callsFake( function () {
				return 'pageName';
			} );
			assert.propEqual( subject( {} ), { returnto: 'pageName' } );
		} );

		QUnit.test( 'empty props, nondefault URL', function ( assert ) {
			const subject = CtaDrawer.prototype.test.redirectParams;
			assert.propEqual( subject( {}, 'url' ), { returnto: 'url' } );
		} );

		QUnit.test( 'nonempty props', function ( assert ) {
			const subject = CtaDrawer.prototype.test.redirectParams;
			assert.propEqual( subject( { key: 'val' }, 'url' ), {
				key: 'val',
				returnto: 'url'
			} );
		} );
	} );

	QUnit.module( 'signUpParams()', function () {
		QUnit.test( 'empty props', function ( assert ) {
			const subject = CtaDrawer.prototype.test.signUpParams;
			assert.propEqual( subject( {} ), { type: 'signup' } );
		} );

		QUnit.test( 'nonempty props', function ( assert ) {
			const subject = CtaDrawer.prototype.test.signUpParams;
			assert.propEqual( subject( { key: 'val' } ), {
				key: 'val',
				type: 'signup'
			} );
		} );
	} );

	QUnit.module( 'HTML', function () {
		QUnit.test( 'defaults', function ( assert ) {
			const
				subject = new CtaDrawer(),
				// Import the expected HTML as a string and replace spaces with a \s*. This allows
				// the HTML some flexibility in how it's rendered.
				html = new RegExp( require( './CtaDrawer.test.html' ).defaultURLs
					.replace( /\n/g, ' ' ).replace( /\s+/g, '\\s*' ) );

			sinon.assert.match( subject.$el.find( '.drawer' ).get( 0 ).outerHTML.replace( /\n/g, ' ' ), html );
			assert.ok( true );
		} );

		QUnit.test( 'overrides', function ( assert ) {
			const
				subject = new CtaDrawer( {
					progressiveButton: new Button( {
						progressive: true,
						label: 'custom log in',
						href: 'customLogIn'
					} ).options,
					actionAnchor: new Anchor( {
						progressive: true,
						label: 'custom sign up',
						href: 'customSignUp'
					} ).options
				} ),
				html = new RegExp( require( './CtaDrawer.test.html' )
					.overrideURLs.replace( /\n/g, ' ' ).replace( /\s+/g, '\\s*' ) );

			sinon.assert.match( subject.$el.find( '.drawer' ).get( 0 ).outerHTML.replace( /\n/g, ' ' ), html );
			assert.ok( true );
		} );
	} );
} );
