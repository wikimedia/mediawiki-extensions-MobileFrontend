( function( M, $ ) {

	var EditorOverlay = M.require( 'modules/editor/EditorOverlay' );

	function addEditButton( section, container ) {
		$( '<a class="edit-page inline" href="#editor-' + section + '">' ).
			text( mw.msg( 'mobile-frontend-editor-edit' ) ).
			prependTo( container ).
			on( 'mouseup', function( ev ) {
				// prevent folding section when clicking Edit
				ev.stopPropagation();
			} );
	}

	function init() {
		M.router.route( /^editor-(\d+)$/, function( section ) {
			var title = mw.config.get( 'wgTitle' ), ns = mw.config.get( 'wgCanonicalNamespace' );
			section = parseInt( section, 10 );
			new EditorOverlay( {
				title: ns ? ns + ':' + title : title,
				isNew: mw.config.get( 'wgArticleId' ) === 0,
				section: section,
				// FIXME: possibly we should have a global Page instance with
				// a method for fetching this
				sectionCount: $( '#content h2' ).length + 1
			} ).show();
		} );
		$( '#ca-edit' ).addClass( 'enabled' );

		if ( $( '#content_0' ).text() ) {
			// if lead section is not empty, open editor with lead section
			addEditButton( 0, '#ca-edit' );
		} else {
			// if lead section is empty, open editor with first section
			addEditButton( 1, '#ca-edit' );
		}

		$( '.mw-editsection' ).each( function() {
			// FIXME [ParserOutput]: This is nasty
			var editHref = $( this ).find( 'a' ).attr( 'href' ),
				qs = editHref.split( '?' )[ 1 ],
				section = M.deParam( qs ).section;
			if ( section ) {
				addEditButton( section, $( this ).parent() );
			}
			$( this ).remove();
		} );
	}

	if (
		( mw.config.get( 'wgMFAnonymousEditing' ) || mw.config.get( 'wgUserName' ) ) &&
		mw.config.get( 'wgIsPageEditable' ) && M.router.isSupported()
	) {
		init();
		M.on( 'page-loaded', init );
	}

}( mw.mobileFrontend, jQuery ) );
