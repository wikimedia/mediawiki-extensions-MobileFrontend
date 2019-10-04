let
	amcOutreachDrawer,
	Drawer,
	sandbox;
const
	jQuery = require( '../../utils/jQuery' ),
	dom = require( '../../utils/dom' ),
	oo = require( '../../utils/oo' ),
	mediaWiki = require( '../../utils/mw' ),
	mustache = require( '../../utils/mustache' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend amcOutreachDrawer.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		amcOutreachDrawer = require( '../../../../src/mobile.startup/amcOutreach/amcOutreachDrawer' );
		Drawer = require( '../../../../src/mobile.startup/Drawer' );

		// jsdom will throw "Not implemented" errors if we don't stub
		// HTMLFormElement.prototypesubmit
		sandbox.stub( global.window.HTMLFormElement.prototype, 'submit' );

		this.promoCampaign = {
			makeActionIneligible: sinon.stub().returns( true )
		};
		this.toast = {
			showOnPageReload: sinon.stub(),
			show: sinon.stub()
		};
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'returns a drawer', function ( assert ) {
	const subject = amcOutreachDrawer(
		'onLoad',
		this.promoCampaign,
		() => {
			return {
				parse: () => 'parse',
				text: () => ''
			};
		},
		{
			getUrl: () => 'getUrl'
		},
		this.toast,
		'token',
		() => {},
		''
	);

	assert.strictEqual( subject instanceof Drawer, true, 'it initializes the correct class' );
} );

QUnit.test( 'calls promoCampaign.makeActionIneligible and onBeforeHide callback when dismissed', function ( assert ) {
	const
		done = assert.async(),
		onBeforeHide = sinon.stub(),
		drawer = amcOutreachDrawer(
			'onLoad',
			this.promoCampaign,
			() => {
				return {
					parse: () => 'parse',
					text: () => ''
				};
			},
			{
				getUrl: () => 'getUrl'
			},
			this.toast,
			'token',
			onBeforeHide,
			''
		);

	assert.strictEqual( this.promoCampaign.makeActionIneligible.notCalled, true, 'not called before dismissal' );
	assert.strictEqual( onBeforeHide.notCalled, true, 'onBeforeHide not called before dismissal' );
	drawer.$el.find( '.cancel' ).first().trigger( 'click' );

	// unfortunately, since Drawer's hide method is async, we need this test to be
	// async as well
	setTimeout( () => {
		assert.strictEqual( this.promoCampaign.makeActionIneligible.calledWith(
			'onLoad' ), true, 'promoCampaign.makeActionIneligible after dismissal' );
		assert.strictEqual( onBeforeHide.called, true, 'onBeforeHide called after dismissal' );
		done();
	}, Drawer.prototype.minHideDelay );
} );

QUnit.test( 'calls promoCampaign.makeActionIneligible and toast.showOnPageReload when user enables', function ( assert ) {
	const
		onBeforeHide = sinon.stub(),
		drawer = amcOutreachDrawer(
			'onLoad',
			this.promoCampaign,
			() => {
				return {
					parse: () => 'parse',
					text: () => ''
				};
			},
			{
				getUrl: () => 'getUrl'
			},
			this.toast,
			'token',
			onBeforeHide,
			''
		);

	assert.strictEqual( this.promoCampaign.makeActionIneligible.notCalled, true,
		'promoCampaign.makeActionIneligible not called before form submission' );
	assert.strictEqual( this.toast.showOnPageReload.notCalled, true,
		'toast.showOnPageReload not called before form submission' );
	drawer.$el.find( 'form' ).trigger( 'submit' );

	assert.strictEqual( this.promoCampaign.makeActionIneligible.calledWith( 'onLoad' ), true,
		'promoCampaign.makeActionIneligible called on form submission' );

	assert.strictEqual( this.toast.showOnPageReload.called, true,
		'toast.showOnPageReload called on form submission' );
	assert.strictEqual( onBeforeHide.notCalled, true,
		'onBeforeHide not called on form submission' );
} );
