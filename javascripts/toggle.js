/*global document, window */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
MobileFrontend.toggle = (function() {
	var u = MobileFrontend.utils;

	function init() {
		var i, a, heading, h2, btns = [], buttons,
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
		function createButton( visible ) {
			var btn, label;
			btn = document.createElement( 'button' );
			label = document.createTextNode( MobileFrontend.message( visible ? 'expand-section' : 'collapse-section' ) );
			btn.className = visible ? 'show' : 'hide';
			btn.appendChild( label );
			return btn;
		}
		u( document.body ).addClass( 'togglingEnabled' );

		for( i = 0; i < sectionHeadings.length; i++ ) {
			heading = sectionHeadings[i];
			heading.removeAttribute( 'onclick' ); // TODO: remove any legacy onclick handlers
			heading.insertBefore( createButton( true ), heading.firstChild );
			heading.insertBefore( createButton( false ), heading.firstChild );
			u( heading ).bind( 'click', openSectionHandler );
		}
		
		function checkHash() {
			var hash = this.hash || document.location.hash;
			if ( hash.indexOf( '#' ) === 0 ) {
				wm_reveal_for_hash( hash );
			}
		}
		checkHash();
		for ( a = u( '.content_block a' ) || [], i = 0; i < a.length; i++ ) {
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
			bb = b.getElementsByTagName( 'button' ), i, s, e, closed;
		if( u(b).hasClass( 'openSection' ) ) {
			u(b).removeClass( 'openSection' );
			closed = true;
		} else {
			u(b).addClass( 'openSection' );
		}
		for ( i = 0, d = ['content_','anchor_']; i<=1; i++ ) {
			e = document.getElementById( d[i] + section_id );
			if ( e && u( e ).hasClass( 'openSection' ) ) {
				u( e ).removeClass( 'openSection' );
			} else {
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

	init();
	return {
		wm_reveal_for_hash: wm_reveal_for_hash,
		wm_toggle_section: wm_toggle_section,
		init: init
	};

})();
