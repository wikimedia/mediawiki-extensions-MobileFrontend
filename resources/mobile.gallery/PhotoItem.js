( function ( M ) {
	var View = M.require( 'mobile.view/View' );

	/**
	 * Single photo item in gallery
	 * @class PhotoItem
	 * @extends View
	 */
	function PhotoItem() {
		View.apply( this, arguments );
	}

	OO.mfExtend( PhotoItem, View, {
		template: mw.template.get( 'mobile.gallery', 'PhotoItem.hogan' ),
		tagName: 'li'
	} );
	M.define( 'mobile.gallery/PhotoItem', PhotoItem );
}( mw.mobileFrontend ) );
