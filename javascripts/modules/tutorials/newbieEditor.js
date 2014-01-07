/* When an editor registers via the edit page action show a blue guider
prompting them to continue editing.

You can replicate this by appending article_action=signup-edit to the URL of an
editable page whilst logged in. */
( function( M, $ ) {
	var PageActionOverlay = M.require( 'modules/tutorials/PageActionOverlay' ),
		user = M.require( 'user' ),
		escapeHash = M.escapeHash,
		inEditor = window.location.hash.indexOf( '#editor/' ) > - 1,
		hash = window.location.hash,
		// If the user came from an edit button signup, show guider.
		shouldShowEditTutorial = M.query.article_action === 'signup-edit' && !inEditor &&
			!user.isAnon() && mw.config.get( 'wgIsPageEditable' ),
		editOverlay, target;

	if ( hash && hash.indexOf( '/' ) === -1 ) {
		target = escapeHash( hash ) + ' ~ .edit-page';
	} else {
		target = '#ca-edit .edit-page';
	}

	// Note the element might have a new ID if the wikitext was changed so check it exists
	if ( $( target ).length > 0 && shouldShowEditTutorial ) {
		editOverlay = new PageActionOverlay( {
			target: target,
			className: 'slide active editing',
			summary: mw.msg( 'mobile-frontend-editor-tutorial-summary', mw.config.get( 'wgTitle' ) ),
			confirmMsg: mw.msg( 'mobile-frontend-editor-tutorial-confirm' ),
			cancelMsg: mw.msg( 'mobile-frontend-editor-tutorial-cancel' )
		} );
		editOverlay.show();
		$( '#ca-edit' ).on( 'mousedown', $.proxy( editOverlay, 'hide' ) );
		// Initialize the 'Start editing' button
		editOverlay.$( '.actionable' ).on( M.tapEvent( 'click' ), function() {
			// Hide the tutorial
			editOverlay.hide();
			// Load the editing interface by changing the URL hash
			window.location.href = $( target ).attr( 'href' );
		} );
	}

}( mw.mobileFrontend, jQuery ) );
