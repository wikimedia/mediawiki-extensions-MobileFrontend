const
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	sinon = require( 'sinon' ),
	util = require( '../../../src/mobile.startup/util' );

QUnit.module( 'MobileFrontend mobile.editor.overlay/BlockMessageDetails', {
	beforeEach: function () {
		this.sandbox = sinon.createSandbox();
		dom.setUp( this.sandbox, global );
		jQuery.setUp( this.sandbox, global );
		this.BlockMessageDetails = require( '../../../src/mobile.editor.overlay/BlockMessageDetails' );
	},
	afterEach: function () {
		this.sandbox.restore();
		jQuery.tearDown();
	}
} );

QUnit.test( 'renders block reason', function ( assert ) {
	const reason = '{{test}}';
	const parsedReason = util.Deferred().resolve( '<div>some HTML</div>' ).promise();
	const component = new this.BlockMessageDetails( { reason, parsedReason } );

	component.render( {} );

	return parsedReason.then( () => {
		assert.strictEqual(
			component.$el.find( '.block-message-reason > h5' ).text(),
			'mobile-frontend-editor-blocked-drawer-reason-header',
			'Should render formatted block reason with header'
		);
		assert.strictEqual(
			component.$el.find( '.block-message-reason > div' ).html(),
			'<div>some HTML</div>',
			'Should render formatted block reason'
		);
	} );
} );

QUnit.test( 'does not render block reason if it is empty', function ( assert ) {
	const reason = '';
	const parsedReason = util.Deferred().resolve( '' ).promise();
	const component = new this.BlockMessageDetails( { reason, parsedReason } );

	component.render( {} );

	return parsedReason.then( () => {
		assert.strictEqual(
			component.$el.find( '.block-message-reason' ).length,
			0,
			'Should not render empty block reason'
		);
	} );
} );
