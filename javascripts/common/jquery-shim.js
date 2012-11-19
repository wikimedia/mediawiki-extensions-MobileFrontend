/* A shim for jQuery which provides basic functionality */
( function() {

window.$ = window.jQueryShim = function ( el ) {
	if ( typeof el === 'string' ) {
		if ( document.querySelectorAll ) {
			return [].slice.call( document.querySelectorAll( el ) );
		}
	} else if ( !el ) {
		el = document.createElement( 'div' );
	}

	function inArray( array, str ) {
		var i;
		if ( array.indexOf ) {
			return array.indexOf( str ) > -1;
		} else {
			for ( i = 0; i < array.length; i++ ) {
				if ( str === array[i] ) {
					return true;
				}
			}
			return false;
		}
	}

	function hasClass( name ) {
		var classNames = el.className.split( ' ' );
		return inArray( classNames, name );
	}

	function addClass( name ) {
		var className = el.className,
			classNames = className.split( ' ' );
		classNames.push( name ); // TODO: only push if unique
		el.className = classNames.join( ' ' );
	}

	function removeClass( name ) {
		var className = el.className,
			classNames = className.split( ' ' ),
			newClasses = [], i;
		for ( i = 0; i < classNames.length; i++ ) {
			if ( classNames[i] !== name ) {
				newClasses.push( classNames[i] );
			}
		}
		el.className = newClasses.join( ' ' );
	}

	function bind( type, handler ) {
		el.addEventListener( type, handler, false );
	}

	function trigger() {}

	function remove() {
		el.parentNode.removeChild( el );
	}

	function getChildText( el ) {
		var child, value = '', i;
		for ( i = 0; i < el.childNodes.length; i++ ) {
			child = el.childNodes[i];
			if ( child.nodeType !== 8 ) { // ignore comment node
				value += utilities( child ).text();
			}
		}
		return value;
	}

	function text( str ) {
		var i, label;
		if ( str ) {
			el.innerHTML = '';
			label = document.createTextNode( str );
			el.appendChild( label );
		} else {
			if ( el.nodeType === 3 ) { // TEXT_NODE
				return el.nodeValue;
			} else if ( typeof el.textContent === 'string' ) {
				return el.textContent; // standards compliant
			} else if ( typeof el.innerText === 'string' ) {
				return el.innerText;
			} else {
				return getChildText( el );
			}
		}
	}

	return {
		addClass: addClass,
		bind: bind,
		hasClass: hasClass,
		remove: remove,
		removeClass: removeClass,
		text: text,
		trigger: trigger
	};
};

jQueryShim.ajax = function( options ) {
	var xmlHttp, url;
	if ( window.XMLHttpRequest ) {
		xmlHttp = new XMLHttpRequest();
	} else {
		xmlHttp = new ActiveXObject( 'Microsoft.XMLHTTP' );
	}
	if( xmlHttp.overrideMimeType ) { // non standard
		xmlHttp.overrideMimeType( 'text/xml' );
	}
	xmlHttp.onreadystatechange = function() {
		var resp;
		if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 ) {
			if ( options && options.dataType === 'json' ) {
				resp = xmlHttp.responseText;
				resp = resp && typeof JSON !== 'undefined' ? JSON.parse( resp ) : resp;
			} else {
				resp = xmlHttp.responseXML;
			}
			options.success( resp );
		}
	};
	xmlHttp.open( 'GET', options.url, true );
	xmlHttp.send();
};
} )();
