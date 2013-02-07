( function( M ) {

	var ProgressBar = M.require( 'widgets/progress-bar' );

	module( 'MobileFrontend ProgressBar' );

	test( '#setValue', function() {
		var progressBar = new ProgressBar();
		progressBar.setValue( 0.35 );
		strictEqual( progressBar.$( '.value' ).css( 'width' ), '35%', 'set width to reflect value' );
	} );

}( mw.mobileFrontend, jQuery ) );
