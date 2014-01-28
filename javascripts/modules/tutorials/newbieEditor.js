/* This code currently handles two different editing tutorials/CTAs:

EditTutorial - When an editor registers via the edit page action, upon returning to the
page, show a blue guider prompting them to continue editing. You can replicate this by
appending article_action=signup-edit to the URL of an editable page whilst logged in.

LeftNavEditTutorial - When an editor registers via the left navigation menu, upon
returning to the page, show a blue tutorial in 50% of cases prompting them to try
editing. You can replicate this by appending campaign=leftNavSignup to the URL of an
editable page whilst logged in, although you must be in test group A to see the CTA.
*/

( function( M, $ ) {
	var PageActionOverlay = M.require( 'modules/tutorials/PageActionOverlay' ),
		user = M.require( 'user' ),
		schema = M.require( 'loggingSchemas/mobileLeftNavbarEditCTA' ),
		escapeHash = M.escapeHash,
		inEditor = window.location.hash.indexOf( '#editor/' ) > - 1,
		hash = window.location.hash,
		// Whether or not the user was just redirected from a leftNav signup
		leftNavSignup = !user.isAnon() && M.query.campaign === 'leftNavSignup' &&
			mw.config.get( 'wgNamespaceNumber' ) === 0 && !inEditor,
		// Whether or not the user should actually see the guider (currently an A/B test)
		shouldShowLeftNavEditTutorial = leftNavSignup && M.isTestA &&
			mw.config.get( 'wgIsPageEditable' ),
		// If the user came from an edit button signup, show guider.
		shouldShowEditTutorial = M.query.article_action === 'signup-edit' && !inEditor &&
			!user.isAnon() && mw.config.get( 'wgIsPageEditable' ),
		showTutorial = shouldShowEditTutorial || shouldShowLeftNavEditTutorial,
		msg = shouldShowEditTutorial ? 'mobile-frontend-editor-tutorial-summary' :
			'mobile-frontend-editor-tutorial-alt-summary',
		editOverlay, target, $target, href;

	if ( hash && hash.indexOf( '/' ) === -1 ) {
		target = escapeHash( hash ) + ' ~ .edit-page';
	} else {
		target = '#ca-edit .edit-page';
	}

	// If the user is in the leftNavSignup campaign and the page is in main namespace,
	// record the page impression (even if they can't edit the page)
	if ( leftNavSignup ) {
		schema.log( { action: 'page-impression' } );
	}

	// Note the element might have a new ID if the wikitext was changed so check it exists
	if ( $( target ).length > 0 && showTutorial ) {

		if ( shouldShowLeftNavEditTutorial ) {
			// Log the impression for the call-to-action
			schema.log( { action: 'cta-impression' } );
			// Append the funnel name to the edit link's url
			$target = $( target );
			href = $target.attr( 'href' );
			$target.attr( 'href', href + '/leftNavSignup' );
			// Add appropriate logging functionality to the edit button
			$target.on( M.tapEvent( 'click' ), function() {
				schema.log( {
					action: 'page-edit-click',
					clickSource: 'edit'
				} );
			} );
		}

		editOverlay = new PageActionOverlay( {
			target: target,
			className: 'slide active editing',
			summary: mw.msg( msg, mw.config.get( 'wgTitle' ) ),
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
			if ( shouldShowLeftNavEditTutorial ) {
				// Log the action
				schema.log( {
					action: 'page-edit-click',
					clickSource: 'cta'
				} );
			}
		} );
	}

}( mw.mobileFrontend, jQuery ) );
