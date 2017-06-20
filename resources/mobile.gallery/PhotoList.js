( function ( M, $ ) {
	var icons = M.require( 'mobile.startup/icons' ),
		PhotoListGateway = M.require( 'mobile.gallery/PhotoListGateway' ),
		PhotoItem = M.require( 'mobile.gallery/PhotoItem' ),
		InfiniteScroll = M.require( 'mobile.infiniteScroll/InfiniteScroll' ),
		View = M.require( 'mobile.startup/View' );

	/**
	 * Creates a list of photo items
	 * @class PhotoList
	 * @uses PhotoListApi
	 * @uses PhotoItem
	 * @uses InfiniteScroll
	 * @extends View
	 *
	 * @constructor
	 * @param {Object} options Configuration options
	 */
	function PhotoList( options ) {
		var gatewayOptions = {
			api: options.api
		};

		if ( options.username ) {
			gatewayOptions.username = options.username;
		} else if ( options.category ) {
			gatewayOptions.category = options.category;
		}
		this.gateway = new PhotoListGateway( gatewayOptions );
		// Set up infinite scroll
		this.infiniteScroll = new InfiniteScroll( 1000 );
		this.infiniteScroll.on( 'load', $.proxy( this, '_loadPhotos' ) );
		View.call( this, options );
	}

	OO.mfExtend( PhotoList, View, {
		template: mw.template.get( 'mobile.gallery', 'PhotoList.hogan' ),
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {string} defaults.spinner HTML of the spinner icon.
		 * @cfg {mw.Api} defaults.api instance of an api
		 */
		defaults: {
			spinner: icons.spinner().toHtmlString()
		},
		/** @inheritdoc */
		preRender: function () {
			// Disable until we've got the list rendered
			this.infiniteScroll.setElement( this.$el );
			this.infiniteScroll.disable();
		},
		/** @inheritdoc */
		postRender: function () {
			this.$end = this.$( '.end' );
			this.$list = this.$( 'ul' );

			this._loadPhotos();
		},
		/**
		 * Check to see if the current view is an empty list.
		 * @method
		 * @return {boolean} whether no images have been rendered
		 */
		isEmpty: function () {
			return this.$list.find( 'li' ).length === 0;
		},
		/**
		 * Renders an empty message prior to the list.
		 * FIXME: Should be handled in template, not a method.
		 * @method
		 */
		showEmptyMessage: function () {
			$( '<p class="content empty">' ).text( mw.msg( 'mobile-frontend-donate-image-nouploads' ) )
				.insertBefore( this.$list );
		},
		/**
		 * Hides the message saying the list is empty
		 * FIXME: Should be handled in template, not a method.
		 * @method
		 */
		hideEmptyMessage: function () {
			this.$( '.empty' ).remove();
		},
		/**
		 * Append a photo to the view.
		 * @method
		 * @param {Object} photoData Options describing a new {PhotoItem}
		 */
		appendPhoto: function ( photoData ) {
			new PhotoItem( photoData ).appendTo( this.$list );
			this.hideEmptyMessage();
		},
		/**
		 * Load photos into the view using {{PhotoListApi}} when the end is near
		 * and no current API requests are underway.
		 * @method
		 * @private
		 */
		_loadPhotos: function () {
			var self = this;

			this.gateway.getPhotos().done( function ( photos ) {
				if ( photos.length ) {
					photos.forEach( function ( photo ) {
						self.appendPhoto( photo );
					} );
					// try loading more when end is near only if we got photos last time
					self.infiniteScroll.enable();
				} else {
					self.$end.remove();
					if ( self.isEmpty() ) {
						self.emit( 'empty' );
						self.showEmptyMessage();
					}
				}
			} ).fail( function () {
				// try loading again if request failed
				self.infiniteScroll.enable();
			} );
		}
	} );

	M.define( 'mobile.gallery/PhotoList', PhotoList );
}( mw.mobileFrontend, jQuery ) );
