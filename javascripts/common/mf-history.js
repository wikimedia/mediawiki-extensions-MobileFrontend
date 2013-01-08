( function( M ) {

M.history = ( function() {
	var initialised = false,
		$ = M.jQuery,
		inBeta = M.getConfig( 'beta', false ),
		ua = window.navigator.userAgent,
		supportsHistoryApi = window.history && window.history.pushState && window.history.replaceState && inBeta &&
			// bug 41407 - certain S60 devices crash when you use pushState
			!( ua.match( /Series60/ ) && ua.match( /WebKit/ ) ) &&
			// bug 41605 disable for Android 4.x phones that are not Chrome
			!( ua.match( /Android 4\./ ) && ua.match( /WebKit/ ) && !ua.match( /Chrome/ ) ),
		currentTitle = M.getConfig( 'title', '' ),
		URL_TEMPLATE = M.getConfig( 'pageUrl', '' ),
		navigateToPage = function( title ) {
			window.location.href = URL_TEMPLATE.replace( '$1', M.prettyEncodeTitle( title ) );
		};

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

	function getArticleUrl( title ) {
		var search = window.location.search;
		search = updateQueryStringParameter( search, 'welcome', false );
		return URL_TEMPLATE.replace( '$1', M.prettyEncodeTitle( title ) ) + search;
	}

	// ensures the history change event fires on initial load
	function initialise( hash ) {
		if ( !initialised && hash !== '#_' && $ ) {
			initialised = true;
			$( window ).bind( 'mw-mf-ready', function() {
				$( window ).trigger( 'mw-mf-history-change', [ { hash: hash } ] );
			} );
		}
	}

	return {
		getArticleUrl: getArticleUrl,
		navigateToPage: navigateToPage,
		replaceHash: function( newHash ) {
			var hashChanged = newHash !== window.location.hash,
				id = newHash.slice( 1 ),
				hashNode = document.getElementById( id );
			if ( supportsHistoryApi && hashChanged ) {
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
			if ( supportsHistoryApi && hashChanged ) {
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

} ( mw.mobileFrontend ) );
