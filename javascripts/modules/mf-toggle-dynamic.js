( function( M, $ ) {

var T = ( function() {
	var
		sectionData = {},
		anchorSection,
		footerInitialised = false;

	function wm_toggle_section( section_id, keepHash ) {
		var id = 'section_' + section_id, content_id = 'content_' + section_id,
			closed, sectionInfo = sectionData[ section_id ],
			$container,
			$section = $( '#' + id ), $content = $( '#' + content_id ),
			selector = '#' + content_id + ',#' + id;

		if ( sectionInfo && $content.length === 0 ) {
			$container = $( '<div class="content_block">' ).attr( 'id', content_id ).html( sectionInfo.html ).insertAfter( '#' + id );
			M.emit( 'section-rendered', $container );
			// FIXME: this should live in the hidpi module when dynamic sections is promoted from beta
			if ( $container.hidpi ) {
				$container.hidpi();
			}
			M.history.hijackLinks( $container );
		}

		$( selector ).toggleClass( 'openSection' );
		closed = $section.hasClass( 'openSection' );

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
			var id = $( this ).attr( 'id' );
			wm_toggle_section( id.split( '_' )[ 1 ] );
		}

		$headings.each( function() {
			var $this = $( this );
			// disable default behavior of the link in the heading
			$this.find( 'a' ).on( 'click', function( ev ) {
				ev.preventDefault();
			} );
			$this.on( 'click', openSectionHandler );
		} );

		$( '#content_wrapper a' ).on( 'click', checkHash );
	}

	function init() {
		var pageTitle = mw.config.get( 'wgTitle'),
			inViewMode = mw.config.get( 'wgAction' ) === 'view',
			isMainPage = mw.config.get( 'wgIsMainPage' ),
			isSpecialPage = mw.config.get( 'wgNamespaceNumber' ) ===  mw.config.get( 'wgNamespaceIds' ).special;

		M.on( 'page-loaded', function( article ) {
			sectionData = article.data || {};

			anchorSection = article.anchorSection;
			if ( $( '#content .section_heading' ).length > 1 ) {
				enableToggling( $( '#content' ) );
			}
			if ( !footerInitialised ) {
				enableToggling( $( '#footer' ) );
				footerInitialised = true;
			}
			checkHash();
		} );

		if ( !isMainPage && !isSpecialPage && inViewMode ) {
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

M.define( 'toggle-dynamic', T );

}( mw.mobileFrontend, jQuery ) );
