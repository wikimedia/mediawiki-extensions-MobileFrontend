( function( M, $ ) {
	M.assertMode( [ 'alpha' ] );

	var
		Page = M.require( 'page' ),
		isSpecialPage = mw.config.get( 'wgNamespaceNumber' ) === mw.config.get( 'wgNamespaceIds' ).special,
		History = window.History;

		/**
		 * Render a page in the DOM. Note this does not effect the users browser history. To do this use navigateToPage instead
		 * Note you must provide your own failure callback
		 *
		 * @param {String} url A relative or absolute url
		 * @param {String} key The query string parameter key that should be updated
		 * @param {String} value The new value of the query string parameter
		 * @return {String} the new absolute or relative url
		 */
	function updateQueryStringParameter( url, key, value ) {
		var args = url.split( '?' ),
			params = M.deParam( args[1] );
		params[key] = value;
		return args[0] + '?' + $.param( params );
	}

	// do not run more than once
	function init() {
		// initial history state does not contain title
		// run before binding to avoid nasty surprises
		History.replaceState( null, mw.config.get( 'wgTitle' ) );

		// Bind to future StateChange Events
		History.Adapter.bind( window, 'statechange', function(){
			var s = History.getState();
			new Page( { title: s.title, el: $( '#content_wrapper' ) } ).on( 'error', function() {
				window.location.reload(); // the page either doesn't exist or was a Special:Page so force a refresh
			} );
		} );

		/**
		 * Trigger navigation to a page via javascript
		 *
		 * @param {String} pageTitle String representing the title of a page that should be loaded in the browser
		 */
		function navigateToPage( title ) {
			History.pushState( null, title, M.pageApi.getPageUrl( title ) );
		}

		/**
		 * Hijack non-namespaced links in a given container so that when clicked they are loaded via javascript
		 * By default this looks for the data attribute title (data-title).
		 *
		 * @param {jQuery.object} $container A container to hijack links
		 * @param {Boolean} useFuzzyHijacking When set any link any links missing a data-title attribute are hijacked if they might be links
		 */
		function hijackLinks( $container, useFuzzyHijacking ) {
			function lazyLoad( ev ) {
				ev.preventDefault();
				navigateToPage( $( this ).data( 'title' ) );
			}

			function hijackLink( $a ) {
				$a.on( 'click', lazyLoad );
			}

			$container.find( 'a' ).each( function() {
				var $a = $( this ), title = $a.data( 'title' ),
					tooltip = $a.attr( 'title' ), namespaced, canHijack;

				if ( !title && useFuzzyHijacking ) {
					namespaced = tooltip && tooltip.indexOf( ':' ) > -1;
					canHijack = !$a.is( '.new,.external,.image' );
					if ( canHijack && tooltip && !namespaced ) {
						$a.data( 'title', tooltip );
						hijackLink( $a );
					}
				// only hijack link if possible
				} else if ( title ) {
					hijackLink( $a );
				}
			} );
		}

		return {
			hijackLinks: hijackLinks
		};
	}

	// FIXME: use M.define()
	M.history = {
		updateQueryStringParameter: updateQueryStringParameter
	};

	if ( History.enabled && !isSpecialPage ) {
		$.extend( M.history, init() );
	}

} ( mw.mobileFrontend, jQuery ) );
