/*global MobileFrontend, document, window */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
MobileFrontend.toggle = (function() {
	var u = MobileFrontend.utils,
		showLabel = MobileFrontend.message( 'expand-section' ),
		hideLabel = MobileFrontend.message( 'collapse-section' );

	function init() {
		var i, a, heading, h2, btns = [], buttons, apiUrl = '/api.php',
			sectionHeadings = [];

		h2 = document.getElementsByTagName( 'H2' );

		for( i = 0; i < h2.length; i++) {
			heading = h2[i];
			if( u( heading ).hasClass( 'section_heading') ) {
				sectionHeadings.push( heading );
				// TODO: remove in future
				buttons = heading.getElementsByTagName( 'button' );
				for( a = 0; a < buttons.length; a++ ) {
					btns.push( buttons[a] );
				}
			}
		}

		// TODO: remove in future - currently enables toggling in Wikipedia Mobile App v < 1.1
		window.wm_toggle_section = wm_toggle_section;
		for( i = 0; i < btns.length; i++ ) {
			u( btns[i] ).remove();
		}

		function openSectionHandler() {
			var sectionName = this.id ? this.id.split( '_' )[1] : -1;
			if( sectionName !== -1 ) {
				wm_toggle_section( sectionName );
			}
		}
		function createButton() {
			var btn = document.createElement( 'button' );
			u( btn ).text( showLabel );
			return btn;
		}

		for( i = 0; i < sectionHeadings.length; i++ ) {
			heading = sectionHeadings[i];
			heading.removeAttribute( 'onclick' ); // TODO: remove any legacy onclick handlers
			heading.insertBefore( createButton(), heading.firstChild );
			u( heading ).bind( 'click', openSectionHandler );
		}
		
		function checkHash() {
			var hash = window.location.hash;
			if ( hash.indexOf( '#' ) === 0 ) {
				wm_reveal_for_hash( hash );
			}
			if( hash ) {
				window.location.hash = '#_'; // clear existing hash for case of jump to top
				window.location.hash = hash;
			}
		}
		checkHash();
		for ( a = document.getElementsByTagName( 'a' ), i = 0; i < a.length; i++ ) {
			u( a[i] ).bind( 'click', checkHash );
		}
	}

	function wm_reveal_for_hash( hash ) {
		var targetel = document.getElementById( hash.substr(1) ),
			p, section_idx;
		if ( targetel ) {
			p = targetel;
			while ( p && !u(p).hasClass( 'content_block' ) &&
				!u(p).hasClass( 'section_heading' ) ) {
				p = p.parentNode;
			}
			if ( p && ! u( p ).hasClass( 'openSection' ) ) {
				section_idx = p.id.split( '_' )[1];
				wm_toggle_section( section_idx );
			}
		}
	}

	function wm_toggle_section( section_id ) {
		var b = document.getElementById( 'section_' + section_id ), id,
			bb = b.getElementsByTagName( 'button' )[0], i, s, e, closed, reset = [];
		if( u( b ).hasClass( 'openSection' ) ) {
			u( b ).removeClass( 'openSection' );
			u( bb ).removeClass( 'openSection' );
			u( bb ).text( showLabel );
			closed = true;
		} else {
			reset.push( b );
			u( b ).addClass( 'openSection' );
			u( bb ).addClass( 'openSection' );
			u( bb ).text( hideLabel );
		}
		for ( i = 0, d = ['content_','anchor_']; i<=1; i++ ) {
			e = document.getElementById( d[i] + section_id );
			if ( e && u( e ).hasClass( 'openSection' ) ) {
				u( e ).removeClass( 'openSection' );
			} else if( e ) {
				reset.push( e );
				u( e ).addClass( 'openSection' );
			}
		}
		// NOTE: # means top of page so using a dummy hash #_ to prevent page jump
		id = 'section_' + section_id;
		e = document.getElementById( id );
		e.removeAttribute( 'id' );
		window.location.hash = closed ? '#_' : '#' + id;
		e.setAttribute( 'id', id );
	}

	MobileFrontend.registerModule( 'toggle' );
	return {
		wm_reveal_for_hash: wm_reveal_for_hash,
		wm_toggle_section: wm_toggle_section,
		init: init
	};

}());
