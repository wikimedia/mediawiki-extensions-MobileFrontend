var apiUrl = '/api.php';

if ( scriptPath ) {
	apiUrl = scriptPath + apiUrl;	
}

var timer = -1;
var typingDelay = 500;
var numResults = 10;
var pixels = 'px';

var results = document.getElementById( 'results' );
var search = document.getElementById( 'search' );
var sq = document.getElementById( 'sq' );

results.style.width = ( sq.offsetWidth - 2 ) + pixels;
results.style.left = sq.offsetLeft + pixels;
results.style.top = ( sq.offsetTop + sq.offsetHeight )	+ pixels;

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
}

function searchApi( term ) {
	var xmlHttp;
	if ( window.XMLHttpRequest ) {
		xmlHttp = new XMLHttpRequest();
	} else {
		xmlHttp = new ActiveXObject( 'Microsoft.XMLHTTP' );
	}
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

function writeResults( sections ) {
		results.style.display = 'block';
	if ( !sections || sections.length < 1 ) {
		results.innerHTML = "No results";
	} else {
		var html = '<div class="suggestions-results">';
		for ( i = 0; i < sections.length; i++ ) {
			var section = sections[i];
			var rel = i + 1;
			html = html + "<div class=\"suggestions-result\" rel=\"" + rel + "\" title=\"" + section.label + "\"><a href='" + section.value + "'>" + section.label + "</a></div>";
		}
		html = html + '</div>';
		results.innerHTML = html;
	}
}