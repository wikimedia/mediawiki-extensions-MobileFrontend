var
	View = require( '../mobile.startup/View' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	util = require( '../mobile.startup/util' );

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
	template: util.template( `
<a href="{{descriptionUrl}}" alt="{{description}}" class="image">
	<img src="{{url}}" width="{{width}}">
</a>
<p class="thumbcaption">{{description}}</p>
	` ),
	/**
	 * @memberof PhotoItem
	 * @instance
	 */
	tagName: 'li'
} );
module.exports = PhotoItem;
