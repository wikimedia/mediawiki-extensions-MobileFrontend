/**
 * @class mw.mobileFrontend.history
 * @singleton
*/
( function( M, $ ) {
	M.assertMode( [ 'alpha', 'app' ] );

	var
		Page = M.require( 'Page' ),
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

	function renderPage( title ) {
		new Page( { title: title, el: $( '#content_wrapper' ) } ).on( 'error', function() {
			window.location.reload(); // the page either doesn't exist or was a Special:Page so force a refresh
		} ).on( 'ready', M.reloadPage );
	}

	// do not run more than once
	function init() {
		// use wgPageName to ensure we keep the namespace prefix
		var title = mw.config.get( 'wgPageName' ),
			currentUrl = mw.util.getUrl( title, M.query );
		// initial history state does not contain title
		// run before binding to avoid nasty surprises
		History.replaceState( null, title, currentUrl + location.hash );

		// Bind to future StateChange Events
		History.Adapter.bind( window, 'statechange', function(){
			var s = History.getState(), title = s.title;
			if ( mw.config.get( 'wgMainPageTitle' ) === title ) {
				// The main page has various special cases so force a reload
				window.location = mw.util.getUrl( title );
			} else if ( currentUrl !== s.url ) {
				renderPage( title );
			}
			currentUrl = s.url;
		} );

		/**
		 * Trigger navigation to a page via javascript
		 *
		 * @param {String} pageTitle String representing the title of a page that should be loaded in the browser
		 * @param {Boolean} replaceState Replace current state instead of pushing
		 * a new one.
		 */
		function navigateToPage( title, replaceState ) {
			if ( M.isApp() ) {
				renderPage( title );
			} else {
				History[replaceState ? 'replaceState' : 'pushState']( null, title, mw.util.getUrl( title ) );
			}
		}

		/**
		 * Hijack non-namespaced links in a given container so that when clicked they are loaded via javascript
		 * By default this looks for the data attribute title (data-title).
		 * Undefined when JavaScript History API not supported
		 *
		 * @method
		 * @param {jQuery.Object} $container A container to hijack links
		 * @param {Boolean} useFuzzyHijacking When set any link any links missing a data-title attribute are hijacked if they might be links
		 * @param {Boolean} replaceState Replace current state instead of pushing
		 * a new one.
		 */
		function hijackLinks( $container, useFuzzyHijacking, replaceState ) {
			function lazyLoad( ev ) {
				ev.preventDefault();
				navigateToPage( $( this ).data( 'title' ), replaceState );
			}

			function hijackLink( $a ) {
				$a.on( 'click', lazyLoad );
			}

			// do not hijack image links, media viewer does it
			$container.find( 'a:not([class="image"])' ).each( function() {
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
			navigateToPage: navigateToPage,
			hijackLinks: hijackLinks
		};
	}

	// FIXME: use M.define()
	M.history = {
		updateQueryStringParameter: updateQueryStringParameter
	};

	if ( History.enabled && ( !M.inNamespace( 'special' ) || M.isApp() ) ) {
		$.extend( M.history, init() );
	}

} ( mw.mobileFrontend, jQuery ) );
