var
	TalkBoard,
	PageGateway,
	sandbox,
	util = require( '../../../src/mobile.startup/util' ),
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend TalkBoard.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );

		PageGateway = require( '../../../src/mobile.startup/PageGateway' );
		TalkBoard = require( '../../../src/mobile.talk.overlays/TalkBoard' );

		this.getPageDeferredReject = util.Deferred().reject( 'missingtitle' );
		this.getPageDeferredResolve = util.Deferred().resolve( {
			title: 'Talk:Topic',
			id: 1,
			lead: '',
			sections: [
				{
					id: 50,
					line: 'Topic 1'
				}
			]
		} );
		sandbox.stub( PageGateway.prototype, 'getPage' )
			.withArgs( 'Talk:No exist' ).returns(
				this.getPageDeferredReject )
			.withArgs( 'Talk:Topic' ).returns(
				this.getPageDeferredResolve
			);
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'initializes correctly when new page', function ( assert ) {
	var
		self = this,
		options = {
			api: {},
			title: 'Talk:No exist',
			eventBus: {
				on: function () {}
			}
		},
		board = new TalkBoard( options ),
		page;

	return this.getPageDeferredReject.catch( function () {
		page = board.page;
		assert.strictEqual( page.title, 'Talk:No exist', 'Title set' );
		assert.strictEqual( page.getSections().length, 0, 'A page was setup with no sections' );
		assert.strictEqual( board.$el.find( '.content-header' ).text().trim(),
			mw.msg( 'mobile-frontend-talk-explained-empty' ),
			'Check the header knows it is empty.' );

		// reload discussion board via ajax
		board._loadContent( options );

		return self.getPageDeferredReject.catch( function () {
			assert.strictEqual( page.getSections().length, 0, 'Discussions reloaded, still no sections' );

			// check whether there is an Add discussion button
			assert.strictEqual( board.$el.find( '.add' ).length, 0, 'There is no "Add discussion" button' );
		} );
	} );
} );

QUnit.test( 'initializes correctly when existing page (lists section headings)', function ( assert ) {
	var board = new TalkBoard( {
		api: {},
		title: 'Talk:Topic',
		eventBus: {
			on: function () {}
		}
	} );

	return this.getPageDeferredResolve.then( function () {
		assert.strictEqual( board.$el.find( '.topic-title-list li' ).length, 1, 'One topic heading is listed' );
		assert.strictEqual( board.$el.find( '.topic-title-list li a' ).eq( 0 ).text(), 'Topic 1',
			'The text of the second item is the section heading.' );
		assert.strictEqual( board.$el.find( '.topic-title-list li a' ).data( 'id' ), 50,
			'The data id is set.' );
		assert.strictEqual( board.$el.find( '.content-header' ).text().trim(),
			mw.msg( 'mobile-frontend-talk-explained' ),
			'Check the header knows it is not empty.' );
	} );
} );
