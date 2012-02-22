/*global document, window, MobileFrontend, navigator, placeholder */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
MobileFrontend.opensearch = (function() {
	var apiUrl = '/api.php', timer = -1, typingDelay = 500,
		numResults = 15, term,
		results = document.getElementById( 'results' ),
		search = document.getElementById( 'search' ),
		sq = document.getElementById( 'sq' ),
		sb = document.getElementById( 'searchbox' ),
		logo = document.getElementById( 'logo' ),
		goButton = document.getElementById( 'goButton' ),
		content = document.getElementById( 'content' ),
		footer = document.getElementById( 'footer' ),
		zeroRatedBanner = document.getElementById( 'zero-rated-banner' ) ||
			document.getElementById( 'zero-rated-banner-red' ),
		clearSearch = document.getElementById( 'clearsearch' ),
		focused = false, ol = {},
		u = MobileFrontend.utils;

	if ( scriptPath ) {
		apiUrl = scriptPath + apiUrl;
	}

	function hideResults() {
		results.style.display = 'none';
	}
	function resetViewPort() {
		if ( navigator.userAgent.match( /iPhone/i ) || navigator.userAgent.match( /iPad/i ) ) {
			var viewportmeta = document.querySelector( 'meta[name="viewport"]' );
			if ( viewportmeta ) {
				viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0';
				u( document.body ).bind( 'gesturestart', function () {
					viewportmeta.content = 'width=device-width, initial-scale=1.0';
				}, false );
		    }
		}
	}

	resetViewPort();

	search.onfocus = function() {
		var pE, pT, pTT, rrd, rrdD,
			removeResultsEl;
		sb = document.getElementById( 'searchbox' );
		sq = document.getElementById( 'sq' );
		content = document.getElementById( 'content' );
		footer = document.getElementById( 'footer' );
		resetViewPort();

		if ( !focused ) {
			MobileFrontend.utils( document.body ).addClass( 'full-screen-search' );
			sq.className = '';

			pE = document.getElementById( 'placeholder' );
			if ( !pE ) {
				pT = document.createElement( 'span' );
				pTT = document.createTextNode(placeholder);
				pT.setAttribute( 'id', 'placeholder' );
				pT.appendChild(pTT);
				sb.insertBefore( pT, sb.firstChild );
			}
			pE = document.getElementById( 'placeholder' );
			if ( pE ) {
				pE.style.display = 'block';
			}

			if ( pE && search.value !== '' ) {
				pE.style.display = 'none';
			}

			removeResultsEl = document.getElementById( 'remove-results' );
			if ( !removeResultsEl ) {
				rrd = document.createElement( 'a' );
				rrd.setAttribute( 'href', '#' );
				rrd.setAttribute( 'id', 'remove-results' );
				u( rrd ).bind( 'click', removeResults );
				rrdD = document.createElement( 'div' );
				rrdD.setAttribute( 'id', 'left-arrow' );
				rrd.appendChild( rrdD );
				sq.insertBefore( rrd, sq.firstChild );
			}
			focused = true;
		}
	};

	function removeResults() {
		MobileFrontend.utils( document.body ).removeClass( 'full-screen-search' );
		var removeResultsEl, pE = document.getElementById( 'placeholder' );

		if ( pE ) {
			pE.style.display = 'none';
		}

		if ( focused ) {
			focused = false;
		}
		if ( clearSearch ) {
			clearSearch.style.display = 'none';
		}
	}

	function whichElement( e ) {
		var targ;
		if ( !e ) {
			e = window.event;
		}
		if ( e.target ) {
			targ = e.target;
		} else if ( e.srcElement ) {
			targ = e.srcElement;
		}

		if ( targ.nodeType === 3 ) {
			targ = targ.parentNode;
		}

		e.cancelBubble = true;
		e.stopPropagation();
		if ( targ.className === "suggestion-result" ||
			 targ.className === "search-result-item" ||
			 targ.className === "suggestions-result" ||
			 targ.className === "sq-val-update" ||
			 targ.id === 'results' ||
			 targ.id === 'search' ||
			 targ.id === 'searchbox' ||
			 targ.id === 'sq' ||
			 targ.id === 'placeholder' ||
			 targ.id === 'clearsearch' ||
			 targ.tagName === 'BODY' ) {
				if ( targ.id === 'clearsearch' && results ) {
					results.innerHTML = '';
				}
		} else {
			hideResults();
		}
	}

	window.onload = function () {
		u( search ).bind( 'keyup',
			function() {
				clearTimeout( timer );
				term = this.value;
				if ( term.length < 1 ) {
					results.innerHTML = '';
				} else {
					term = encodeURIComponent( term );
					timer = setTimeout( function () { searchApi( term ); }, typingDelay );
				}
			}, false );
	};

	function searchApi( term ) {
		url = apiUrl + '?action=opensearch&limit=' + numResults + '&namespace=0&format=xml&search=' + term;
		u.ajax( { url: url,
			success: function(xml) {
				writeResults( createObjectArray( xml ) );
			}
			} );
	}

	function createObjectArray( responseXml ) {
		var sections = [], i, item, section,
			items = responseXml.getElementsByTagName( 'Item' );
		for ( i = 0; i < items.length; i++ ) {
			item = items[i];
			section = {
				label: item.getElementsByTagName( 'Text' )[0].textContent,
				value: item.getElementsByTagName( 'Url' )[0].textContent
			};
			sections.push( section );
		}
		return sections;
	}

	function sqValUpdate( sqValue ) {
		var search = document.getElementById( 'search' );
		if ( search ) {
			search.value = sqValue + ' ';
			search.focus();
			searchApi( search.value );
		}
	}

	function htmlEntities( str ) {
		var text = document.createTextNode( str );
		var el = document.createElement( 'div' );
		el.appendChild( text );
		return el.innerHTML;
	}

	function escapeJsString( str ) {
		return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}

	function writeResults( sections ) {
		var results = document.getElementById( 'results' ), suggestions, i,
			term = htmlEntities( document.getElementById( 'search' ).value ),
			suggestionListener, section, escapedTerm, suggestionsResult, link, label;

		results.style.display = 'block';
		if ( search ) {
			search.focus();
		}
		if ( !sections || sections.length < 1 ) {
			results.innerHTML = "<div class=\"suggestions-results\" title=\"No Results\">No Results</div>";
		} else {
			if( results.firstChild ) {
				results.removeChild( results.firstChild );
			}
			suggestions = document.createElement( 'div' );
			suggestions.className = 'suggestions-results';
			results.appendChild( suggestions );
			suggestionListener = function() {
				var title = this.parentNode.getAttribute( 'title' );
				sqValUpdate( title );
			};

			for ( i = 0; i < sections.length; i++ ) {
				section = sections[i];
				suggestionsResult = document.createElement( 'div' );
				link = document.createElement( 'a' );
				suggestionsResult.setAttribute( 'title', section.label );
				suggestionsResult.className = 'suggestions-result';
				label = document.createTextNode( '+' );
				link.appendChild(label);
				link.className = 'sq-val-update';
				u( link ).bind( 'click', suggestionListener );
				suggestionsResult.appendChild( link );

				link = document.createElement( 'a' );
				link.setAttribute( 'href', section.value );
				link.className = 'search-result-item';
				label = document.createTextNode( section.label );
				link.appendChild( label );

				suggestionsResult.appendChild( link );
				suggestions.appendChild( suggestionsResult );
				// TODO: simplify the highlighting code to not use htmlEntities
				// highlight matched term
				escapedTerm = escapeJsString( term );
				link.innerHTML = link.innerHTML.replace( new RegExp( '(' + escapedTerm + ')' , 'ig'),
					'<strong>$1</strong>' );
			}
		}
	}

	function init() {
		var results = document.getElementById( 'results' );
		results.onmousedown = function( event ) {
			whichElement( event );
		};
		document.body.onmousedown = function( event ) {
			whichElement( event );
		};
		document.body.ontouchstart = function( event ) {
			whichElement( event );
		};
		results.ontouchstart = function( event ) {
			whichElement( event );
		};
	}
	init();

	return {
		init: init,
		writeResults: writeResults,
		createObjectArray: createObjectArray,
		removeResults: removeResults
	};

}());