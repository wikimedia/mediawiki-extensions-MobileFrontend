( function ( M ) {
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
		this.infiniteScroll.on( 'load', this._loadPhotos.bind( this ) );
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
			this.parseHTML( '<p class="content empty">' ).text( mw.msg( 'mobile-frontend-donate-image-nouploads' ) )
				.insertBefore( this.$list );
		},
		/**
		 * Hides the message saying the list is empty
		 * FIXME: Should be handled in template, not a method.
		 * @method
		 */
		hideEmptyMessage: function () {
			this.$( '.empty' ).hide();
		},
		/**
		 * Shows loading spinner
		 * @method
		 */
		showSpinner: function () {
			this.$end.show();
		},
		/**
		 * Hides loading spinner
		 * @method
		 */
		hideSpinner: function () {
			this.$end.hide();
		},
		/**
		 * Shows/hides empty state if PhotoList is empty.
		 * @method
		 */
		updateEmptyUI: function () {
			if ( this.isEmpty() ) {
				this.showEmptyMessage();
			} else {
				this.hideEmptyMessage();
			}
		},
		/**
		 * Append an array of photos to the view.
		 * @method
		 * @param {Array} photosData Array of objects describing a new {PhotoItem}
		 */
		appendPhotos: function ( photosData ) {
			var self = this;
			photosData.forEach( function ( photo ) {
				new PhotoItem( photo ).appendTo( self.$list );
			} );
		},
		/**
		 * Enables infinite scroll if it's disabled
		 * @method
		 */
		enableScroll: function () {
			if ( this.infiniteScroll.enabled === false ) {
				this.infiniteScroll.enable();
			}
		},
		/**
		 * Load photos into the view using {{PhotoListApi}} when the end is near
		 * and no current API requests are underway.
		 * @method
		 * @private
		 */
		_loadPhotos: function () {
			var self = this;

			self.showSpinner();

			this.gateway.getPhotos().then( function ( response ) {
				var photos = response.photos || [],
					canContinue = response.canContinue;

				self.appendPhotos( photos );
				self.updateEmptyUI();
				if ( canContinue ) {
					self.enableScroll();
				}

				self.hideSpinner();

			} ).catch( function () {
				self.updateEmptyUI();
				self.hideSpinner();

				// try loading again if request failed
				self.enableScroll();
			} );
		}
	} );

	M.define( 'mobile.gallery/PhotoList', PhotoList );
}( mw.mobileFrontend ) );
