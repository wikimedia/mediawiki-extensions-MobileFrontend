var minHideDelay,
	// Imports
	dom = require( '../utils/dom' ),
	Drawer,
	jQuery = require( '../utils/jQuery' ),
	mw = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	sandbox,
	sinon = require( 'sinon' ),
	util = require( '../../../src/mobile.startup/util' ),

	// Variables
	parent;

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
		minHideDelay = Drawer.prototype.minHideDelay;
		parent = document.body;
	},

	afterEach: function () {
		parent = undefined;

		Drawer = undefined;

		jQuery.tearDown();

		sandbox.restore();
	}
} );

QUnit.test( 'appends self to parent when DOM is loaded', function ( assert ) {
	var
		done = assert.async(),
		subject = new Drawer();

	util.docReady( function () {
		assert.strictEqual( subject.$el.parent().get( 0 ), parent );
		done();
	} );
} );

QUnit.test( 'adds class to parent when DOM is loaded', function ( assert ) {
	var done = assert.async();

	new Drawer(); // eslint-disable-line no-new
	util.docReady( function () {
		assert.strictEqual( parent.className, 'has-drawer' );
		done();
	} );
} );

QUnit.test( 'consumes clicks', function ( assert ) {
	var
		done = assert.async(),
		event = new window.Event( 'click' ),
		subject = new Drawer();

	event.stopPropagation = function () {
		assert.ok( true );
		done();
	};
	subject.$el.get( 0 ).dispatchEvent( event );
} );

QUnit.test( 'visible on show()', function ( assert ) {
	var
		done = assert.async(),
		onShow = () => {
			assertVisible();
			assert.ok( true );
			done();
		},
		subject = new Drawer( {} );

	subject.show().then( onShow );
} );

QUnit.test( 'hidden on hide()', function ( assert ) {
	var
		done = assert.async(),
		onBeforeHide = () => {
			assertHidden();
			assert.ok( true );
			done();
		},
		subject = new Drawer( { onBeforeHide } );

	subject.hide();
} );

QUnit.test( 'hidden on click once presented', function ( assert ) {
	var
		done = assert.async(),
		onBeforeHide = () => {
			// onBeforeHide currently runs before class is removed.
			setTimeout( () => {
				assertHidden();
				assert.ok( true );
				done();
			}, minHideDelay );
		},
		onShow = () => {
			parent.click();
		},
		subject = new Drawer( {
			onBeforeHide
		} );

	subject.show().then( onShow );
} );

QUnit.test( 'hidden on scroll once presented', function ( assert ) {
	var
		done = assert.async(),
		onBeforeHide = () => {
			setTimeout( () => {
				assertHidden();
				assert.ok( true );
				done();
			}, minHideDelay );
		},
		onShow = () => {
			setTimeout( () => {
				var event = new window.Event( 'scroll', { bubbles: true } );
				parent.dispatchEvent( event );
			}, minHideDelay );
		},
		subject = new Drawer( {
			onBeforeHide
		} );

	subject.show().then( onShow );
} );

QUnit.test( 'HTML is valid', function ( assert ) {
	var subject = new Drawer();
	assert.strictEqual(
		subject.$el.get( 0 ).outerHTML,
		'<div class="drawer position-fixed view-border-box"><div class="mw-ui-icon mw-ui-icon-mf-expand mw-ui-icon-element   cancel"></div></div>'
	);
} );

function assertVisible() {
	sinon.assert.match( parent.className, /.*\bdrawer-visible\b.*/ );
}

function assertHidden() {
	sinon.assert.match( parent.className, /^((?!\bdrawer-visible\b).)*$/ );
}
