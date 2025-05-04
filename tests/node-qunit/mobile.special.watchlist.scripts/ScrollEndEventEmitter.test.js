const
	sinon = require( 'sinon' ),
	oo = require( '../utils/oo' );
let
	sandbox,
	ScrollEndEventEmitter;

QUnit.module( 'MobileFrontend ScrollEndEventEmitter.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		oo.setUp( sandbox, global );

		ScrollEndEventEmitter = require( '../../../src/mobile.special.watchlist.scripts/ScrollEndEventEmitter' );
	},
	afterEach: function () {
		sandbox.restore();
	}
} );

QUnit.test( 'initializes properly', ( assert ) => {
	const
		eventBus = {
			on: sinon.spy()
		},
		is = new ScrollEndEventEmitter( eventBus, 500 ),
		is2 = new ScrollEndEventEmitter( eventBus );

	assert.strictEqual( is.enabled, true,
		'Emission is enabled by default' );
	assert.strictEqual( is.threshold, 500, 'Threshold is saved' );
	assert.strictEqual( is2.threshold, 100,
		'Without a threshold we get a default' );
	assert.strictEqual( eventBus.on.withArgs( 'scroll:throttled',
		is._scrollHandler ).calledOnce, true, 'Scrolling handler is bound' );
} );

QUnit.test( 'emits scroll end event', ( assert ) => {
	const
		eventBus = {
			on: function ( _, handler ) {
				this.handler = handler;
			},
			off: function () {}
		},
		is = new ScrollEndEventEmitter( eventBus );

	// stub scrollNearEnd method because headless tests don't support scrolling
	sandbox.stub( is, 'scrollNearEnd' ).returns( true );
	is.setElement( {} );

	is.on( ScrollEndEventEmitter.EVENT_SCROLL_END, () => {
		assert.true( true, 'scroll end event emitted' );
	} );
	// trigger stubbed 'scroll:throttled' event
	eventBus.handler();
} );

QUnit.test( 'doesn\'t emit when disabled', ( assert ) => {
	const
		emitSpy = sandbox.spy( ScrollEndEventEmitter.prototype, 'emit' ),
		eventBus = {
			on: function ( _, handler ) {
				this.handler = handler;
			},
			off: function () {}
		},
		is = new ScrollEndEventEmitter( eventBus );
	is.setElement( {} );
	is.disable();

	// trigger stubbed 'scroll:throttled' event
	eventBus.handler();
	assert.strictEqual( emitSpy.called, false, 'emit should not be called' );
} );
