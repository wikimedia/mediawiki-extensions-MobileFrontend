( function( M, $ ) {
	M.assertMode( [ 'alpha' ] );

	var Overlay = M.require( 'Overlay' ),
		Api = M.require( 'api' ).Api,
		ImageApi, ImageOverlay, api;

	ImageApi = Api.extend( {
		initialize: function() {
			this._super();
			this._cache = {};
		},

		getThumb: function( title ) {
			var result = this._cache[title];

			if ( !result ) {
				this._cache[title] = result = $.Deferred();

				api.get( {
					action: 'query',
					prop: 'imageinfo',
					titles: title,
					iiprop: 'url',
					// request an image two times bigger than the reported screen size
					// for retina displays and zooming
					iiurlwidth: $( window ).width() * 2,
					iiurlheight: $( window ).height() * 2
				} ).done( function( resp ) {
					if ( resp.query && resp.query.pages ) {
						// FIXME: API
						var data = $.map( resp.query.pages, function( v ) { return v; } )[0].imageinfo[0];
						result.resolve( data );
					}
				} );
			}

			return result;
		}
	} );

	api = new ImageApi();

	ImageOverlay = Overlay.extend( {
		className: 'mw-mf-overlay media-viewer',
		template: M.template.get( 'modules/ImageOverlay' ),
		closeOnBack: true,

		defaults: {
			closeMsg: mw.msg( 'mobile-frontend-overlay-escape' ),
			detailsMsg: mw.msg( 'mobile-frontend-media-details' )
		},

		postRender: function( options ) {
			var self = this;
			this._super( options );

			api.getThumb( options.title ).done( function( data ) {
				self.imgRatio = data.thumbwidth / data.thumbheight;

				self.$( '.container' ).removeClass( 'loading' );
				self.$( 'img' ).attr( 'src', data.thumburl );
				self._positionImage();
				self.$( '.details a' ).attr( 'href', data.descriptionurl );

				self.$el.on( M.tapEvent( 'click' ), function() {
					self.$( '.details' ).toggleClass( 'visible' );
				} );
			} );

			$( window ).on( 'resize', $.proxy( this, '_positionImage' ) );
		},

		_positionImage: function() {
			var windowWidth = $( window ).width(),
				windowHeight = $( window ).height(),
				windowRatio = windowWidth / windowHeight;

			// display: table (which we use for vertical centering) makes the overlay
			// expand so simply setting width/height to 100% doesn't work
			if ( this.imgRatio > windowRatio ) {
				this.$( 'img' ).css( {
					width: windowWidth,
					height: 'auto'
				} );
			} else {
				this.$( 'img' ).css( {
					width: 'auto',
					height: windowHeight
				} );
			}
		}
	} );

	M.router.route( /^image-(.+)$/, function( hrefPart ) {
		// FIXME: replace hrefPart with title when we get rid of History.js
		// (which apart from slashes doesn't like dots...)
		var $a = $( 'a[href*="' + hrefPart + '"]' ), title = $a.data( 'title' );

		if ( title ) {
			new ImageOverlay( {
				title: $a.data( 'title' ),
				caption: $a.siblings( '.thumbcaption' ).text()
			} ).show();
		}
	} );

	function init( $el ) {
		$el.find( 'a.image, a.thumbimage' ).each( function() {
			var $a = $( this ),
				// FIXME: change to /[^\/]+$/ when we get rid of History.js
				match = $a.attr( 'href' ).match( /.*\/(([^\/]+)\..+)$/ );

			if ( match ) {
				$a.data( 'title', match[1] );
				$a.attr( 'href', '#image-' + match[2] );
			}
		} );

		M.router.checkRoute();
	}

	// FIXME: this should bind to only 1-2 events
	init( $( '#content' ) );
	M.on( 'page-loaded', function( page ) {
		init( page.$el );
	} );
	M.on( 'section-rendered', init );
	M.on( 'photo-loaded', init );

}( mw.mobileFrontend, jQuery ) );
