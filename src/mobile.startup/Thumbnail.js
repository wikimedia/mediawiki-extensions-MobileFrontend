const
	util = require( './util' ),
	View = require( './View' );

/**
 * Representation of a thumbnail
 */
class Thumbnail extends View {
	/**
	 * @param {Object} options
	 */
	constructor( options ) {
		super(
			util.extend( { isBorderBox: false }, options )
		);
	}

	/**
	 * @mixes module:mobile.startup/View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {string} defaults.filename uri decoded filename including File: prefix
	 *  associated with thumbnail
	 */
	get defaults() {
		return {
			filename: undefined
		};
	}

	/**
	 * @inheritdoc
	 */
	postRender() {
		this.options.description = this.$el.siblings( '.thumbcaption, figcaption' )
			.prop( 'innerText' ) || '';
	}

	/**
	 * Obtain description for thumbnail
	 *
	 * @return {string}
	 */
	getDescription() {
		return this.options.description;
	}

	/**
	 * Return the page title for the thumbnail
	 *
	 * @return {string}
	 */
	getFileName() {
		return this.options.filename;
	}
}

module.exports = Thumbnail;
