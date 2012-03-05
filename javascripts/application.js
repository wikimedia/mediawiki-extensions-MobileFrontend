/*global document, window */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
MobileFrontend = (function() {
	var utilities;

	function init() {
		var i, results, languageSelection, a, heading,
			sectionHeadings = utilities( '.section_heading' );
		utilities( document.body ).addClass( 'jsEnabled' );

		// TODO: remove in future - currently enables toggling in Wikipedia Mobile App v < 1.3
		window.wm_toggle_section = wm_toggle_section;
		utilities( '.section_heading button' ).remove();

		function openSectionHandler() {
			var sectionNumber = this.id ? this.id.split( '_' )[1] : -1;
			if( sectionNumber > -1 ) {
				wm_toggle_section( sectionNumber );
			}
		}
		function createButton( visible ) {
			var btn, label;
			btn = document.createElement( 'button' );
			label = document.createTextNode( visible ? 'Show' : 'Hide' );
			btn.className = visible ? 'show' : 'hide';
			btn.appendChild( label );
			btn.style.display = visible ? 'inline-block' : 'none';
			return btn;
		}
		if(!sectionHeadings) {
			sectionHeadings = [];
		} else {
			utilities( document.body ).addClass( 'togglingEnabled' );
		}
		for( i = 0; i < sectionHeadings.length; i++ ) {
			heading = sectionHeadings[i];
			heading.removeAttribute( 'onclick' ); // TODO: remove any legacy onclick handlers
			heading.insertBefore( createButton( true ), heading.firstChild );
			heading.insertBefore( createButton( false ), heading.firstChild );
			utilities( heading ).bind( 'click', openSectionHandler );
		}
		results = document.getElementById( 'results' );
		languageSelection = document.getElementById( 'languageselection' );

		function navigateToLanguageSelection() {
			var url;
			if ( languageSelection ) {
				url = languageSelection.options[languageSelection.selectedIndex].value;
				if ( url ) {
					location.href = url;
				}
			}
		}
		utilities( languageSelection ).bind( 'change', navigateToLanguageSelection );

		function logoClick() {
			var n = document.getElementById( 'nav' ).style;
			n.display = n.display === 'block' ? 'none' : 'block';
		}
		utilities( document.getElementById( 'logo' ) ).bind( 'click', logoClick );

		function checkHash() {
			var hash = this.hash || document.location.hash;
			if ( hash.indexOf( '#' ) === 0 ) {
				wm_reveal_for_hash( hash );
			}
		}
		checkHash();
		for ( a = document.getElementsByTagName( 'a' ), i = 0; i < a.length; i++ ) {
			utilities( a[i] ).bind( 'click', checkHash );
		}

		// Try to scroll and hide URL bar
		window.scrollTo( 0, 1 );
	}

	function wm_reveal_for_hash( hash ) {
		var targetel = document.getElementById( hash.substr(1) ),
			p, section_idx;
		if ( targetel ) {
			p = targetel;
			while ( p && p.className !== 'content_block' &&
				p.className !== 'section_heading' ) {
				p = p.parentNode;
			}
			if ( p && p.style.display !== 'block' ) {
				section_idx = parseInt( p.id.split( '_' )[1], 10 );
				wm_toggle_section( section_idx );
			}
		}
	}

	function wm_toggle_section( section_id ) {
		var b = document.getElementById( 'section_' + section_id ),
			bb = b.getElementsByTagName( 'button' ), i, s, e;
		for ( i = 0; i <= 1; i++ ) {
			s = bb[i].style;
			s.display = s.display === 'none' || ( i && !s.display ) ? 'inline-block' : 'none';
		}
		for ( i = 0, d = ['content_','anchor_']; i<=1; i++ ) {
			e = document.getElementById( d[i] + section_id );
			if ( e ) {
				e.style.display = e.style.display === 'block' ? 'none' : 'block';
			}
		}
	}

	utilities = typeof jQuery  !== 'undefined' ? jQuery : function( el ) {
		if( typeof(el) === 'string' ) {
			if( document.querySelectorAll ) {
				return document.querySelectorAll( el );
			}
		}
		function addClass( name ) {
			var className = el.className,
				classNames = className.split( ' ' );
			classNames.push(name); // TODO: only push if unique
			el.className = classNames.join( ' ' );
		}

		function removeClass( name ) {
			var className = el.className,
				classNames = className.split( ' ' ),
				newClasses = [], i;
			for( i = 0; i < classNames.length; i++ ) {
				if( classNames[i] !== name ) {
					newClasses.push( classNames[i] );
				}
			}
			el.className = newClasses.join( ' ' );
		}

		function bind( type, handler ) {
			el.addEventListener( type, handler, false );
		}

		// TODO: support single elements
		function remove(els) {
			var i, el;
			for( i = 0; i < els.length; i++ ) {
				el = els[i];
				el.parentNode.removeChild(el);
			}
		}

		return {
			addClass: addClass,
			bind: bind,
			remove: remove,
			removeClass: removeClass
		};
	}
	utilities.ajax = utilities.ajax || function( options ) {
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
			if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 ) {
				options.success( xmlHttp.responseXML );
			}
		};
		xmlHttp.open( 'GET', options.url, true );
		xmlHttp.send();
	};

	init();
	return {
		wm_reveal_for_hash: wm_reveal_for_hash,
		wm_toggle_section: wm_toggle_section,
		init: init,
		utils: utilities
	};

}());
