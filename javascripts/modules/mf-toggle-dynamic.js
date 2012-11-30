( function( M, $ ) {

var T = ( function() {
	var
		message = M.message,
		sectionData = {},
		anchorSection,
		footerInitialised = false,
		showLabel = message( 'mobile-frontend-show-button' ),
		hideLabel = message( 'mobile-frontend-hide-button' );

	function wm_toggle_section( section_id, keepHash ) {
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
		if ( !keepHash ) {
			M.history.replaceHash( closed ? '#' + id : '#_' );
		}
	}

	function wm_reveal_for_hash( hash, keepHash ) {
		wm_toggle_section( anchorSection[ hash.slice( 1 ) ], keepHash );
	}

	function checkHash() {
		var hash = window.location.hash, el;
		if ( hash ) {
			wm_reveal_for_hash( hash, true );
			// force scroll if not scrolled (e.g. after subsection is loaded)
			el = $( hash );
			if ( el.length ) {
				el[ 0 ].scrollIntoView( true );
			}
		}
	}

	function enableToggling( $container ) {
		var $headings = $container ? $container.find( '.section_heading' ) : $( '.section_heading' );
		$( 'html' ).addClass( 'togglingEnabled' );

		function openSectionHandler() {
			_mwLogEvent( 'SectionToggled', this.id );
			wm_toggle_section( $( this ).attr( 'id' ).split( '_' )[ 1 ] );
		}

		$headings.each( function() {
			var $this = $( this ), section = $this.attr( 'id' ).split( '_' )[ 1 ];
			if ( $this.parents( '.section' ).length === 1 ) {
				$( '#anchor_' +  section ).
					text( message( 'mobile-frontend-close-section' ) ).
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

		$( '#content_wrapper a' ).on( 'click', checkHash );
	}

	function init() {
		var pageTitle = $( 'h1' ).text(),
			specialPage = $( '#content_wrapper' ).hasClass( 'mw-mf-special' );

		$( window ).bind( 'mw-mf-page-loaded', function( ev, article ) {
			sectionData = article.data;

			anchorSection = article.anchorSection;
			if ( $( '#content .section_heading' ).length > 1 ) {
				enableToggling( $( '#content' ) );
			}
			if ( !footerInitialised ) {
				enableToggling( $( '#footer' ) );
				footerInitialised = true;
			}
			checkHash();
			_mwLogEvent( 'TogglingReady', $( '.section_heading' ).length );
		} );

		if ( !specialPage ) {
			M.history.loadPage( pageTitle, false );
		} else {
			enableToggling();
			footerInitialised = true;
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
