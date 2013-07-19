( function( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );
	var Overlay = M.require( 'Overlay' ),
		ua = window.navigator.userAgent,
		device = 'unknown',
		Page = M.require( 'page' ),
		LoadingOverlay = Overlay.extend( {
			defaults: {
				msg: mw.msg( 'mobile-frontend-ajax-preview-loading' )
			},
			template: M.template.get( 'overlays/loading' )
		} ),
		PagePreviewOverlay = Overlay.extend( {
			template: M.template.get( 'overlays/pagePreview' ),
			preRender: function( options ) {
				var directionUrl;
				options.heading = options.page.title;
				options.preview = options.page.lead;
				options.url = M.history.getArticleUrl( options.heading );
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
			}
		} ),
		module = M.require( 'nearby' ),
		endpoint = module.endpoint;

	if ( ua.match( /OS [0-9]+_[0-9]+ like Mac OS X/ ) ) {
		device = 'iphone';
	} else if ( ua.match( /Android/ ) ) {
		device = 'android';
	} else if ( ua.match( /Windows Phone/ ) ) {
		device = 'wp';
	}

	$( function() {
		// FIXME: temporary code, replace if previews get to stable or are removed
		module.getOverlay().openPage = function( ev ) {
			ev.preventDefault();
			var loader = new LoadingOverlay(),
				$a = $( ev.currentTarget ),
				title = $a.find( 'h2' ).text();
			loader.show();

			M.history.retrievePage( title, endpoint, true ).done( function( page ) {
				var preview = new PagePreviewOverlay( { page: new Page( page ),
					latLngString: $a.data( 'latlng' ),
					img: $( '<div>' ).append( $a.find( '.listThumb' ).clone() ).html() } );
				loader.hide();
				preview.show();
			} ).fail( function() {
				loader.hide(); // FIXME: do something more meaningful e.g. error overlay
			} );
		};
	} );
}( mw.mobileFrontend, jQuery ) );
