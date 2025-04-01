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
		sandbox.stub( global.mw.util, 'getUrl' ).callsFake( ( pageName, params ) => params.type ? 'signUp' : 'logIn' );

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
}, () => {
	QUnit.module( 'redirectParams()', () => {
		QUnit.test( 'empty props, default URL', ( assert ) => {
			const subject = CtaDrawer.prototype.test.redirectParams;
			sandbox.stub( global.mw.config, 'get' ).callsFake( () => 'pageName' );
			assert.propEqual( subject( {} ), { returnto: 'pageName' } );
		} );

		QUnit.test( 'empty props, nondefault URL', ( assert ) => {
			const subject = CtaDrawer.prototype.test.redirectParams;
			assert.propEqual( subject( {}, 'url' ), { returnto: 'url' } );
		} );

		QUnit.test( 'nonempty props', ( assert ) => {
			const subject = CtaDrawer.prototype.test.redirectParams;
			assert.propEqual( subject( { key: 'val' }, 'url' ), {
				key: 'val',
				returnto: 'url'
			} );
		} );
	} );

	QUnit.module( 'signUpParams()', () => {
		QUnit.test( 'empty props', ( assert ) => {
			const subject = CtaDrawer.prototype.test.signUpParams;
			assert.propEqual( subject( {} ), { type: 'signup' } );
		} );

		QUnit.test( 'nonempty props', ( assert ) => {
			const subject = CtaDrawer.prototype.test.signUpParams;
			assert.propEqual( subject( { key: 'val' } ), {
				key: 'val',
				type: 'signup'
			} );
		} );
	} );

	QUnit.module( 'HTML', () => {
		QUnit.test( 'defaults', ( assert ) => {
			const
				subject = new CtaDrawer(),
				// Import the expected HTML as a string and replace spaces with a \s*. This allows
				// the HTML some flexibility in how it's rendered.
				html = new RegExp( require( './CtaDrawer.test.html' ).defaultURLs
					.replace( /\n/g, ' ' ).replace( /\s+/g, '\\s*' ) );

			sinon.assert.match( subject.$el.find( '.drawer' ).get( 0 ).outerHTML.replace( /\n/g, ' ' ), html );
			assert.true( true );
		} );

		QUnit.test( 'overrides', ( assert ) => {
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
			assert.true( true );
		} );
	} );
} );
