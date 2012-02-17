/*global document, window, MobileFrontend, navigator, placeholder */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
MobileFrontend.opensearch = (function() {
	var apiUrl = '/api.php', timer = -1, typingDelay = 500,
		numResults = 5, pixels = 'px',
		results = document.getElementById( 'results' ),
		search = document.getElementById( 'search' ),
		sq = document.getElementById( 'sq' ),
		sb = document.getElementById( 'searchbox' );

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

	function updateSearchWidth() {
		if ( sq && search && sb ) {
			var iw = document.documentElement.clientWidth || document.body.clientWidth;
			sb.style.width = ( iw - 30 ) + pixels;
			sq.style.width = ( iw - 110 ) + pixels;
			search.style.width = ( iw - 130 ) + pixels;
			if ( results ) {
				results.style.width = ( sq.offsetWidth - 2 ) + pixels;
				results.style.left = sq.offsetLeft + pixels;
				results.style.top = ( sq.offsetTop + sq.offsetHeight )	+ pixels;
			}
		}
	}

	updateSearchWidth();

	function updateOrientationSearchWidth() {
		switch( window.orientation ) {
			case 0:
			case -90:
			case 90:
			case 180:
				setTimeout( updateSearchWidth, 200 );
				break;
	  }
	}

	// Point to the updateOrientation function when iPhone switches between portrait and landscape modes.
	window.onorientationchange = updateOrientationSearchWidth;

	window.onload = function () {
		search.addEventListener( 'keyup',
			function() {
				clearTimeout( timer );
				var term = this.value;
				if ( term.length < 1 ) {
					results.innerHTML = '';
				} else {
					timer = setTimeout( function () { searchApi( term ); }, typingDelay );
				}
			}, false );
	};

	function searchApi( term ) {
		var xmlHttp, url;
		if ( window.XMLHttpRequest ) {
			xmlHttp = new XMLHttpRequest();
		} else {
			xmlHttp = new ActiveXObject( 'Microsoft.XMLHTTP' );
		}
		xmlHttp.overrideMimeType( 'text/xml' );
		xmlHttp.onreadystatechange = function() {
			if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 ) {
				var sections = createObjectArray( xmlHttp.responseXML );
				writeResults( sections );
			}
		};
		term = encodeURIComponent( term );
		url = apiUrl + '?action=opensearch&limit=' + numResults + '&namespace=0&format=xml&search=' + term;
		xmlHttp.open( 'GET', url, true );
		xmlHttp.send();
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
			suggestionListener, section, suggestionsResult, link, label;

			results.style.display = 'block';
		if ( !sections || sections.length < 1 ) {
			results.innerHTML = "No results";
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
				link.addEventListener( 'click', suggestionListener );
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
		createObjectArray: createObjectArray
	};

}());
