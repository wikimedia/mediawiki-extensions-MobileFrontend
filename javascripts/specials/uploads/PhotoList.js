( function ( M, $ ) {
	var PhotoList,
		icons = M.require( 'icons' ),
		UserGalleryApi = M.require( 'specials/uploads/UserGalleryApi' ),
		PhotoItem = M.require( 'specials/uploads/PhotoItem' ),
		View = M.require( 'View' );

	/**
	 * Creates a list of photo items
	 * @class PhotoList
	 * @uses UserGalleryApi
	 * @uses PhotoItem
	 * @extends View
	 */
	PhotoList = View.extend( {
		template: mw.template.get( 'mobile.special.uploads.scripts', 'PhotoList.hogan' ),
		defaults: {
			spinner: icons.spinner().toHtmlString()
		},
		initialize: function ( options ) {
			// how close a spinner needs to be to the viewport to trigger loading (px)
			this.threshold = 1000;
			this.shouldLoad = true;
			this.api = new UserGalleryApi( {
				username: options.username
			} );
			View.prototype.initialize.apply( this, arguments );
		},
		postRender: function () {
			this.$end = this.$( '.end' );
			this.$list = this.$( 'ul' );

			this._loadPhotos();
			// FIXME: Consider using setInterval instead or some sort of dethrottling/debouncing to avoid performance
			// degradation
			// e.g. http://benalman.com/projects/jquery-throttle-debounce-plugin/
			$( window ).on( 'scroll', $.proxy( this, '_loadPhotos' ) );
		},
		isEmpty: function () {
			return this.$list.find( 'li' ).length === 0;
		},
		showEmptyMessage: function () {
			$( '<p class="content empty">' ).text( mw.msg( 'mobile-frontend-donate-image-nouploads' ) )
				.insertBefore( this.$list );
		},
		hideEmptyMessage: function () {
			this.$( '.empty' ).remove();
		},
		prependPhoto: function ( photoData ) {
			photoData.width = this.api.getWidth();
			var photoItem = new PhotoItem( photoData ).prependTo( this.$list );
			this.hideEmptyMessage();
			M.emit( 'photo-loaded', photoItem.$el );
		},
		appendPhoto: function ( photoData ) {
			var photoItem = new PhotoItem( photoData ).appendTo( this.$list );
			this.hideEmptyMessage();
			M.emit( 'photo-loaded', photoItem.$el );
		},
		_isEndNear: function () {
			var scrollBottom = $( window ).scrollTop() + $( window ).height();
			return scrollBottom + this.threshold > this.$end.offset().top;
		},
		_loadPhotos: function () {
			var self = this;

			if ( this.shouldLoad && this._isEndNear() ) {
				// don't try to load more until current request is finished
				this.shouldLoad = false;

				this.api.getPhotos().done( function ( photos ) {
					if ( photos.length ) {
						$.each( photos, function () {
							self.appendPhoto( this );
						} );
						// try loading more when end is near only if we got photos last time
						self.shouldLoad = true;
					} else {
						self.$end.remove();
						if ( self.isEmpty() ) {
							self.emit( 'empty' );
							self.showEmptyMessage();
						}
					}
				} ).fail( function () {
					// try loading again if request failed
					self.shouldLoad = true;
				} );
			}
		}
	} );

	M.define( 'specials/uploads/PhotoList', PhotoList );
}( mw.mobileFrontend, jQuery ) );
