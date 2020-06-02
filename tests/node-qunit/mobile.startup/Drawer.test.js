const // Imports
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	mw = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );
let
	Drawer,
	sandbox;

// util.docReady() usage appears to be necessary over
// `document.addEventListener('DOMContentLoaded', ...)` as the latter fires before the subject's
// internal usage of the former.

QUnit.module( 'MobileFrontend Drawer.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();

		// Set up required by all Views.
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );

		// Additional Drawer global dependency.
		mw.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		// Dynamically import Drawer to use fresh sandboxed dependencies.
		Drawer = require( '../../../src/mobile.startup/Drawer' );
	},

	afterEach: function () {
		Drawer = undefined;

		jQuery.tearDown();

		sandbox.restore();
	}
} );

QUnit.test( 'visible on show()', function ( assert ) {
	const
		done = assert.async(),
		onShow = () => {
			assertVisible( subject );
			assert.ok( true );
			done();
		},
		subject = new Drawer( {} );

	subject.show().then( onShow ).then( () => {
		// show again and it's still visible./
		subject.show().then( onShow );
	} );
} );

QUnit.test( 'accepts onShow and events', function ( assert ) {
	const
		done = assert.async(),
		onShow = () => {
			assert.ok( true );
			done();
		},
		subject = new Drawer( {
			events: {
				'click .button': () => {}
			},
			onShow
		} );

	subject.show();
} );

QUnit.test( 'hidden on hide()', function ( assert ) {
	const
		done = assert.async(),
		onBeforeHide = () => {
			assertHidden( subject );
			assert.ok( true );
			done();
		},
		subject = new Drawer( { onBeforeHide } );

	subject.hide();
} );

QUnit.test( 'hidden on mask click', function ( assert ) {
	const
		done = assert.async(),
		onBeforeHide = () => {
			assertHidden( subject );
			assert.ok( true );
			done();
		},
		subject = new Drawer( { onBeforeHide } );

	subject.show();
	subject.$el.find( '.drawer-container__mask' )[0].dispatchEvent( new window.Event( 'click', { bubbles: true } ) );
} );

QUnit.test( 'HTML is valid', function ( assert ) {
	const subject = new Drawer( {} );
	assert.strictEqual(
		subject.$el.find( '.drawer' ).get( 0 ).outerHTML,
		'<div class="drawer drawer-container__drawer position-fixed"><div class="mw-ui-icon mw-ui-icon-mf-expand mw-ui-icon-element   cancel"></div></div>'
	);
} );

function assertVisible( drawer ) {
	sinon.assert.match( drawer.$el.find( '.drawer' )[ 0 ].className, /.*\bvisible\b.*/ );
}

function assertHidden( drawer ) {
	sinon.assert.match( drawer.$el.find( '.drawer' )[ 0 ].className, /^((?!\bvisible\b).)*$/ );
}
