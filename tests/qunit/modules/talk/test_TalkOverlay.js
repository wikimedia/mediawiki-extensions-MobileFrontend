( function ( M, $ ) {

var TalkOverlay = M.require( 'modules/talk/TalkOverlay' );

QUnit.module( 'MobileFrontend TalkOverlay', {
	setup: function() {
		this.sandbox.stub( M.pageApi, 'getPage' ).withArgs( 'Talk:No exist' ).returns(
			$.Deferred().reject( 'missingtitle' )
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

QUnit.test( '#TalkOverlay (logged in)', 1, function( assert ) {
	mw.config.set( 'wgUserName', 'FlorianSW' );
	var overlay = new TalkOverlay( { title: 'Talk:No exist' } );

	assert.ok( overlay.$( 'button.add' ).length > 0, 'There is an "Add discussion" button' );
} );

}( mw.mobileFrontend, jQuery ) );
