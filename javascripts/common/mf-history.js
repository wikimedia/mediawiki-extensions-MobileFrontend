( function( M, $ ) {

M.history = ( function() {
	var initialised = false,
		ua = window.navigator.userAgent,
		supportsHistoryApi = window.history && window.history.pushState && window.history.replaceState &&
			// bug 41407 - certain S60 devices crash when you use pushState
			!( ua.match( /Series60/ ) && ua.match( /WebKit/ ) ) &&
			// bug 41605 disable for Android 4.x phones that are not Chrome
			!( ua.match( /Android 4\./ ) && ua.match( /WebKit/ ) && !ua.match( /Chrome/ ) ),
		isDynamicPageLoadEnabled = mw.config.get( 'wgMFMode' ) === 'alpha' && supportsHistoryApi,
		currentTitle = mw.config.get( 'wgTitle' );

	/**
	 * FIXME: replace with jQuery.param()
	 * @deprecated
	 */
	function updateQueryStringParameter( url, parameter, value ) {
		var re = new RegExp( '([?|&])' + parameter + '=.*?(&|$)', 'i' ), rtn,
			separator = url.indexOf( '?' ) !== -1 ? '&' : '?';

		if ( url.match( re ) ) {
			rtn = url.replace( re, '$1' + parameter + '=' + encodeURIComponent( value ) + '$2' );
		} else {
			rtn = url + separator + parameter + '=' + value;
		}
		return rtn;
	}

	/**
	 * Generate a URL for a given page title.
	 *
	 * @param {string} title Title of the page to generate link for.
	 * @param {Object} params A mapping of query parameter names to values,
	 * e.g. { action: 'edit' }.
	 * @return {string}
	 */
	function getArticleUrl( title, params ) {
		var url = mw.config.get( 'wgArticlePath' ).replace( '$1', M.prettyEncodeTitle( title ) );
		if ( !$.isEmptyObject( params ) ) {
			url += '?' + $.param( params );
		}
		return url;
	}

	function navigateToPage( title ) {
		window.location.href = getArticleUrl( title );
	}

	// ensures the history change event fires on initial load
	function initialise( hash ) {
		if ( !initialised && hash !== '#_' && $ ) {
			initialised = true;
			M.on( 'ready', function() {
				M.emit( 'history-change', { hash: hash } );
			} );
		}
	}

	return {
		getArticleUrl: getArticleUrl,
		isDynamicPageLoadEnabled: isDynamicPageLoadEnabled,
		navigateToPage: navigateToPage,
		replaceHash: function( newHash ) {
			var hashChanged = newHash !== window.location.hash,
				id = newHash.slice( 1 ),
				hashNode = document.getElementById( id );
			if ( isDynamicPageLoadEnabled && hashChanged ) {
				window.history.replaceState( { title: currentTitle, hash: true }, currentTitle, newHash );
			} else if ( hashChanged && hashNode ) {
				hashNode.removeAttribute( 'id' );
				window.location.hash = newHash;
				hashNode.setAttribute( 'id', id );
			}
			initialise( newHash );
		},
		pushState: function( hash ) {
			var hashChanged = hash !== window.location.hash;
			if ( isDynamicPageLoadEnabled && hashChanged ) {
				window.history.pushState( { title: currentTitle, hash: true }, currentTitle, hash );
			} else if ( hashChanged ) {
				window.location.hash = hash;
			}
			initialise( hash );
		},
		supportsHistoryApi: supportsHistoryApi,
		updateQueryStringParameter: updateQueryStringParameter
	};
}() );

} ( mw.mobileFrontend, jQuery ) );
