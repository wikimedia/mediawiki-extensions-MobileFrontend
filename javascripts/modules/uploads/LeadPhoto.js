( function ( M ) {

	var LeadPhoto,
		View = M.require( 'View' );

	/**
	 * Class for showing lead photo
	 * @class LeadPhoto
	 * @extends View
	 */
	LeadPhoto = View.extend( {
		template: mw.template.get( 'mobile.uploads', 'LeadPhoto.hogan' ),

		/**
		 * Applies slide down animation when showing the view.
		 *
		 * @inheritdoc
		 */
		animate: function () {
			this.$el.hide().slideDown();
		}
	} );

	M.define( 'modules/uploads/LeadPhoto', LeadPhoto );

}( mw.mobileFrontend ) );
