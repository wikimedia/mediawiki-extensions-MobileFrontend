( function ( M, $ ) {

var TalkOverlay = M.require( 'modules/talk/TalkOverlay' );

QUnit.module( 'MobileFrontend TalkOverlay', {
	setup: function() {
		sinon.stub( M.pageApi, 'getPage' ).withArgs( 'Talk:No exist' ).returns(
			$.Deferred().reject( { error: { code: 'missingtitle' } } )
		);
	},
	teardown: function() {
		M.pageApi.getPage.restore();
	}
} );

QUnit.test( '#TalkOverlay (new page)', 2, function( assert ) {
	var overlay = new TalkOverlay( { title: 'Talk:No exist' } ),
		page = overlay.options.page;

	assert.strictEqual( page.title, 'Talk:No exist', 'Title set' );
	assert.strictEqual( page.getSubSections().length, 0, 'A page was setup with no sections' );
} );

}( mw.mobileFrontend, jQuery ) );
