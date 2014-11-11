( function ( M ) {

	var View = M.require( 'View' ), ProgressBar;

	ProgressBar = View.extend( {
		className: 'progress-bar',

		template: mw.template.compile( '<div class="value"></div>', 'hogan' ),

		setValue: function ( value ) {
			this.$( '.value' ).css( 'width', value * 100 + '%' );
		}
	} );

	M.define( 'modules/uploads/ProgressBar', ProgressBar );

}( mw.mobileFrontend ) );
