( function ( M, $ ) {

var TalkOverlay = M.require( 'modules/talk/TalkOverlay' );

QUnit.module( 'MobileFrontend TalkOverlay', {
	setup: function() {
		this.sandbox.stub( M.pageApi, 'getPage' ).withArgs( 'Talk:No exist' ).returns(
			$.Deferred().reject( 'missingtitle' )
		).withArgs( 'Talk:Topic' ).returns(
			$.Deferred().resolve( {
				title: 'Talk:Topic',
				id: 1,
				lead: '',
				sections: [
					{ id: 50, line: 'Topic 1' }
				]
			} )
		);

		this.user = mw.user.getName() || '';
	},
	teardown: function() {
		mw.config.set( 'wgUserName', this.user );
	}
} );

QUnit.test( '#TalkOverlay (new page; anonymous)', 4, function( assert ) {
	mw.config.set( 'wgUserName', null );
	var options = { title: 'Talk:No exist' }, overlay = new TalkOverlay( options ),
		page = overlay.page;

	assert.strictEqual( page.title, 'Talk:No exist', 'Title set' );
	assert.strictEqual( page.getSubSections().length, 0, 'A page was setup with no sections' );

	// reload discussion board via ajax
	overlay._loadContent( options );
	assert.strictEqual( page.getSubSections().length, 0, 'Discussions reloaded, still no sections' );

	// check whether there is an Add discussion button
	assert.strictEqual( overlay.$( 'button.add' ).length, 0, 'There is no "Add discussion" button' );
} );

QUnit.test( '#TalkOverlay (logged in)', 2, function( assert ) {
	mw.config.set( 'wgUserName', 'FlorianSW' );
	var overlay = new TalkOverlay( { title: 'Talk:No exist' } );

	assert.ok( overlay.$( 'button.add' ).length > 0, 'There is an "Add discussion" button' );
	assert.strictEqual( $.trim( overlay.$( '.content-header' ).text() ),
		mw.msg( 'mobile-frontend-talk-explained-empty' ),
		'Check the header knows it is empty.' );
} );


QUnit.test( '#TalkOverlay (existing page lists section headings)', 4, function( assert ) {
	var overlay = new TalkOverlay( { title: 'Talk:Topic' } );

	assert.ok( overlay.$( '.page-list li' ).length === 1, 'One topic heading is listed' );
	assert.strictEqual( overlay.$( '.page-list li a' ).eq( 0 ).text(), 'Topic 1',
		'The text of the second item is the section heading.' );
	assert.strictEqual( overlay.$( '.page-list li a' ).data( 'id' ), 50,
		'The data id is set.' );
	assert.strictEqual( $.trim( overlay.$( '.content-header' ).text() ),
		mw.msg( 'mobile-frontend-talk-explained' ),
		'Check the header knows it is not empty.' );
} );

}( mw.mobileFrontend, jQuery ) );
