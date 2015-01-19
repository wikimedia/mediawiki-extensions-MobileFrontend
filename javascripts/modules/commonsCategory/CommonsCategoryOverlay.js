( function ( M ) {
	var Overlay = M.require( 'Overlay' ),
		PhotoList = M.require( 'modules/gallery/PhotoList' ),
		CommonsCategoryOverlay;

	/**
	 * Overlay for displaying page issues
	 * @class CommonsCategoryOverlay
	 * @extends Overlay
	 */
	CommonsCategoryOverlay = Overlay.extend( {
		/** @inheritdoc */
		postRender: function ( options ) {
			Overlay.prototype.postRender.apply( this, arguments );
			this.clearSpinner();
			new PhotoList( {
				category: options.title
			} ).appendTo( this.$( '.overlay-content' ) );
		}
	} );
	M.define( 'modules/commonsCategory/CommonsCategoryOverlay', CommonsCategoryOverlay );
}( mw.mobileFrontend ) );
