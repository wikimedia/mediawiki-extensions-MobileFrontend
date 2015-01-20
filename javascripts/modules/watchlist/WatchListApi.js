/**
 * API for WatchList
 * @extends Api
 * @class WatchListApi
 */
( function ( M, $ ) {

	var WatchListApi,
		time = M.require( 'modules/lastEdited/time' ),
		Api = M.require( 'api' ).Api;

	/**
	 * @class WatchListApi
	 * @extends Api
	 */
	WatchListApi = Api.extend( {
		/** @inheritdoc */
		initialize: function ( lastTitle ) {
			Api.prototype.initialize.apply( this, arguments );
			// Try to keep it in sync with SpecialMobileWatchlist::LIMIT (php)
			this.limit = 50;

			// If we initialize from HTML, we will get in lastTitle the last title
			// from the list to start requesting from that. Construct the `next`
			// value from such title.
			if ( lastTitle ) {
				this.next = '0|' + lastTitle.replace( / /g, '_' );
				this.nextByLastItem = true;
			} else {
				this.next = '';
				this.nextByLastItem = false;
			}
		},
		/**
		 * Load the list of items on the watchlist
		 * @returns {jQuery.Deferred}
		 */
		load: function () {
			if ( this.next === false ) {
				// console.log( 'End of list' );
				return $.Deferred();
			}
			var self = this,
				params = {
					action: 'query',
					prop: 'pageimages|info',
					piprop: 'thumbnail',
					pithumbsize: mw.config.get( 'wgMFThumbnailSizes' ).tiny,
					format: 'json',
					generator: 'watchlistraw',
					gwrnamespace: '0',
					gwrlimit: this.limit
				};
			if ( this.next ) {
				params.gwrcontinue = this.next;
				// If we are calling the api from the last item of the previous page
				// (like the first time when grabbing the last title from the HTML),
				// then request one extra element (make room for that last title) which
				// will be removed later when parsing data.
				if ( this.nextByLastItem ) {
					params.gwrlimit += 1;
				}
			}
			return this.get( params, {
				url: this.apiUrl
			} ).then( function ( data ) {
				if (
					data[ 'query-continue' ] &&
					data[ 'query-continue' ].watchlistraw
				) {
					self.next = data[ 'query-continue' ].watchlistraw.gwrcontinue;
				} else {
					self.next = false;
				}
				return self.parseData( data );
			} );
		},

		/**
		 * Parse api response data into pagelist item format
		 * @param {Object} data
		 */
		parseData: function ( data ) {
			// Convert the map to an Array.
			var pages = $.map( data.query.pages, function ( page ) {
					return page;
				} );

			// Sort results alphabetically (the api map doesn't have any order). The
			// watchlist is ordered alphabetically right now.
			pages.sort( function ( p1, p2 ) {
				return p1.title === p2.title ? 0 : ( p1.title < p2.title ? -1 : 1 );
			} );

			// If we requested from the last item of the previous page, we shall
			// remove the first result (to avoid it being repeated)
			if ( this.nextByLastItem ) {
				pages = pages.slice( 1 );
				this.nextByLastItem = false;
			}

			// Transform the items to a sensible format
			return $.map( pages, function ( item ) {
				var delta, msgId, thumb, data,
					pageimageClass = 'list-thumb-none list-thumb-x',
					listThumbStyleAttribute = '';

				if ( item.thumbnail ) {
					thumb = item.thumbnail;
					listThumbStyleAttribute = 'background-image: url(' + thumb.source + ')';
					pageimageClass = thumb.width > thumb.height ? 'list-thumb-y' : 'list-thumb-x';
				}

				// page may or may not exist.
				if ( item.touched ) {
					// work out delta in seconds
					delta = time.timeAgo( ( new Date() - new Date( item.touched ) ) / 1000 );
					if ( $.inArray( delta.unit, [ 'days', 'months', 'years' ] ) > -1 ) {
						msgId = 'mobile-frontend-' + delta.unit + '-ago';
					} else {
						msgId = delta.unit + '-ago';
					}
				}

				data = {
					heading: item.title,
					id: item.pageid,
					listThumbStyleAttribute: listThumbStyleAttribute,
					pageimageClass: pageimageClass,
					title: item.title,
					url: mw.util.getUrl( item.title ),
					thumbnail: item.thumbnail
				};
				if ( msgId ) {
					data.lastModified = mw.msg( 'mobile-frontend-watchlist-modified',
						mw.msg( msgId, delta.value ) );
					data.additionalClasses = 'new';
				}
				return data;
			} );
		}

	} );

	M.define( 'modules/watchlist/WatchListApi', WatchListApi );

}( mw.mobileFrontend, jQuery ) );
