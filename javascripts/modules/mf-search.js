/*global document, window, mw, navigator, clearTimeout, setTimeout */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true */
( function( M ) {
var opensearch = ( function() {
	var apiUrl = '/api.php', timer = -1, typingDelay = 500,
		urlTemplate = M.setting( 'pageUrl' ),
		numResults = 15, term, mfePrefix = M.prefix,
		message = M.message,
		search = document.getElementById(  mfePrefix + 'search' ),
		oldValue,
		$ = M.jQuery,
		blankImg = M.setting( 'shim' ),
		clearSearch = document.getElementById( 'clearsearch' ),
		focusBlurTimeout,
		u = M.utils;

	apiUrl = M.setting( 'scriptPath' ) + apiUrl;

	function removeResults( ev, silently ) {
		if ( !silently ) {
			M.history.replaceHash( '#' );
		}
		u( document.body ).removeClass( 'full-screen-search' );
	}

	function onfocus() {
		var rrd, header;
		header = document.getElementById(  mfePrefix + 'header' );

		u( document.body ).addClass( 'full-screen-search' );
		M.history.pushState( '#mw-mf-search' );
		window.scrollTo( 0, 1 );

		rrd = document.getElementById( 'remove-results' );
		if ( !rrd ) {
			rrd = document.createElement( 'button' );
			rrd.setAttribute( 'id', 'remove-results' );
			u( rrd ).addClass( 'escapeOverlay' );
			u( rrd ).bind( 'click',  removeResults );
			u( rrd ).text( message( 'remove-results' ) );
			header.insertBefore( rrd, header.firstChild );
		}
	}

	// Certain symbian devices fire blur/focus events as you mouseover an element
	// this can lead to lag where focus and blur handlers are continously called
	// this function allows us to delay them
	function waitForFocusBlur( ev, handler ) {
		var ua = navigator.userAgent;
		if( ua.match(/Android 2\./)
			|| ua.match(/Opera Mini/) ) { // timeouts do not fire on focused input in android 2 OR opera mini
			handler( ev );
		} else {
			window.clearTimeout( focusBlurTimeout );
			focusBlurTimeout = window.setTimeout(function() {
				handler( ev );
			}, 500);
		}
	}

	function createObjectArray( json ) {
		var sections = [], i, item, section,
			items = json[ 1 ] || [];
		for ( i = 0; i < items.length; i++ ) {
			item = items[i];
			section = {
				label: item,
				value: urlTemplate.replace( '$1', item )
			};
			sections.push( section );
		}
		return sections;
	}

	function htmlEntities( str ) {
		var text = document.createTextNode( str ),
			el = document.createElement( 'div' );
		el.appendChild( text );
		return el.innerHTML;
	}

	function escapeJsString( str ) {
		return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
	}

	function printMessage( msg ) {
		var results = document.getElementById( 'results' );
		results.innerHTML = '<ul class="suggestions-results" title="No Results"><li class="suggestions-result">' +
			msg + '</li></div>';
	}

	function writeResults( sections ) {
		var results = document.getElementById( 'results' ), suggestions, i,
			term, search,
			section, escapedTerm, suggestionsResult, link, label;

		search = document.getElementById(  mfePrefix + 'search' );
		term = htmlEntities( search.value );

		if ( !sections || sections.length < 1 ) {
			printMessage( message( 'mobile-frontend-search-noresults' ) );
		} else {
			if( results.firstChild ) {
				results.removeChild( results.firstChild );
			}
			suggestions = document.createElement( 'ul' );
			suggestions.className = 'suggestions-results';
			results.appendChild( suggestions );

			for ( i = 0; i < sections.length; i++ ) {
				section = sections[i];
				suggestionsResult = document.createElement( 'li' );
				suggestionsResult.setAttribute( 'title', section.label );
				suggestionsResult.className = 'suggestions-result';

				link = document.createElement( 'a' );
				link.setAttribute( 'href', section.value );
				link.setAttribute( 'title', section.label );
				link.className = 'search-result-item';
				label = document.createTextNode( section.label );
				link.appendChild( label );
				u( link ).bind( 'click', function( ev ) {
					M.history.navigateToPage( this.getAttribute( 'title' ) );
					ev.preventDefault();
					removeResults( ev );
				} );
				suggestionsResult.appendChild( link );

				if ( $ ) {
					$( window ).trigger( 'mw-mf-search-result', [ suggestionsResult, section.label ] );
				}
				suggestions.appendChild( suggestionsResult );
				// TODO: simplify the highlighting code to not use htmlEntities
				// highlight matched term
				escapedTerm = escapeJsString( term );
				link.innerHTML = link.innerHTML.replace( new RegExp( '(' + escapedTerm + ')' , 'ig'),
					'<strong>$1</strong>' );
			}
		}
	}

	function searchApi( term ) {
		u( search ).addClass( 'searching' );
		var url = apiUrl + '?action=opensearch&limit=' + numResults + '&namespace=0&format=json&search=' + term;
		u.ajax( { url: url,
			dataType: 'json',
			success: function( data ) {
				if( u( document.body ).hasClass( 'full-screen-search' ) ) {
					writeResults( createObjectArray( data ) );
					u( search ).removeClass( 'searching' );
				}
			}
			} );
	}

	function performSearch( ev ) {
		if( ev ) {
			ev.preventDefault();
		}
		clearTimeout( timer );
		term = search.value;
		if ( term.length > 1 ) {
			term = encodeURIComponent( term );
			timer = setTimeout( function () { searchApi( term ); }, typingDelay );
		}
	}

	function blurSearch(ev) {
		performSearch( ev ); // for opera mini etc
	}

	function enhanceElements() {
		var sb = document.getElementById(  mfePrefix + 'searchForm' ),
			interval = window.setInterval(function() {
			if( !search ) {
				return window.clearInterval( interval );
			}
			var value = search.value;
			if( value.length > 1 && value !== oldValue ) {
				oldValue = value;
				u( sb ).addClass( 'notEmpty' );
				performSearch();
			} else if( !value ) {
				u( sb ).removeClass( 'notEmpty' );
			}
		}, typingDelay);

		u( search ).bind( 'focus',
			function( ev ) {
				waitForFocusBlur( ev, onfocus );
			});
		u( search ).bind( 'blur',
			function( ev ) {
				waitForFocusBlur( ev, blurSearch );
			});
		// ensure pressing enter triggers full text search (bug 37945)
		u( search ).bind( 'keyup', function( ev ) {
			if ( ev.keyCode && ev.keyCode === 13 ) {
				sb.submit();
			}
		} );
		u( document.documentElement ).addClass( 'jsSearch' );
	}

	function initClearSearch() {
		var clearSearch = document.getElementById(  mfePrefix + 'clearsearch' ),
			results = document.getElementById( 'results' ),
			search = document.getElementById( mfePrefix + 'search' );

		function clearSearchBox( event ) {
			// clicking clear on some browsers triggers blur event on search
			// when search value empty string hides results
			window.setTimeout( function() {
				search.value = '';
			}, 100 );
			results.innerHTML = '';
			event.preventDefault();
		}

		function onFocusHandler() {
			search.select();
		}
		u( clearSearch ).bind( 'mousedown', clearSearchBox );
		u( search ).bind( 'click', onFocusHandler );
	}

	function initSearch() {
		enhanceElements();
		if( document.activeElement && document.activeElement.id === 'search' ) {
			onfocus();
		}
		function hideKeyboard() {
			document.getElementById( 'search' ).blur();
		}
		document.getElementById( 'results' ).ontouchstart = hideKeyboard;
		printMessage( message( 'mobile-frontend-search-help' ) );
		initClearSearch();
		u( window ).bind( 'mw-mf-history-change', function( ev, curPage ) {
			if ( curPage.hash === '#mw-mf-search' ) {
				onfocus();
			} else {
				removeResults( ev, true );
			}
		} );
	}

	function init() {
		if ( document.getElementById( 'results' ) && document.getElementById( 'mw-mf-search' ) ) {
			initSearch();
		}
	}

	return {
		init: init,
		initClearSearch: initClearSearch,
		writeResults: writeResults,
		createObjectArray: createObjectArray,
		removeResults: removeResults
	};

}());

if ( typeof JSON !== 'undefined' ) {
	M.registerModule( 'opensearch', opensearch );
}

}( mw.mobileFrontend ));
