/*global mw, $, document, window */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M, $ ) {

var T = ( function() {
	var inBeta = $( 'body' ).hasClass( 'beta' ),
		message = M.message,
		apiUrl = M.setting( 'scriptPath' ) + '/api.php',
		sectionData = {},
		showLabel = message( 'expand-section' ),
		hideLabel = message( 'collapse-section' );

	function wm_toggle_section( section_id ) {
		var id = 'section_' + section_id, content_id = 'content_' + section_id,
			R = M.getModule( 'references' ),
			closed, sectionInfo = sectionData[ section_id ],
			$section = $( '#' + id ), $button = $section.find( 'button' ), $content = $( '#' + content_id ),
			selector = '#' + content_id + ',#' + id + ',#anchor_' + section_id + ',#' + id + ' button'; // FIXME: shouldn't have to toggle class on button

		if ( sectionInfo && $content.length === 0 ) {
			$( '<div class="content_block">' ).attr( 'id', content_id ).html( sectionInfo.html ).insertAfter( '#' + id );
			R.init( $( content_id )[ 0 ] );
		}

		$( selector ).toggleClass( 'openSection' );
		closed = $section.hasClass( 'openSection' );
		$button.text( closed ? showLabel : hideLabel );

		// NOTE: # means top of page so using a dummy hash #_ to prevent page jump
		$section.removeAttr( 'id' );
		M.history.replaceHash( closed ? '#' + id : '#_' );
		$section.attr( 'id', id );
	}

	function wm_reveal_for_hash( hash ) {
		wm_toggle_section( $( hash ).data( 'section' ) );
	}

	function checkHash() {
		var hash = window.location.hash;
		if( hash ) {
			if ( hash.indexOf( '#' ) === 0 ) {
				wm_reveal_for_hash( hash );
			}
			M.history.replaceHash( '#_' ); // clear existing hash for case of jump to top
			M.history.replaceHash( hash );
		}
	}

	function enableToggling() {
		$( 'html' ).addClass( 'togglingEnabled' );

		function openSectionHandler() {
			wm_toggle_section( $( this ).attr( 'id' ).split( '_' )[ 1 ] );
		}

		$( '.section_heading' ).each( function() {
			var $this = $( this ), section = $this.attr( 'id' ).split( '_' )[ 1 ];
			if ( $this.parents( '.section' ).length === 1 ) {
				$( '#anchor_' +  section ).
					text( message( 'mobile-frontend-close-section' ) ).
					data( 'section', section ).
					on( 'click', openSectionHandler );
			}
			// disable default behaviour of the link in the heading
			$this.find( 'a' ).on( 'click', function( ev ) {
				ev.preventDefault();
			} );
			$( '<button>' ).text( showLabel ).prependTo( this );
			$this.on( 'click', openSectionHandler );
		} );
		// disable links
		$( 'h2 a' ).on( 'click', function( ev ) {
			ev.preventDefault();
		} );

		checkHash();
		$( '#content_wrapper a' ).on( 'click', checkHash );
	}

	function retrieveSections( pageTitle ) {
		$.ajax( {
			url: apiUrl, dataType: 'json',
			data: {
				action: 'mobileview', format: 'json',
				page: pageTitle,
				redirects: 'yes', prop: 'sections|text', noheadings: 'yes',
				sectionprop: 'level|line', sections: 'all' }
			} ).done( function( resp ) {
				var i, secs, s, sectionNum = 0, level, text;
				sectionData = {};
				if ( resp && resp.mobileview && resp.mobileview.sections ) {
					secs = resp.mobileview.sections;
					for( i = 0; i < secs.length; i++ ) {
						s = secs[ i ];
						level = s.level;
						text = s.text || '';
						if ( level === '2' ) {
							sectionNum = sectionNum + 1;
							sectionData[ sectionNum ] = { html: text };
						} else if ( level ) {
							sectionData[ sectionNum ].html += $( '<h' + level + '>' ).text( s.line ).html() + text;
						}
						if( s.hasOwnProperty( 'references' ) ) {
							sectionData[ sectionNum ].references = true;
							$( '<div class="content_block">' ).attr( 'id', 'content_' + sectionNum ).
								html( sectionData[ sectionNum ].html ).insertAfter( '#section_' + sectionNum );
						}
					}
					enableToggling();
					_mwLogEvent( 'TogglingReady', $( '.section_heading' ).length );
				}
			} ).fail( function() { // resort to non-javascript mode
				$( 'html' ).addClass( 'togglingEnabled' );
			} );
	}

	function init() {
		var sections = [], pageTitle = $( 'h1' ).text();

		if ( !$( '#content_wrapper' ).hasClass( 'mw-mf-special' ) ) {
			retrieveSections( pageTitle );
		} else {
			enableToggling();
		}
	}

	return {
		wm_reveal_for_hash: wm_reveal_for_hash,
		wm_toggle_section: wm_toggle_section,
		init: init
	};

}() );

M.registerModule( 'toggle', T );

}( mw.mobileFrontend, jQuery ) );
