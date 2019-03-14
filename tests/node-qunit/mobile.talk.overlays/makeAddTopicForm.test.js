let makeAddTopicForm, sandbox;
const jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend makeAddTopicForm', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		makeAddTopicForm = require( '../../../src/mobile.talk.overlays/makeAddTopicForm' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'makeAddTopicForm', function ( assert ) {
	const spy = sandbox.spy(),
		formNoHandler = makeAddTopicForm( {
			licenseMsg: 'foo',
			disabled: false,
			subject: 'sub',
			body: 'body'
		} ),
		form = makeAddTopicForm( {
			licenseMsg: 'foo',
			disabled: false,
			subject: 'sub',
			body: 'body',
			onTextInput: function ( _, val ) {
				spy( val );
			}
		} );
	assert.strictEqual( formNoHandler.$el.hasClass( 'add-topic-form' ), true,
		'The onTextInput parameter is optional' );
	formNoHandler.$el.find( 'textarea' ).trigger( 'input' );
	form.$el.find( 'textarea' ).trigger( 'input' );
	form.$el.find( 'textarea' ).val( '' );
	form.$el.find( 'textarea' ).trigger( 'input' );
	assert.strictEqual( form.$el.hasClass( 'add-topic-form' ), true,
		'Form has the expected class name' );
	assert.strictEqual( spy.args[0][0], 'body ~~~~',
		'Check onTextInput is executed and signed when callback is run.' );
	assert.strictEqual( spy.args[1][0], '',
		'Check onTextInput does not autosign if body empty.' );
} );
