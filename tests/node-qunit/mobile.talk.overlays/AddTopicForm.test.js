let
	AddTopicForm,
	sandbox;
const util = require( '../../../src/mobile.startup/util' ),
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend AddTopicForm', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		AddTopicForm = require( '../../../src/mobile.talk.overlays/AddTopicForm' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'makePanel()', function ( assert ) {
	const text = 'Hello world',
		panel = AddTopicForm.test.makePanel( util.parseHTML( '<span>' ).text( text ) );

	assert.strictEqual( panel.$el.hasClass( 'panel' ), true, 'A Panel is created' );
	assert.strictEqual( panel.$el.find( 'span' ).text(),
		text, 'The panel has he element inside' );
} );

QUnit.test( 'AddTopicForm', function ( assert ) {
	const spy = sandbox.spy(),
		formNoInputEvent = new AddTopicForm( {
			subject: ' Subject',
			body: 'Body',
			disabled: false,
			licenseMsg: 'MobileFrontend <strong>fun</strong> license'
		} ),
		form = new AddTopicForm( {
			subject: ' Subject',
			body: 'Body',
			disabled: false,
			licenseMsg: 'MobileFrontend <strong>fun</strong> license',
			onTextInput: function ( subject, body ) {
				spy( subject, body );
			}
		} );

	// form without an input
	try {
		formNoInputEvent.$el.find( 'textarea' ).trigger( 'input' );
		assert.ok( true, 'If form has no onTextInput event handler does not execute' );
	} catch ( e ) {
		assert.ok( false, 'If form has no onTextInput no exception is meant to be thrown' );
	}
	assert.strictEqual( form.$el.find( 'input' ).val(), ' Subject', 'Subject input created' );
	assert.strictEqual( form.$el.find( 'textarea' ).val(), 'Body', 'textarea created' );
	assert.strictEqual( form.$el.find( 'p strong' ).text(), 'fun', 'licenseMsg accepts HTML' );
	assert.strictEqual( spy.calledOnce, false, 'Spy not called to begin with' );
	form.$el.find( 'textarea' ).trigger( 'input' );
	assert.strictEqual( spy.calledOnce, true, 'Spy got called after textarea input' );
	assert.propEqual( spy.args[0], [ 'Subject', 'Body' ],
		'Spy got called with expected (and trimmed arguments)' );

} );
