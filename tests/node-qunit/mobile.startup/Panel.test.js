var
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	Panel,
	sandbox;

QUnit.module( 'MobileFrontend Panel.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		Panel = require( '../../../src/mobile.startup/Panel' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'show() when not visible', function ( assert ) {
	var
		done = assert.async(),
		panel = new Panel();

	panel.on( 'show', function () {
		assert.ok( panel.$el.hasClass( 'visible' ), 'Visible class is set' );
		assert.ok( panel.$el.hasClass( 'animated' ), 'Animated class is set' );
		done();
	} );

	panel.show();
} );

QUnit.test( 'hide() when visible', function ( assert ) {
	var
		done = assert.async(),
		panel = new Panel();

	panel.on( 'hide', function () {
		assert.notOk( panel.$el.hasClass( 'visible', 'Visible class is removed' ) );
		done();
	} );

	panel.show();
	panel.hide();
} );

QUnit.test( 'isVisible() when visible', function ( assert ) {
	var
		done = assert.async(),
		panel = new Panel();

	panel.on( 'show', function () {
		assert.ok( panel.isVisible(), 'Returns true when visible' );
		done();
	} );

	panel.show();
} );

QUnit.test( 'isVisible() when not visible', function ( assert ) {
	var panel = new Panel();

	assert.notOk( panel.isVisible(), 'Returns false when not visible' );
} );

QUnit.test( 'onCancel()', function ( assert ) {
	var
		done = assert.async(),
		panel = new Panel();

	panel.on( 'hide', function () {
		assert.notOk( panel.$el.hasClass( 'visible' ), 'Removes visible class' );
		done();
	} );

	panel.show();
	panel.onCancel( {
		preventDefault: function () {}
	} );
} );

QUnit.test( 'toggle()', function ( assert ) {
	var
		done = assert.async(),
		panel = new Panel();

	panel.on( 'show', function () {
		assert.ok( panel.isVisible(), 'Shows panel when not visible' );
		panel.toggle();
	} );

	panel.on( 'hide', function () {
		assert.notOk( panel.isVisible(), 'Hides panel when visible' );
		done();
	} );

	panel.toggle();
} );
