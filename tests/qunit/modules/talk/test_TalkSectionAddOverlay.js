( function ( M, $ ) {

	var TalkSectionAddOverlay = M.require( 'modules/talk/TalkSectionAddOverlay' ),
		api = M.require( 'api' );

	QUnit.module( 'MobileFrontend TalkSectionAddOverlay', {
		setup: function () {
			this.sandbox.stub( api, 'postWithToken' ).returns( $.Deferred().resolve() );
		}
	} );

	QUnit.test( 'Test "add new discussion" Overlay and save process', 4, function ( assert ) {
		var overlay = new TalkSectionAddOverlay( {
			title: 'Talk:No exist'
		} );
		// set the content of the new discussion
		overlay.$( 'input' ).val( 'Testtitle' );
		overlay.$( 'textarea' ).val( 'Testcontent' );
		// Check the values
		assert.strictEqual( overlay.$( 'input' ).val(), 'Testtitle', 'Testtitle set' );
		assert.strictEqual( overlay.$( 'textarea' ).val(), 'Testcontent', 'Testcontent set' );
		// Test the save of the new dicsussion
		QUnit.stop();
		overlay.save().done( function ( status ) {
			assert.strictEqual( status, 'ok', 'The new discussion was saved' );
			QUnit.start();
		} ).fail( function ( error ) {
			assert.strictEqual( error, 'ok', 'The new discussion was saved' );
			QUnit.start();
		} );
		// check, if the save was recognized (so the overlay can hide without confirmation of the user)
		assert.strictEqual( overlay._saveHit, true, 'The save was recognized' );
	} );

}( mw.mobileFrontend, jQuery ) );
