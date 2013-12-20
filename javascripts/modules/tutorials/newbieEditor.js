( function( M, $ ) {
	var PageActionOverlay = M.require( 'modules/tutorials/PageActionOverlay' ),
		user = M.require( 'user' ),
		schema = M.require( 'loggingSchemas/mobileWebEditing' ),
		escapeHash = M.escapeHash,
		inEditor = window.location.hash.indexOf( '#editor/' ) > - 1,
		hash = window.location.hash,
		// A/B test showing the tutorial from the left nav
		shouldShowLeftNavEditTutorial = !inEditor && M.isBetaGroupMember() &&
			M.query.campaign === 'leftNavSignup' && M.isTestA,
		shouldShowEditTutorial = $( '#ca-edit' ).hasClass( 'enabled' ) &&
			// Shouldn't run when browser refreshed
			M.query.article_action === 'signup-edit' && !inEditor,
			showTutorial = shouldShowEditTutorial || shouldShowLeftNavEditTutorial,
			msg = shouldShowEditTutorial ? 'mobile-frontend-editor-tutorial-summary' :
				'mobile-frontend-editor-tutorial-alt-summary',
		editOverlay, target, $target, href;

	if ( hash && hash.indexOf( '/' ) === -1 ) {
		target = escapeHash( hash ) + ' ~ .edit-page';
	} else {
		target = '#ca-edit .edit-page';
	}

	// Note the element might have a new ID if the wikitext was changed so check it exists
	// Also check the page is actually editable...
	if ( !user.isAnon() && $( target ).length > 0 && showTutorial && mw.config.get( 'wgIsPageEditable' ) ) {

		if ( shouldShowLeftNavEditTutorial ) {
			$target = $( target );
			href = $target.attr( 'href' );
			// append the funnel name to the url
			$target.attr( 'href', href + '/leftNavSignup' );
			schema.log( { action: 'tutorial', section: 0, funnel: 'leftNavSignup' } );
		}

		editOverlay = new PageActionOverlay( {
			target: target,
			className: 'slide active editing',
			summary: mw.msg( msg, mw.config.get( 'wgTitle' ) ),
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

}( mw.mobileFrontend, jQuery ) );
