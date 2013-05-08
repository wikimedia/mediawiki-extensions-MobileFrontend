( function( M, $ ) {

	var EditorOverlay = M.require( 'modules/editor/EditorOverlay' );

	function addEditButton( section, container ) {
		$( '<button class="edit-page inline">' ).
			text( mw.msg( 'edit' ) ).
			prependTo( container ).
			on( 'mousedown', function( ev ) {
				// prevent folding section when clicking Edit
				ev.stopPropagation();

				new EditorOverlay( {
					title: mw.config.get( 'wgTitle' ),
					isNew: mw.config.get( 'wgArticleId' ) === 0,
					section: section,
					// FIXME: possibly we should have a global Page instance with
					// a method for fetching this
					sectionCount: $( '#content h2' ).length + 1
				} ).show();
			} );
	}

	if (
		( mw.config.get( 'wgMFAnonymousEditing' ) || mw.config.get( 'wgUserName' ) ) &&
		mw.config.get( 'wgIsPageEditable' )
	) {
		addEditButton( 0, '#content' );
		$( '.section_heading' ).each( function( i ) {
			addEditButton( i + 1, this );
		} );
	}

}( mw.mobileFrontend, jQuery ) );
