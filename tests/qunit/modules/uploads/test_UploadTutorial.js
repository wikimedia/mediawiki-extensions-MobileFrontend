( function ( M ) {

	var UploadTutorial = M.require( 'modules/uploads/UploadTutorial' ),
		uploadTutorial;

	QUnit.module( 'MobileFrontend UploadTutorial', {
		setup: function () {
			uploadTutorial = new UploadTutorial();
		}
	} );

	QUnit.test( '#initialize, with cancel button', 2, function ( assert ) {
		assert.ok( uploadTutorial.$( '.cancel' ).length, 'Has cancel button' );
		assert.ok( !uploadTutorial.$( 'input' ).length, 'Has no file button' );
	} );

	QUnit.test( '#initialize, with file button', 2, function ( assert ) {
		uploadTutorial = new UploadTutorial( {
			funnel: 'article'
		} );
		assert.ok( uploadTutorial.$( 'div.button' ).length, 'Has file button' );
		assert.ok( !uploadTutorial.$( '.cancel' ).length, 'Has no cancel button' );
	} );

	QUnit.test( '#onNextClick', 3, function ( assert ) {
		assert.ok( uploadTutorial.$( '.slide' ).eq( 0 ).hasClass( 'active' ), 'Initialises to page 0' );
		uploadTutorial.onNextClick();
		assert.ok( !uploadTutorial.$( '.slide' ).eq( 0 ).hasClass( 'active' ), 'Deactivates page 0' );
		assert.ok( uploadTutorial.$( '.slide' ).eq( 1 ).hasClass( 'active' ), 'Progresses to page 1' );
	} );

	QUnit.test( '#onPreviousClick', 2, function ( assert ) {
		uploadTutorial.onNextClick();
		uploadTutorial.onPreviousClick();
		assert.ok( !uploadTutorial.$( '.slide' ).eq( 1 ).hasClass( 'active' ), 'Deactivates page 1' );
		assert.ok( uploadTutorial.$( '.slide' ).eq( 0 ).hasClass( 'active' ), 'Back to page 1' );
	} );

}( mw.mobileFrontend ) );
