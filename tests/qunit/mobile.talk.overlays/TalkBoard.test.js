( function ( M ) {

	var PageGateway = M.require( 'mobile.startup/PageGateway' ),
		user = mw.user,
		TalkBoard = M.require( 'mobile.talk.overlays/TalkBoard' );

	QUnit.module( 'MobileFrontend TalkBoard', {
		beforeEach: function () {
			this.api = new mw.Api();
			this.getPageDeferredReject = $.Deferred().reject( 'missingtitle' );
			this.getPageDeferredResolve = $.Deferred().resolve( {
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
			this.sandbox.stub( PageGateway.prototype, 'getPage' ).withArgs( 'Talk:No exist' ).returns(
				this.getPageDeferredReject
			).withArgs( 'Talk:Topic' ).returns(
				this.getPageDeferredResolve
			);

			this.user = user.getName() || '';
		},
		afterEach: function () {
			mw.config.set( 'wgUserName', this.user );
		}
	} );

	QUnit.test( '#TalkBoard (new page; anonymous)', function ( assert ) {
		var options = {
				api: this.api,
				title: 'Talk:No exist',
				eventBus: {
					on: function () {}
				}
			},
			board = new TalkBoard( options ),
			page,
			self = this;

		mw.config.set( 'wgUserName', null );

		return this.getPageDeferredReject.catch( function () {
			page = board.page;
			assert.strictEqual( page.title, 'Talk:No exist', 'Title set' );
			assert.strictEqual( page.getSections().length, 0, 'A page was setup with no sections' );

			// reload discussion board via ajax
			board._loadContent( options );

			return self.getPageDeferredReject.catch( function () {
				assert.strictEqual( page.getSections().length, 0, 'Discussions reloaded, still no sections' );

				// check whether there is an Add discussion button
				assert.strictEqual( board.$( '.add' ).length, 0, 'There is no "Add discussion" button' );
			} );
		} );
	} );

	QUnit.test( '#TalkBoard (logged in)', function ( assert ) {
		var board;

		mw.config.set( 'wgUserName', 'FlorianSW' );
		board = new TalkBoard( {
			api: this.api,
			title: 'Talk:No exist',
			eventBus: {
				on: function () {}
			}
		} );

		return this.getPageDeferredReject.catch( function () {
			assert.strictEqual( board.$( '.content-header' ).text().trim(),
				mw.msg( 'mobile-frontend-talk-explained-empty' ),
				'Check the header knows it is empty.' );
		} );
	} );

	QUnit.test( '#TalkBoard (existing page lists section headings)', function ( assert ) {
		var board = new TalkBoard( {
			api: this.api,
			title: 'Talk:Topic',
			eventBus: {
				on: function () {}
			}
		} );

		return this.getPageDeferredResolve.then( function () {
			assert.strictEqual( board.$( '.topic-title-list li' ).length, 1, 'One topic heading is listed' );
			assert.strictEqual( board.$( '.topic-title-list li a' ).eq( 0 ).text(), 'Topic 1',
				'The text of the second item is the section heading.' );
			assert.strictEqual( board.$( '.topic-title-list li a' ).data( 'id' ), 50,
				'The data id is set.' );
			assert.strictEqual( board.$( '.content-header' ).text().trim(),
				mw.msg( 'mobile-frontend-talk-explained' ),
				'Check the header knows it is not empty.' );
		} );
	} );

}( mw.mobileFrontend ) );
