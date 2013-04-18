( function( M, $ ) {

var T = ( function() {
	var
		currentPage,
		Page = M.require( 'page' );

	function wm_toggle_section( section_id ) {
		var id = 'section_' + section_id, content_id = 'content_' + section_id,
			closed,
			$section = $( '#' + id ), $content = $( '#' + content_id ),
			loaded = $content.data( 'loaded' ), section,
			selector = '#' + content_id + ',#' + id;

		if ( !loaded ) {
			section = currentPage.getSectionFromAnchor( id );
			if ( section ) {
				$content.html( section.content ).data( 'loaded', true );
			}
			M.emit( 'section-rendered', $content );
		}

		$( selector ).toggleClass( 'openSection' );
		closed = $section.hasClass( 'openSection' );
	}

	function wm_reveal_for_hash( hash ) {
		var section = currentPage.getSectionFromAnchor( hash.slice( 1 ) );
		if ( section ) {
			wm_toggle_section( section.index );
		}
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

	function refresh() {
		var references = currentPage.getReferenceSection();
		if ( references ) {
			$( '#content_' + references.index ).html( references.content ).data( 'loaded', true );
			M.emit( 'references-loaded' );
		}
		if ( $( '#content .section_heading' ).length > 1 ) {
			enableToggling( $( '#content' ) );
		}
		checkHash();
	}

	function init() {
		var pageTitle = mw.config.get( 'wgTitle'),
			inViewMode = mw.config.get( 'wgAction' ) === 'view',
			isMainPage = mw.config.get( 'wgIsMainPage' ),
			isSpecialPage = mw.config.get( 'wgNamespaceNumber' ) ===  mw.config.get( 'wgNamespaceIds' ).special;

		if ( !isMainPage && !isSpecialPage && inViewMode ) { // talk pages and normal pages only?
			M.history.retrievePage( pageTitle ).done( function( pageData ) {
				currentPage = new Page( pageData );
				refresh();
			} );
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

M.define( 'toggle-dynamic', T );

}( mw.mobileFrontend, jQuery ) );
