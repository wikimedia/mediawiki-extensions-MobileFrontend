var talkBoard, Section, sandbox,
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend mobile.talk.overlays/talkBoard', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		sandbox.stub( mw, 'msg' )
			.withArgs( 'mobile-frontend-talk-explained' ).returns( 'things' )
			.withArgs( 'mobile-frontend-talk-explained-empty' ).returns( 'empty' );

		talkBoard = require( '../../../src/mobile.talk.overlays/talkBoard' );
		Section = require( '../../../src/mobile.startup/Section' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'no sections', function ( assert ) {
	var board = talkBoard( [] );
	assert.strictEqual( board.$el.find( '.content-header' ).text().trim(), 'empty' );
	assert.strictEqual( board.$el.find( 'ul' ).children().length, 0, 'no topics' );
} );

QUnit.test( 'sections', function ( assert ) {
	var board = talkBoard( [
		new Section( {
			line: '1',
			id: '2'
		} )
	] );
	assert.strictEqual( board.$el.find( '.content-header' ).text().trim(), 'things' );
	assert.strictEqual( board.$el.find( 'ul' ).children().length, 1, '1 topic' );
} );
