var
	// Imports
	dom = require( '../utils/dom' ),
	Drawer,
	jQuery = require( '../utils/jQuery' ),
	mw = require( '../utils/mw' ),
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
		var parentID = 'drawerParent';

		sandbox = sinon.sandbox.create();

		// Set up required by all Views.
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );

		// Additional Drawer global dependency.
		mw.setUp( sandbox, global );

		// Dynamically import Drawer to use fresh sandboxed dependencies.
		Drawer = require( '../../../src/mobile.startup/Drawer' );

		// Rewire the prototype, not the instance, since this property is used during construction.
		sandbox.stub( Drawer.prototype, 'appendToElement', '#' + parentID );

		// Create a disposable host Element. See T209129.
		parent = document.createElement( 'div' );
		parent.id = parentID;
		document.documentElement.appendChild( parent );
	},

	afterEach: function () {
		// Discard host Element.
		document.documentElement.removeChild( parent );
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
		subject = new Drawer();

	subject.on( 'show', function () {
		assertVisible();
		assert.ok( true );
		done();
	} );

	subject.show();
} );

QUnit.test( 'hidden on hide()', function ( assert ) {
	var
		done = assert.async(),
		subject = new Drawer();

	subject.on( 'hide', function () {
		assertHidden();
		assert.ok( true );
		done();
	} );

	subject.hide();
} );

QUnit.test( 'hidden on click once presented', function ( assert ) {
	var
		done = assert.async(),
		subject = new Drawer();

	subject.on( 'hide', function () {
		assertHidden();
		assert.ok( true );
		done();
	} );

	callOnPresented( subject, function () {
		parent.click();
	} );

	subject.show();
} );

QUnit.test( 'hidden on scroll once presented', function ( assert ) {
	var
		done = assert.async(),
		subject = new Drawer();

	subject.on( 'hide', function () {
		assertHidden();
		assert.ok( true );
		done();
	} );

	callOnPresented( subject, function () {
		// https://github.com/jsdom/jsdom/issues/1422
		var event = new window.Event( 'scroll', { bubbles: true } );
		parent.dispatchEvent( event );
	} );

	subject.show();
} );

QUnit.test( 'HTML is valid', function ( assert ) {
	var subject = new Drawer(),
		done = assert.async();

	util.docReady( function () {
		assert.strictEqual(
			subject.$el.get( 0 ).outerHTML, '<div class="drawer position-fixed view-border-box"></div>'
		);
		done();
	} );
} );

/**
 * @param {Drawer} subject
 * @param {Function} callback
 * @return {void}
*/
function callOnPresented( subject, callback ) {
	// Wait for appearance.
	subject.on( 'show', function () {
		// Wait for minimum presentation duration to expire.
		setTimeout( callback, subject.minHideDelay );
	} );
}

function assertVisible() {
	sinon.assert.match( parent.className, /.*\bdrawer-visible\b.*/ );
}

function assertHidden() {
	sinon.assert.match( parent.className, /^((?!\bdrawer-visible\b).)*$/ );
}
