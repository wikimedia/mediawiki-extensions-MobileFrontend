( function ( M ) {

	var ProgressBar,
		View = M.require( 'View' );

	/**
	 * Progress bar
	 * @class ProgressBar
	 * @extends View
	 */
	ProgressBar = View.extend( {
		className: 'progress-bar',

		template: mw.template.compile( '<div class="value"></div>', 'hogan' ),

		/**
		 * Set the value of the progress bar in percentages
		 * @method
		 * @param {Number} value of the progress bar
		 */
		setValue: function ( value ) {
			this.$( '.value' ).css( 'width', value * 100 + '%' );
		}
	} );

	M.define( 'modules/uploads/ProgressBar', ProgressBar );

}( mw.mobileFrontend ) );
