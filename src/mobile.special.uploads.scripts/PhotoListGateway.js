var util = require( '../mobile.startup/util' );

/**
 * API for retrieving gallery photos
 * @class PhotoListGateway
 *
 * @param {Object} options Configuration options
 * @param {mw.Api} options.api
 * @param {string} options.url for overriding default URI for API queries
 */
function PhotoListGateway( options ) {
	this.api = options.api;
	this.url = options.url;
	this.username = options.username;
	this.category = options.category;
	this.limit = 10;
	this.continueParams = {
		continue: ''
	};
	this.canContinue = true;
}

/**
 * Returns a description based on the file name using
 * a regular expression that strips the file type suffix,
 * namespace prefix and any
 * date suffix in format YYYY-MM-DD HH-MM
 * @memberof PhotoListGateway
 * @instance
 * @private
 * @param {string} title Title of file
 * @return {string} Description for file
 */
function getDescription( title ) {
	title = title.replace( /\.[^. ]+$/, '' ); // replace filename suffix
	// strip namespace: prefix and date suffix from remainder
	return title.replace( /^[^:]*:/, '' )
		.replace( / \d{4}-\d{1,2}-\d{1,2} \d{1,2}-\d{1,2}$/, '' );
}

PhotoListGateway.prototype = {
	/**
	 * Returns the value in pixels of a medium thumbnail
	 * @memberof PhotoListGateway
	 * @instance
	 * @return {number}
	 */
	getWidth: function () {
		const config = mw.config.get( 'wgMFThumbnailSizes' ) || {};
		return config.small;
	},
	/**
	 * Extracts image data from api response
	 * @memberof PhotoListGateway
	 * @instance
	 * @private
	 * @param {Object} page as returned by api request
	 * @return {Object} describing image.
	 */
	_getImageDataFromPage: function ( page ) {
		var img = page.imageinfo[0];
		return {
			url: img.thumburl,
			title: page.title,
			timestamp: img.timestamp,
			description: getDescription( page.title ),
			descriptionUrl: img.descriptionurl
		};
	},
	/**
	 * Get the associated query needed to retrieve images from API based
	 * on currently configured options.
	 * @memberof PhotoListGateway
	 * @instance
	 * @return {Object}
	 */
	getQuery: function () {
		var query = util.extend( {
			action: 'query',
			prop: 'imageinfo',
			// FIXME: [API] have to request timestamp since api returns an object
			// rather than an array thus we need a way to sort
			iiprop: 'url|timestamp',
			iiurlwidth: this.getWidth()
		}, this.continueParams );

		if ( this.username ) {
			util.extend( query, {
				generator: 'allimages',
				gaiuser: this.username,
				gaisort: 'timestamp',
				gaidir: 'descending',
				gailimit: this.limit
			} );
		} else if ( this.category ) {
			util.extend( query, {
				generator: 'categorymembers',
				gcmtitle: 'Category:' + this.category,
				gcmtype: 'file',
				// FIXME [API] a lot of duplication follows due to the silly way generators work
				gcmdir: 'descending',
				gcmlimit: this.limit
			} );
		}

		if ( this.url ) {
			// A foreign api is being accessed! Enable anonymous CORS queries!
			query.origin = '*';
		}
		return query;
	},
	/**
	 * Request photos beginning with the current value of endTimestamp
	 * @memberof PhotoListGateway
	 * @instance
	 * @return {jQuery.Deferred} where parameter is a list of JavaScript
	 *  objects describing an image.
	 */
	getPhotos: function () {
		var self = this;

		return this.api.ajax( this.getQuery(), { url: this.url } ).then( function ( resp ) {
			var photos = [];
			if ( resp.query && resp.query.pages ) {
				// FIXME: [API] in an ideal world imageData would be a sorted array
				// but it is a map of {[id]: page}
				photos = Object.keys( resp.query.pages ).map( function ( id ) {
					return self._getImageDataFromPage( resp.query.pages[id] );
				} ).sort( function ( a, b ) {
					return a.timestamp < b.timestamp ? 1 : -1;
				} );
			}

			if ( resp.continue !== undefined ) {
				self.continueParams = resp.continue;
			} else {
				self.canContinue = false;
			}

			return {
				canContinue: self.canContinue,
				// FIXME: Should reply with a list of PhotoItem or Photo classes.
				photos: photos
			};
		} );
	}
};

PhotoListGateway.test = {
	getDescription: getDescription
};

module.exports = PhotoListGateway;
