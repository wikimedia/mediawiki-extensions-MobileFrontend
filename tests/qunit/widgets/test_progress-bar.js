( function( M ) {

	var ProgressBar = M.require( 'widgets/progress-bar' );

	QUnit.module( 'MobileFrontend ProgressBar' );

	QUnit.test( '#setValue', 1, function( assert ) {
		var progressBar = new ProgressBar();
		progressBar.setValue( 0.35 );
		assert.strictEqual( progressBar.$( '.value' ).css( 'width' ), '35%', 'set width to reflect value' );
	} );

}( mw.mobileFrontend ) );
