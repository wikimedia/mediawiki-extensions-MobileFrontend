/*global mw, $, document, window */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M, $ ) {

var T = ( function() {
	var inBeta = $( 'body' ).hasClass( 'beta' ),
		message = M.message,
		sectionData = {},
		footerInitialised = false,
		showLabel = message( 'expand-section' ),
		hideLabel = message( 'collapse-section' );

	function wm_toggle_section( section_id ) {
		var id = 'section_' + section_id, content_id = 'content_' + section_id,
			closed, sectionInfo = sectionData[ section_id ],
			$container,
			$section = $( '#' + id ), $button = $section.find( 'button' ), $content = $( '#' + content_id ),
			selector = '#' + content_id + ',#' + id + ',#anchor_' + section_id + ',#' + id + ' button'; // FIXME: shouldn't have to toggle class on button

		if ( sectionInfo && $content.length === 0 ) {
			$container = $( '<div class="content_block">' ).attr( 'id', content_id ).html( sectionInfo.html ).insertAfter( '#' + id );
			$( window ).trigger( 'mw-mf-section-rendered', [ $( content_id )[ 0 ] ] );
			M.history.hijackLinks( $container );
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

	function enableToggling( $container ) {
		var $headings = $container ? $container.find( '.section_heading' ) : $( '.section_heading' );
		$( 'html' ).addClass( 'togglingEnabled' );

		function openSectionHandler() {
			wm_toggle_section( $( this ).attr( 'id' ).split( '_' )[ 1 ] );
		}

		$headings.each( function() {
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
			$( '<button>' ).text( showLabel ).click( function( ev ) {
				ev.preventDefault();
				} ).prependTo( this );
			$this.on( 'click', openSectionHandler );
		} );
		// disable links
		$( 'h2 a' ).on( 'click', function( ev ) {
			ev.preventDefault();
		} );

		checkHash();
		$( '#content_wrapper a' ).on( 'click', checkHash );
	}

	function init() {
		var sections = [], pageTitle = $( 'h1' ).text();

		if ( !$( '#content_wrapper' ).hasClass( 'mw-mf-special' ) ) {
			$( window ).bind( 'mw-mf-page-loaded', function( ev, article ) {
				sectionData = article.data;
				enableToggling( $( '#content' ) );
				if ( !footerInitialised ) {
					enableToggling( $( '#footer' ) );
					footerInitialised = true;
				}
				_mwLogEvent( 'TogglingReady', $( '.section_heading' ).length );
			} );
			M.history.loadPage( pageTitle, false );
		} else {
			enableToggling();
		}
	}

	return {
		wm_reveal_for_hash: wm_reveal_for_hash,
		wm_toggle_section: wm_toggle_section,
		enableToggling: enableToggling,
		init: init
	};

}() );

M.registerModule( 'toggle', T );

}( mw.mobileFrontend, jQuery ) );
