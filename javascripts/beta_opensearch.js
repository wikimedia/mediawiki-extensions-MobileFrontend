var apiUrl = '/api.php';

if ( scriptPath ) {
	apiUrl = scriptPath + apiUrl;	
}

var timer = -1;
var typingDelay = 500;
var numResults = 15;
var pixels = 'px';
var term;

var results = document.getElementById( 'results' );
var search = document.getElementById( 'search' );
var sq = document.getElementById( 'sq' );
var sb = document.getElementById( 'searchbox' );
var logo = document.getElementById( 'logo' );
var goButton = document.getElementById( 'goButton' );

function hideResults() {
	results.style.display = 'none';
}

var focused = false;
var ol = new Object();
search.onfocus = function() {
	if ( !focused ) {
		ol.sqLeft = sq.offsetLeft;
		ol.sqTop = sq.offsetTop;
		sq.style.position = 'absolute';
		
		sq.style.left = sb.offsetLeft + pixels;
		sq.style.top = sb.offsetTop + pixels;
		sq.style.height = sb.offsetHeight + pixels;
		sq.style.width = sb.offsetWidth + pixels;
		
		sq.className = 'animate';
		
		sq.style.left = 0 + pixels;
		sq.style.top = 0 + pixels;
		sq.style.height = 40 + pixels;
		sq.style.width = document.body.clientWidth + pixels;
		search.style.position = 'absolute';
		search.style.left = ( search.offsetLeft + 44 ) + pixels;
		search.style.height = 34 + pixels;
		search.style.width = ( document.body.clientWidth - 90 ) + pixels;
		search.style.fontSize = 16 + pixels;
		results.style.left = 0 + pixels;
		results.style.top = ( sq.offsetTop + sq.offsetHeight )	+ pixels;
		results.style.width = document.body.clientWidth + pixels;
		results.style.height = '100%';
		results.style.borderTop = 'solid 1px #A6A6A6';
		results.style.backgroundColor = '#E6E6E6';
		results.style.paddingTop = 5 + pixels;
		results.style.display = 'block';
		sb.style.border = 0 + pixels;
		logo.style.visibility = 'hidden';
		goButton.style.visibility = 'hidden';
		var removeResults = document.getElementById( 'remove-results' );
		if ( !removeResults ) {
			rrd = document.createElement( 'a' ); 
		 	rrd.setAttribute( 'href', '#' );
			rrd.setAttribute( 'id', 'remove-results' );
			rrd.setAttribute( 'onclick', 'removeResults();' );
			rrdD = document.createElement( 'div' );
			rrdD.setAttribute( 'id', 'left-arrow' );
			rrd.appendChild( rrdD );
			sq.insertBefore( rrd, sq.firstChild );
		} else {
			removeResults.style.display = 'block';
		}
		focused = true;
	}
}

function removeResults() {
	if ( ol ) {
		if ( sq ) {
			logo.style.visibility = 'visible';
			goButton.style.visibility = 'visible';
			//var reg = new RegExp('(\\s|^)animate(\\s|$)');
			//sq.className = sq.className.replace(reg, '');
			sq.className = 'divclearable';
			sq.style.position = 'static';
			sq.style.left = ol.sqLeft + pixels;
			sq.style.top = ol.sqTop + pixels;
			sq.style.height = 'auto';
		}
		if ( search ) {
			search.style.left = ( search.offsetLeft - 44 ) + pixels;
			search.style.position = 'static';
			search.style.fontSize = 11 + pixels;
			search.style.height = 'auto';
			updateSearchWidth();
		}
		if ( sb ) {
			sb.style.border = 'solid #CCC 1px';
			var removeResults = document.getElementById( 'remove-results' );
			if ( removeResults ) {
				removeResults.style.display = 'none';
			}
		}
		if ( focused ) {
			focused = false;
		}
		if ( clearSearch ) {
			clearSearch.style.display = 'none';
		}
	}
}

document.body.onmousedown = function( event ) {
	whichElement(event);
}
results.onmousedown = function( event ) {
	whichElement(event);
}

document.body.ontouchstart = function( event ) {
	whichElement(event);
}
results.ontouchstart = function( event ) {
	whichElement(event);
}

function whichElement( e ) { 
	var targ;
	if ( !e ) {
		var e = window.event;
	}
	if ( e.target ) {
		targ = e.target;
	} else if ( e.srcElement ) {
		targ = e.srcElement;
	}
	
	if ( targ.nodeType == 3 ) {
		targ = targ.parentNode;
	}
	
	e.cancelBubble = true;
	e.stopPropagation();
	
	if ( targ.className == "suggestion-result" || 
		 targ.className == "search-result-item" || 
		 targ.className == "suggestions-result" ||
		 targ.className == "sq-val-update" ||
		 targ.id == 'results' ||
		 targ.id == 'search' ||
		 targ.id == 'searchbox' ||
		 targ.id == 'sq' ||
		 targ.tagName == 'BODY' ) {
	} else {
		hideResults();
	}
}

function updateSearchWidth() {
	if ( sq && search && sb ) {
		var iw = ( document.documentElement.clientWidth ) ? document.documentElement.clientWidth : document.body.clientWidth;
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
			setTimeout( "updateSearchWidth()", 200 );
			break;
  }
}

// Point to the updateOrientation function when iPhone switches between portrait and landscape modes.
window.onorientationchange = updateOrientationSearchWidth;

window.onload = function () {
	search.addEventListener( 'keyup',
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
}

function searchApi( term ) {
	var xmlHttp;
	if ( window.XMLHttpRequest ) {
		xmlHttp = new XMLHttpRequest();
	} else {
		xmlHttp = new ActiveXObject( 'Microsoft.XMLHTTP' );
	}
	xmlHttp.overrideMimeType( 'text/xml' );
	xmlHttp.onreadystatechange = function() {
		if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
			var sections = createObjectArray( xmlHttp.responseXML );
			writeResults( sections );
		}
	}
	var url = apiUrl + '?action=opensearch&limit=' + numResults + '&namespace=0&format=xml&search=' + term;
	xmlHttp.open( 'GET', url, true );
	xmlHttp.send();
}

function createObjectArray( responseXml ) {
	var sections = new Array();
	var items = responseXml.getElementsByTagName( 'Item' );
	for ( i = 0; i < items.length; i++ ) {
		var item = items[i];
		var section = {
			label: item.getElementsByTagName( 'Text' )[0].textContent,
			value: item.getElementsByTagName( 'Url' )[0].textContent,
		}
		sections.push( section );
	}
	return sections;
}

function sqValUpdate( sqValue ) {
	if ( search ) {
		search.value = sqValue + ' ';
		search.focus();
		searchApi( search.value );
	}
}

function htmlEntities( str ) {
    return String( str ).replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /"/g, '&quot;' ).replace( /'/g, '&#39;' );
}

function escapeJsString( str ) {
	return String( str ).replace( /\\/g, '\\\\' ).replace( /'/g, "\\'" ).replace( /\n/g, '\\n' );
}

function writeResults( sections ) {
	results.style.display = 'block';
	if ( search ) {
		search.focus();
	}
	if ( !sections || sections.length < 1 ) {
		results.innerHTML = "<div class=\"suggestions-results\" title=\"No Results\">No Results</div>";
	} else {		
		var html = '<div class="suggestions-results">';
		for ( i = 0; i < sections.length; i++ ) {
			var section = sections[i];
			var rel = i + 1;
			term = htmlEntities( decodeURIComponent( term ) );
			var label = section.label.replace( new RegExp( '(' + term + ')', 'ig' ), '<strong>$1</strong>' );
			section.value = section.value.replace( /^(?:\/\/|[^\/]+)*\//, '/' );
			html = html + "<div class=\"suggestions-result\" rel=\"" + htmlEntities( rel ) + "\" title=\"" + htmlEntities( section.label ) + "\"><a class=\"sq-val-update\" href=\"javascript:sqValUpdate('" + htmlEntities( escapeJsString( section.label ) ) + "');\">+</a><a class=\"search-result-item\" href='" + htmlEntities( section.value ) + "'>" + label + "</a><hr/></div>";
		}
		html = html + '</div>';
		results.innerHTML = html;
	}
}