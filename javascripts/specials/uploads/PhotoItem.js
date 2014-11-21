( function ( M ) {
	var PhotoItem,
		View = M.require( 'View' );

	/**
	 * Single photo item in gallery
	 * @class PhotoItem
	 * @extends View
	 */
	PhotoItem = View.extend( {
		template: mw.template.get( 'mobile.special.uploads.scripts', 'PhotoItem.hogan' ),
		tagName: 'li'
	} );
	M.define( 'specials/uploads/PhotoItem', PhotoItem );
}( mw.mobileFrontend ) );
