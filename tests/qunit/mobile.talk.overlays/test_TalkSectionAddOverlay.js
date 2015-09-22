( function ( M, $ ) {

	var TalkSectionAddOverlay = M.require( 'mobile.talk.overlays/TalkSectionAddOverlay' );

	QUnit.module( 'MobileFrontend TalkSectionAddOverlay', {
		setup: function () {
			this.api = new mw.Api();
			this.sandbox.stub( this.api, 'postWithToken' ).returns( $.Deferred().resolve() );
		}
	} );

	QUnit.test( 'Test "add new discussion" Overlay and save process', 4, function ( assert ) {
		var overlay = new TalkSectionAddOverlay( {
			api: this.api,
			title: 'Talk:No exist'
		} );
		// set the content of the new discussion
		overlay.$( 'input' ).val( 'Testtitle' );
		overlay.$( 'textarea' ).val( 'Testcontent' );
		// Check the values
		assert.strictEqual( overlay.$( 'input' ).val(), 'Testtitle', 'Testtitle set' );
		assert.strictEqual( overlay.$( 'textarea' ).val(), 'Testcontent', 'Testcontent set' );
		// Test the save of the new dicsussion
		overlay.save().done( function ( status ) {
			assert.strictEqual( status, 'ok', 'The new discussion was saved' );
		} ).fail( function ( error ) {
			assert.strictEqual( error, 'ok', 'The new discussion was saved' );
		} );
		// check, if the save was recognized (so the overlay can hide without confirmation of the user)
		assert.strictEqual( overlay._saveHit, true, 'The save was recognized' );
	} );

}( mw.mobileFrontend, jQuery ) );
