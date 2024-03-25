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

		// requestAnimationFrame doesn't exist in Node
		global.requestAnimationFrame = setTimeout;

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

QUnit.test( 'visible on show()', ( assert ) => {
	const
		onShow = () => {
			// eslint-disable-next-line no-use-before-define
			assertVisible( subject );
			assert.true( true );
		},
		subject = new Drawer( {
			onShow
		} );

	subject.show();
	// show again and it's still visible.
	subject.show();
} );

QUnit.test( 'accepts onShow and events', ( assert ) => {
	const
		done = assert.async(),
		onShow = () => {
			assert.true( true );
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

QUnit.test( 'hidden on hide()', ( assert ) => {
	const
		done = assert.async(),
		onBeforeHide = () => {
			// eslint-disable-next-line no-use-before-define
			assertHidden( subject );
			assert.true( true );
			done();
		},
		subject = new Drawer( { onBeforeHide } );

	subject.hide();
} );

QUnit.test( 'hidden on mask click', ( assert ) => {
	const
		done = assert.async(),
		onBeforeHide = () => {
			// eslint-disable-next-line no-use-before-define
			assertHidden( subject );
			assert.true( true );
			done();
		},
		subject = new Drawer( { onBeforeHide } );

	subject.show();
	subject.$el.find( '.drawer-container__mask' )[0].dispatchEvent( new window.Event( 'click', { bubbles: true } ) );
} );

QUnit.test( 'HTML is valid', ( assert ) => {
	const subject = new Drawer( {} );
	assert.strictEqual(
		subject.$el.find( '.drawer' ).get( 0 ).outerHTML,
		`<div class="drawer drawer-container__drawer position-fixed"><button type="button" class="cdx-button cdx-button--size-large cdx-button--weight-quiet cdx-button--icon-only cancel">
				<span class="mf-icon mf-icon-expand "> </span>
				<span>mobile-frontend-drawer-arrow-label</span>
		</button></div>`
	);
} );

function assertVisible( drawer ) {
	sinon.assert.match( drawer.$el.find( '.drawer' )[ 0 ].className, /.*\bvisible\b.*/ );
}

function assertHidden( drawer ) {
	sinon.assert.match( drawer.$el.find( '.drawer' )[ 0 ].className, /^((?!\bvisible\b).)*$/ );
}
