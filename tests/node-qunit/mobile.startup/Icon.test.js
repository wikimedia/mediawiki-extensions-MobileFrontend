const
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	oo = require( '../utils/oo' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' );
let
	Icon,
	sandbox;

QUnit.module( 'MobileFrontend Icon.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		Icon = require( '../../../src/mobile.startup/Icon' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'creates a link if passed href option', function ( assert ) {
	const
		url = 'https://www.foo.com',
		icon = new Icon( {
			href: url
		} );

	assert.strictEqual( icon.$el[0].tagName, 'A' );
	assert.strictEqual( icon.$el[0].getAttribute( 'href' ), url );
} );

QUnit.test( 'does not add href attribute when not a link', function ( assert ) {
	const icon = new Icon( {
		tagName: 'div'
	} );

	assert.strictEqual( icon.$el[0].tagName, 'DIV' );
	assert.strictEqual( icon.$el[0].href, undefined );
} );

QUnit.test( 'adds disabled attribute when a button', function ( assert ) {
	const icon = new Icon( {
		tagName: 'button',
		disabled: true
	} );

	assert.strictEqual( icon.$el[0].tagName, 'BUTTON' );
	assert.strictEqual( icon.$el[0].disabled, true );
} );

QUnit.test( 'does not add disabled attribute when not a button', function ( assert ) {
	const icon = new Icon( {
		tagName: 'div',
		disabled: true
	} );

	assert.strictEqual( icon.$el[0].tagName, 'DIV' );
	assert.strictEqual( icon.$el[0].disabled, undefined );
} );

QUnit.test( 'getIconClasses generates icon classes using icon name', function ( assert ) {
	const icon = new Icon( {
		name: 'user',
		type: ''
	} );

	assert.strictEqual( icon.getIconClasses(), 'mw-ui-icon mw-ui-icon-mf-user ' );
} );

QUnit.test( 'getIconClasses generates icon classes using custom icon prefix', function ( assert ) {
	const icon = new Icon( {
		name: 'user',
		type: '',
		glyphPrefix: 'wikimedia'
	} );

	assert.strictEqual( icon.getIconClasses(), 'mw-ui-icon mw-ui-icon-wikimedia-user ' );
} );

QUnit.test( 'getIconClasses generates icon classes using icon type', function ( assert ) {
	const icon = new Icon( {
		name: 'user',
		type: 'before'
	} );

	assert.strictEqual( icon.getIconClasses(), 'mw-ui-icon mw-ui-icon-before mw-ui-icon-mf-user ' );
} );

QUnit.test( 'getIconClasses adds button classes using icon type element', function ( assert ) {
	const icon = new Icon( {
		name: 'user',
		type: 'element'
	} );

	assert.strictEqual( icon.getIconClasses(), 'mw-ui-icon mw-ui-icon-element mw-ui-icon-mf-user  mw-ui-button mw-ui-quiet' );
} );

QUnit.test( 'getIconClasses adds additional classes', function ( assert ) {
	const icon = new Icon( {
		name: 'user',
		additionalClassNames: 'test'
	} );

	assert.strictEqual( icon.getIconClasses(), 'mw-ui-icon mw-ui-icon-element mw-ui-icon-mf-user test mw-ui-button mw-ui-quiet' );
} );

QUnit.test( 'getRotationClasses returns rotation classes', function ( assert ) {
	const iconNeg180 = new Icon( { rotation: -180 } );
	const icon180 = new Icon( { rotation: 180 } );
	const iconNeg90 = new Icon( { rotation: -90 } );
	const icon90 = new Icon( { rotation: 90 } );

	assert.strictEqual( iconNeg180.getRotationClass(), 'mf-mw-ui-icon-rotate-flip' );
	assert.strictEqual( icon180.getRotationClass(), 'mf-mw-ui-icon-rotate-flip' );
	assert.strictEqual( iconNeg90.getRotationClass(), 'mf-mw-ui-icon-rotate-anti-clockwise' );
	assert.strictEqual( icon90.getRotationClass(), 'mf-mw-ui-icon-rotate-clockwise' );
} );

QUnit.test( 'getGlyphClassName uses icon prefix', function ( assert ) {
	const icon = new Icon( {
		name: 'user',
		glyphPrefix: 'wikimedia'
	} );

	assert.strictEqual( icon.getGlyphClassName(), 'mw-ui-icon-wikimedia-user' );
} );

QUnit.test( 'getGlyphClassName does not use icon prefix if not provided', function ( assert ) {
	const icon = new Icon( {
		name: 'user',
		glyphPrefix: ''
	} );

	assert.strictEqual( icon.getGlyphClassName(), 'mw-ui-icon-user' );
} );

QUnit.test( 'adds small classes', function ( assert ) {
	const icon = new Icon( {
		name: 'user',
		isSmall: true
	} );

	assert.strictEqual( icon.getClassName(), 'mw-ui-icon mw-ui-icon-element mw-ui-icon-mf-user  mw-ui-button mw-ui-quiet mw-ui-icon-small ' );
} );
