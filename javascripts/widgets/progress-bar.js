( function( M ) {

	var View = M.require( 'View' ), ProgressBar;

	ProgressBar = View.extend( {
		className: 'progress-bar',

		template: '<div class="value"></div>',

		setValue: function( value ) {
			this.$( '.value' ).css( 'width', value * 100 + '%' );
		}
	} );

	M.define( 'widgets/progress-bar', ProgressBar );

}( mw.mobileFrontend ) );
