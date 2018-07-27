( function ( M ) {
	var View = M.require( 'mobile.startup/View' );

	/**
	 * Single photo item in gallery
	 * @class PhotoItem
	 * @extends View
	 */
	function PhotoItem() {
		View.apply( this, arguments );
	}

	OO.mfExtend( PhotoItem, View, {
		/**
		 * @memberof PhotoItem
		 * @instance
		 */
		template: mw.template.get( 'mobile.gallery', 'PhotoItem.hogan' ),
		/**
		 * @memberof PhotoItem
		 * @instance
		 */
		tagName: 'li'
	} );
	M.define( 'mobile.gallery/PhotoItem', PhotoItem );
}( mw.mobileFrontend ) );
