let
	promoCampaign,
	sandbox,
	jQuery = require( '../../utils/jQuery' ),
	dom = require( '../../utils/dom' ),
	oo = require( '../../utils/oo' ),
	mediaWiki = require( '../../utils/mw' ),
	mustache = require( '../../utils/mustache' ),
	sinon = require( 'sinon' );

const
	ACTIONS = {
		onLoad: 'onLoad'
	},
	CAMPAIGN_NAME = 'campaign-name',
	ON_LOAD_STORAGE_KEY = 'mobile-frontend-campaign-name-ineligible-onLoad';

QUnit.module( 'MobileFrontend promoCampaign.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		promoCampaign = require( '../../../../src/mobile.startup/promoCampaign/promoCampaign' );
		this.onShow = sinon.stub();
		this.storage = {
			get: sinon.stub(),
			set: sinon.stub()
		};
	},

	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#showIfEligible throws when invalid', function ( assert ) {
	this.storage.get.withArgs( ACTIONS.onLoad ).returns( null );
	const subject = promoCampaign(
		this.onShow,
		ACTIONS,
		CAMPAIGN_NAME,
		true,
		true,
		this.storage
	);

	assert.throws(
		() => {
			subject.showIfEligible( 'not a valid action' );
		},
		'Throws when action not valid'
	);
	assert.strictEqual( this.onShow.called, false, 'onShow is not called' );
} );

QUnit.test( '#showIfEligible when campaign off', function ( assert ) {
	this.storage.get.withArgs( ACTIONS.onLoad ).returns( null );
	const subject = promoCampaign(
		this.onShow,
		ACTIONS,
		CAMPAIGN_NAME,
		false,
		true,
		this.storage
	);

	subject.showIfEligible( ACTIONS.onLoad );

	assert.strictEqual( this.onShow.called, false, 'onShow is not called' );
} );

QUnit.test( '#showIfEligible when user ineligible', function ( assert ) {
	this.storage.get.withArgs( ACTIONS.onLoad ).returns( null );
	const subject = promoCampaign(
		this.onShow,
		ACTIONS,
		CAMPAIGN_NAME,
		true,
		false,
		this.storage
	);

	subject.showIfEligible( ACTIONS.onLoad );

	assert.strictEqual( this.onShow.called, false, 'onShow is not called' );
} );

QUnit.test( '#showIfEligible when storage is not available', function ( assert ) {
	this.storage.get.withArgs( ACTIONS.onLoad ).returns( false );
	const subject = promoCampaign(
		this.onShow,
		ACTIONS,
		CAMPAIGN_NAME,
		false,
		true,
		this.storage
	);

	subject.showIfEligible( ACTIONS.onLoad );

	assert.strictEqual( this.onShow.called, false, 'onShow is not called' );
} );

QUnit.test( '#showIfEligible when storage key is ineligible', function ( assert ) {
	this.storage.get.withArgs( ACTIONS.onLoad ).returns( '~' );
	const subject = promoCampaign(
		this.onShow,
		ACTIONS,
		CAMPAIGN_NAME,
		true,
		true,
		this.storage
	);

	subject.showIfEligible( ACTIONS.onLoad );

	assert.strictEqual( this.onShow.called, false, 'onShow is not called' );
} );

QUnit.test( '#showIfEligible when eligible', function ( assert ) {
	this.storage.get.withArgs( ON_LOAD_STORAGE_KEY ).returns( null );
	const subject = promoCampaign(
		this.onShow,
		ACTIONS,
		CAMPAIGN_NAME,
		true,
		true,
		this.storage
	);

	subject.showIfEligible( ACTIONS.onLoad );

	assert.strictEqual( this.onShow.called, true, 'onShow' );
} );

QUnit.test( '#makeActionIneligible when successful', function ( assert ) {
	this.storage.get.withArgs( ON_LOAD_STORAGE_KEY ).returns( null );
	this.storage.set.withArgs( ON_LOAD_STORAGE_KEY, '~' ).returns( true );

	const subject = promoCampaign(
			this.onShow,
			ACTIONS,
			CAMPAIGN_NAME,
			true,
			true,
			this.storage
		),
		result = subject.makeActionIneligible( ACTIONS.onLoad );

	assert.strictEqual( result, true, 'returns result from mw storage' );
	assert.strictEqual( this.storage.set.calledOnce, true, 'set called once' );
	assert.strictEqual( this.storage.set.calledWith( ON_LOAD_STORAGE_KEY, '~' ), true, 'set called with correct value' );
} );

QUnit.test( '#makeActionIneligible when unsuccessful', function ( assert ) {
	this.storage.get.withArgs( ON_LOAD_STORAGE_KEY ).returns( null );
	this.storage.set.withArgs( ON_LOAD_STORAGE_KEY ).returns( false );

	const subject = promoCampaign(
			this.onShow,
			ACTIONS,
			CAMPAIGN_NAME,
			true,
			true,
			this.storage
		),
		result = subject.makeActionIneligible( ACTIONS.onLoad );

	assert.strictEqual( result, false, 'returns result from mw storage' );
} );

QUnit.test( '#makeActionIneligible when invalid action', function ( assert ) {
	this.storage.get.withArgs( ON_LOAD_STORAGE_KEY ).returns( null );

	const subject = promoCampaign(
		this.onShow,
		ACTIONS,
		CAMPAIGN_NAME,
		true,
		true,
		this.storage
	);

	assert.throws( () => {
		subject.makeActionIneligible( 'not a valid action' );
	}, 'Throws when invalid action' );
} );

QUnit.test( '#makeAllActionsIneligible', function ( assert ) {
	this.storage.get.withArgs( ON_LOAD_STORAGE_KEY ).returns( null );

	const subject = promoCampaign(
		this.onShow,
		ACTIONS,
		CAMPAIGN_NAME,
		true,
		true,
		this.storage
	);

	subject.makeAllActionsIneligible();

	assert.strictEqual( this.storage.set.calledOnce, true, 'set called once' );
	assert.strictEqual( this.storage.set.calledWith( ON_LOAD_STORAGE_KEY, '~' ), true, 'set called with correct value' );
} );

QUnit.test( '#isCampaignActive when true', function ( assert ) {
	const subject = promoCampaign(
		this.onShow,
		ACTIONS,
		CAMPAIGN_NAME,
		true,
		true,
		this.storage
	);

	assert.strictEqual( subject.isCampaignActive(), true, 'isCampaignActive returns true when true' );
} );

QUnit.test( '#isCampaignActive when false', function ( assert ) {
	const subject = promoCampaign(
		this.onShow,
		ACTIONS,
		CAMPAIGN_NAME,
		false,
		true,
		this.storage
	);

	assert.strictEqual( subject.isCampaignActive(), false, 'isCampaignActive returns false when false' );
} );
