( function ( M ) {
	var PhotoItem,
		View = M.require( 'mobile.view/View' );

	/**
	 * Single photo item in gallery
	 * @class PhotoItem
	 * @extends View
	 */
	PhotoItem = View.extend( {
		template: mw.template.get( 'mobile.gallery', 'PhotoItem.hogan' ),
		tagName: 'li'
	} );
	M.define( 'mobile.gallery/PhotoItem', PhotoItem ).deprecate( 'modules/gallery/PhotoItem' );
}( mw.mobileFrontend ) );
