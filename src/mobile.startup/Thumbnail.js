var
	mfExtend = require( './mfExtend' ),
	util = require( './util' ),
	View = require( './View' );

/**
 * Representation of a thumbnail
 *
 * @class Thumbnail
 * @extends View
 * @param {Object} options
 */
function Thumbnail( options ) {
	View.call( this,
		util.extend( { isBorderBox: false }, options )
	);
}

mfExtend( Thumbnail, View, {
	/**
	 * @memberof Thumbnail
	 * @instance
	 * @mixes View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {string} defaults.filename uri decoded filename including File: prefix
	 *  associated with thumbnail
	 */
	defaults: {
		filename: undefined
	},
	/**
	 * @inheritdoc
	 * @memberof Thumbnail
	 * @instance
	 */
	postRender: function () {
		this.options.description = this.$el.siblings( '.thumbcaption' ).text();
	},
	/**
	 * Obtain description for thumbnail
	 * @memberof Thumbnail
	 * @instance
	 * @return {string}
	 */
	getDescription: function () {
		return this.options.description;
	},
	/**
	 * Return the page title for the thumbnail
	 * @memberof Thumbnail
	 * @instance
	 * @return {string}
	 */
	getFileName: function () {
		return this.options.filename;
	}
} );

module.exports = Thumbnail;
