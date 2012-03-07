/*global document, window, MobileFrontend, navigator, placeholder */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
MobileFrontend.opensearch = (function() {
	var apiUrl = '/api.php', timer = -1, typingDelay = 500,
		numResults = 5,
		results = document.getElementById( 'results' ),
		search = document.getElementById( 'search' ),
		sb = document.getElementById( 'searchbox' ),
		u = MobileFrontend.utils;

	if ( scriptPath ) {
		apiUrl = scriptPath + apiUrl;	
	}

	function hideResults() {
		var results = document.getElementById( 'results' );
		results.style.display = 'none';
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
	
		if (!( targ.className === "suggestion-result" ||
			 targ.className === "search-result-item" ||
			 targ.className === "suggestions-result" ||
			 targ.className === "sq-val-update" ) ) {
			hideResults();
		}
	}

	window.onload = function () {
		// TODO: not working in opera mini 6.5
		u( search ).bind( 'keyup',
			function() {
				clearTimeout( timer );
				var term = this.value;
				if ( term.length < 1 ) {
					results.innerHTML = '';
				} else {
					timer = setTimeout( function () { searchApi( term ); }, typingDelay );
				}
			} );
	};

	function searchApi( term ) {
		term = encodeURIComponent( term );
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

	function writeResults( sections ) {
		var results = document.getElementById( 'results' ), suggestions, i,
			suggestionListener, section, suggestionsResult, link, label,
			sq = document.getElementById( 'sq' ),
			header = document.getElementById( 'header' );

		results.style.display = 'block';
		var top = sq.offsetParent.offsetTop + sq.offsetHeight + sq.offsetTop - 1 + header.offsetTop;
		results.style.top = top + 'px';

		if ( !sections || sections.length < 1 ) {
			results.innerHTML = '<div class="suggestions-results"><div class="suggestions-result">No results</div></div>';
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
			}
		}
	}

	function initClearSearch() {
		var clearSearch = document.getElementById( 'clearsearch' ),
			search = document.getElementById( 'search' ),
			results = document.getElementById( 'results' );
		function handleClearSearchLink() {
			if ( clearSearch ) {
				if ( search.value.length > 0 ) {
					clearSearch.style.display = 'block';
				} else {
					clearSearch.style.display = 'none';
					if ( results ) {
						results.style.display = 'none';
					}
				}
			}
		}

		function clearSearchBox( event ) {
			search.value = '';
			clearSearch.style.display = 'none';
			if ( results ) {
				results.style.display = 'none';
			}
			if ( event ) {
				event.preventDefault();
			}
		}
		
		function onFocusHandler() {
			search.select();
		}
		u( clearSearch ).bind( 'mousedown', clearSearchBox );
		u( search ).bind( 'keyup', handleClearSearchLink );
		u( search ).bind( 'click', onFocusHandler );
	}

	function init() {
		var results = document.getElementById( 'results' );
		results.onmousedown = whichElement;
		document.body.onmousedown = whichElement;
		document.body.ontouchstart = whichElement;
		results.ontouchstart = whichElement;
	}
	init();
	initClearSearch();

	return {
		init: init,
		initClearSearch: initClearSearch,
		writeResults: writeResults,
		createObjectArray: createObjectArray
	};

}());
