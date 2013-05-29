( function( M, $ ) {

var T = ( function() {
	var
		toggle = M.require( 'toggle' ),
		currentPage,
		Page = M.require( 'page' );

	M.on( 'section-toggle', function( section_id ) {
		var
			$content = $( '#content_' + section_id ),
			loaded = $content.data( 'loaded' ), section;

		if ( !loaded && currentPage ) {
			section = currentPage.getSectionFromAnchor( 'section_' + section_id );
			if ( section ) {
				$content.html( section.content ).data( 'loaded', true );
			}
			M.emit( 'section-rendered', $content );
		}
	} );

	function checkHash() {
		var hash = window.location.hash, el, section;
		if ( hash ) {
			section = currentPage.getSectionFromAnchor( hash.slice( 1 ) );
			if ( section ) {
				toggle.wm_toggle_section( section.index );
			}
			// force scroll if not scrolled (e.g. after subsection is loaded)
			el = $( hash );
			if ( el.length ) {
				el[ 0 ].scrollIntoView( true );
			}
		}
	}

	function refresh( page ) {
		var references = page.getReferenceSection();
		currentPage = page;
		if ( references ) {
			$( '#content_' + references.index ).html( references.content ).data( 'loaded', true );
			M.emit( 'references-loaded' );
		}
		checkHash();
	}

	function init() {
		var pageTitle = mw.config.get( 'wgTitle'),
			inViewMode = mw.config.get( 'wgAction' ) === 'view',
			isMainPage = mw.config.get( 'wgIsMainPage' ),
			isMainNamespace = mw.config.get( 'wgNamespaceNumber' ) ===  mw.config.get( 'wgNamespaceIds' )[''];

		if ( !isMainPage && isMainNamespace && inViewMode ) {
			M.history.retrievePage( pageTitle ).done( function( pageData ) {
				currentPage = new Page( pageData );
				refresh( currentPage );
			} );
		}
	}
	M.on( 'page-loaded', refresh );

	return {
		init: init
	};

}() );

M.define( 'toggle-dynamic', T );

}( mw.mobileFrontend, jQuery ) );
