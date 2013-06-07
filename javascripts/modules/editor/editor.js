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
			section = parseInt( section, 10 );
			new EditorOverlay( {
				title: mw.config.get( 'wgTitle' ),
				isNew: mw.config.get( 'wgArticleId' ) === 0,
				section: section,
				// FIXME: possibly we should have a global Page instance with
				// a method for fetching this
				sectionCount: $( '#content h2' ).length + 1
			} ).show();
		} );
		$( '#ca-edit' ).addClass( 'enabled' );
		addEditButton( 0, '#ca-edit' );
		$( '.section_heading' ).each( function( i ) {
			addEditButton( i + 1, this );
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
