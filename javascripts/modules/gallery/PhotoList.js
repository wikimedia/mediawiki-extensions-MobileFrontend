( function ( M, $ ) {
	var PhotoList,
		icons = M.require( 'icons' ),
		PhotoListApi = M.require( 'modules/gallery/PhotoListApi' ),
		PhotoItem = M.require( 'modules/gallery/PhotoItem' ),
		InfiniteScroll = M.require( 'InfiniteScroll' ),
		View = M.require( 'View' );

	/**
	 * Creates a list of photo items
	 * @class PhotoList
	 * @uses PhotoListApi
	 * @uses PhotoItem
	 * @uses InfiniteScroll
	 * @extends View
	 */
	PhotoList = View.extend( {
		template: mw.template.get( 'mobile.gallery', 'PhotoList.hogan' ),
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} HTML of the spinner icon.
		 */
		defaults: {
			spinner: icons.spinner().toHtmlString()
		},
		/** @inheritdoc */
		initialize: function ( options ) {
			var apiOptions;

			if ( options.username ) {
				apiOptions = {
					username: options.username
				};
			} else if ( options.category ) {
				apiOptions = {
					category: options.category
				};
			} else {
				apiOptions = {};
			}
			this.api = new PhotoListApi( apiOptions );
			// Set up infinite scroll
			this.infiniteScroll = new InfiniteScroll( 1000 );
			this.infiniteScroll.on( 'load', $.proxy( this, '_loadPhotos' ) );
			View.prototype.initialize.apply( this, arguments );
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
		 * @return {Boolean} whether no images have been rendered
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
		 * Prepend a photo to the view.
		 * @method
		 * @param {Object} photoData Options describing a new {PhotoItem}
		 * FIXME: Code duplication with PhotoList::appendPhoto
		 */
		prependPhoto: function ( photoData ) {
			photoData.width = this.api.getWidth();
			var photoItem = new PhotoItem( photoData ).prependTo( this.$list );
			this.hideEmptyMessage();
			M.emit( 'photo-loaded', photoItem.$el );
		},
		/**
		 * Append a photo to the view.
		 * @method
		 * @param {Object} photoData Options describing a new {PhotoItem}
		 */
		appendPhoto: function ( photoData ) {
			var photoItem = new PhotoItem( photoData ).appendTo( this.$list );
			this.hideEmptyMessage();
			/**
			 * @event photo-loaded
			 * @param {jQuery.Object} element belonging to view
			 * Fired when a new {PhotoItem} has been added to the current view.
			 */
			M.emit( 'photo-loaded', photoItem.$el );
		},
		/**
		 * Load photos into the view using {{PhotoListApi}} when the end is near
		 * and no current API requests are underway.
		 * @method
		 * @private
		 */
		_loadPhotos: function () {
			var self = this;

			this.api.getPhotos().done( function ( photos ) {
				if ( photos.length ) {
					$.each( photos, function ( i, photo ) {
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

	M.define( 'modules/gallery/PhotoList', PhotoList );
}( mw.mobileFrontend, jQuery ) );
