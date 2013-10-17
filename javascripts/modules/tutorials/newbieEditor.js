( function( M, $ ) {
	var PageActionOverlay = M.require( 'modules/tutorials/PageActionOverlay' ),
		escapeHash = M.require( 'toggle' ).escapeHash,
		shouldShowEditTutorial = $( '#ca-edit' ).hasClass( 'enabled' ) &&
			// Shouldn't run when browser refreshed
			M.query.article_action === 'signup-edit' && window.location.hash.indexOf( '#editor/' ) === - 1,
		editOverlay, target;

	if ( window.location.hash ) {
		target = escapeHash( window.location.hash ) + ' ~ .edit-page';
	} else {
		target = '#ca-edit .edit-page';
	}

	// Note if the element was changed since it might not exist.
	if ( M.isLoggedIn() && shouldShowEditTutorial && $( target ).length > 0 ) {

		if ( M.isTestA ) {
			// go straight to the editor if in bucket A
			window.location.href = $( target ).attr( 'href' );
		} else {
			editOverlay = new PageActionOverlay( {
				target: target,
				className: 'slide active editing',
				summary: mw.msg( 'mobile-frontend-editor-tutorial-summary', mw.config.get( 'wgTitle' ) ),
				confirmMsg: mw.msg( 'mobile-frontend-editor-tutorial-confirm' )
			} );
			editOverlay.show();
			$( '#ca-edit' ).on( 'mousedown', $.proxy( editOverlay, 'hide' ) );
			editOverlay.$( '.actionable' ).on( M.tapEvent( 'click' ), function() {
				// Hide the tutorial
				editOverlay.hide();
				// Load the editing interface
				window.location.href = $( target ).attr( 'href' );
			} );
		}
	}

}( mw.mobileFrontend, jQuery ) );
