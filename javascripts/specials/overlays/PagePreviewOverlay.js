// FIXME: Move this file somewhere more logical
( function( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );
	var Overlay = M.require( 'Overlay' ),
		MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' ),
		api = M.require( 'api' ),
		ua = window.navigator.userAgent,
		device = 'unknown',
		Page = M.require( 'Page' ),
		LoadingOverlay = M.require( 'LoadingOverlay' ),
		PagePreviewOverlay = Overlay.extend( {
			closeOnBack: true,
			defaults: {
				source: 'nearby'
			},
			template: M.template.get( 'overlays/pagePreview' ),
			initialize: function( options ) {
				var self = this, loader = new LoadingOverlay(),
					endpoint = options.endpoint;
				this._super( options );
				loader.show();
				M.pageApi.getPage( options.title, options.endpoint, true ).done( function( page ) {
					options.page = new Page( page );
					// FIXME [API]: This additional ajax request should be unnecessary.
					api.get( {
							action : 'query',
							prop: 'pageimages',
							piprop: 'thumbnail',
							// keep consistent with Special:Watchlist::THUMB_SIZE
							pithumbsize: 150,
							titles: options.title
						}, {
							url: endpoint, dataType: endpoint ? 'jsonp' : 'json'
						} ).done( function ( resp ) {
							var thumb;
							// FIXME [API] more terrible MediaWiki API fun
							if ( resp.query && resp.query.pages ) {
								thumb = $.map( resp.query.pages, function( page ) {
									return page;
								} )[0].thumbnail;
								if ( thumb ) {
									options.imageUrl = thumb.source;
									options.imgClass = thumb.width > thumb.height ? 'listThumbH' : 'listThumbV';
								} else {
									options.imgClass = 'needsPhoto';
								}
							} else {
								options.imgClass = 'needsPhoto';
							}
							loader.hide();
							self.render( options ).show();
						} );
				} ).fail( function() {
					loader.hide(); // FIXME: do something more meaningful e.g. error overlay
				} );
			},
			preRender: function( options ) {
				if ( !options.page ) {
					return;
				}
				var directionUrl;
				options.heading = options.page.title;
				options.preview = options.page.lead;
				options.url = mw.util.wikiGetlink( options.heading );
				options.readMoreLink = mw.msg( 'mobile-frontend-nearby-link' );

				if ( options.latLngString ) {
					// Yeeyyy no standards!
					// FIXME: would be nice to provide an opensource alternative
					if ( device === 'iphone' ) {
						directionUrl = 'http://maps.apple.com/?daddr=' + options.latLngString;
					} else if ( device === 'android' ) {
						directionUrl = 'geo:' + options.latLngString + '?q=' + options.latLngString + '(' + encodeURIComponent( options.heading ) + ')&z=20';
					} else if ( device === 'wp' ) {
						directionUrl = 'maps:' + options.latLngString;
					} // FIXME: what in other cases?!

					if ( directionUrl ) {
						options.directionUrl = directionUrl;
						options.directionLabel = mw.msg( 'mobile-frontend-nearby-directions' );
					}
				}
			},
			postRender: function( options ) {
				if ( !options.page ) {
					return;
				}
				var $preview, nodes;
				this._super( options );
				$preview = this.$( '.preview' );
				// Remove tables, infoboxes, navboxes, message boxes, hatnotes, and images.
				$preview.find( 'table, .dablink, .rellink, .thumb' ).remove();
				// FIXME: IMO meta data should remain hidden from output
				// Build an array of content nodes, excluding coordinates
				nodes = $preview.find( 'p, div' ).map( function( i, el ) {
					if ( $( el ).find( '#coordinates' ).length === 0 ) {
						return el;
					}
				} );
				$preview.empty();
				// Display the first content node
				$preview.append( nodes[0] );
				MobileWebClickTracking.hijackLink( this.$( '.read-in-full' ), options.source + '-view-full' );
			}
		} );

	if ( ua.match( /OS [0-9]+_[0-9]+ like Mac OS X/ ) ) {
		device = 'iphone';
	} else if ( ua.match( /Android/ ) ) {
		device = 'android';
	} else if ( ua.match( /Windows Phone/ ) ) {
		device = 'wp';
	}

	M.define( 'PagePreviewOverlay', PagePreviewOverlay );
	M.router.route( /^preview\/(.*)\/(.*)\/(.*)$/, function( source, latLngString, title ) {
		// FIXME: API doesn't return pageimage or longitude latitude properties (yet)
		new PagePreviewOverlay( {
			title: title,
			latLngString: latLngString,
			source: source,
			endpoint: mw.config.get( 'wgMFNearbyEndpoint' )
		} );
	} );
}( mw.mobileFrontend, jQuery ) );
