/*global mw, document, window */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M ) {
var MobileFrontend = M;
var toggle = ( function() {

	var u = MobileFrontend.utils,
		message = MobileFrontend.message,
		showLabel = message( 'expand-section' ),
		hideLabel = message( 'collapse-section' );

	function wm_toggle_section( section_id ) {
		var b = document.getElementById( 'section_' + section_id ), id,
			hash, d,
			bb = b.getElementsByTagName( 'button' )[0], i, s, e, closed, reset = [];
		if( u( b ).hasClass( 'openSection' ) ) {
			u( b ).removeClass( 'openSection' );
			u( bb ).text( showLabel );
			closed = true;
		} else {
			reset.push( b );
			u( b ).addClass( 'openSection' );
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
		hash = closed ? '#_' : '#' + id;
		if ( hash !== '#section_nav' ) {
			MobileFrontend.history.replaceHash( hash );
		}
		e.setAttribute( 'id', id );
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

	function init() {
		u( document.documentElement ).addClass( 'togglingEnabled' );
		var i, a, heading, h2, btns = [], buttons, apiUrl = '/api.php',
			sectionHeadings = [], content, firstHeadings,
			inBeta = u( document.body ).hasClass( 'beta' );

		content = document.getElementById( 'content_wrapper' );
		h2 = document.getElementsByTagName( 'H2' );
		if ( M.setting( 'beta' ) ) {
			firstHeadings = document.getElementsByTagName( 'H1' );
			if ( firstHeadings.length === 1 &&  // special cases for some pages do not have an H1 (e.g. main page) - off topic they should..
				u( firstHeadings[ 0 ] ).hasClass( 'section_heading' ) ) {
				sectionHeadings.push( firstHeadings[ 0 ] );
			}
		}

		for( i = 0; i < h2.length; i++) {
			heading = h2[i];
			if( u( heading ).hasClass( 'section_heading') ) {
				sectionHeadings.push( heading );
			}
		}

		function openSectionHandler() {
			_mwLogEvent( 'SectionToggled', this.id );
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
			heading.insertBefore( createButton(), heading.firstChild );
			a = document.getElementById( 'anchor_' + heading.id.split( '_' )[ 1 ] );
			if( a ) {
				u( a ).text( message( 'mobile-frontend-close-section' ) );
				u( a ).bind( 'click', openSectionHandler );
			}
			u( heading ).bind( 'mousedown', openSectionHandler );
		}
		
		function checkHash() {
			var hash = window.location.hash;
			if ( hash.indexOf( '#' ) === 0 ) {
				wm_reveal_for_hash( hash );
			}
			if( hash ) {
				MobileFrontend.history.replaceHash( '#_' ); // clear existing hash for case of jump to top
				MobileFrontend.history.replaceHash( hash );
			}
		}
		checkHash();
		for ( a = content.getElementsByTagName( 'a' ), i = 0; i < a.length; i++ ) {
			u( a[i] ).bind( 'click', checkHash );
		}
		_mwLogEvent( 'TogglingReady', sectionHeadings.length );
	}

	return {
		wm_reveal_for_hash: wm_reveal_for_hash,
		wm_toggle_section: wm_toggle_section,
		init: init
	};

}());

MobileFrontend.registerModule( 'toggle', toggle );

}( mw.mobileFrontend ));
