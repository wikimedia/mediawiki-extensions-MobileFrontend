var View = require( '../mobile.startup/View' ),
	mfExtend = require( '../mobile.startup/mfExtend' );

/**
 * Single photo item in gallery
 * @class PhotoItem
 * @extends View
 */
function PhotoItem() {
	View.apply( this, arguments );
}

mfExtend( PhotoItem, View, {
	/**
	 * @memberof PhotoItem
	 * @instance
	 */
	template: mw.template.get( 'mobile.special.uploads.scripts', 'PhotoItem.hogan' ),
	/**
	 * @memberof PhotoItem
	 * @instance
	 */
	tagName: 'li'
} );
module.exports = PhotoItem;
