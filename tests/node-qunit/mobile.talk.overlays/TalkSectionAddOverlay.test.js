var
	TalkSectionAddOverlay,
	sandbox,
	util = require( '../../../src/mobile.startup/util' ),
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend TalkSectionAddOverlay', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		TalkSectionAddOverlay = require( '../../../src/mobile.talk.overlays/TalkSectionAddOverlay' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'save()', function ( assert ) {
	var overlay = new TalkSectionAddOverlay( {
		api: {
			postWithToken: sandbox.stub().returns(
				util.Deferred().resolve()
			)
		},
		title: 'Talk:No exist'
	} );
	// set the content of the new discussion
	overlay.$el.find( 'input' ).val( 'Testtitle' );
	overlay.$el.find( 'textarea' ).val( 'Testcontent' );
	// Check the values
	assert.strictEqual( overlay.$el.find( 'input' ).val(), 'Testtitle', 'Testtitle set' );
	assert.strictEqual( overlay.$el.find( 'textarea' ).val(), 'Testcontent', 'Testcontent set' );
	// Test the save of the new dicsussion
	return overlay.save().then( function ( status ) {
		assert.strictEqual( status, 'ok', 'The new discussion was saved' );
		// check, if the save was recognized
		// (so the overlay can hide without confirmation of the user)
		assert.strictEqual( overlay._saveHit, true, 'The save was recognized' );
	} );
} );
