( function( M, $ ) {
	var LeadPhotoTutorialOverlay = M.require( 'tutorials/LeadPhotoTutorialOverlay' ),
		PageActionOverlay = M.require( 'tutorials/PageActionOverlay' );

	function shouldShowUploadTutorial() {
		// FIXME: Limit audience to only users with low edit count
		return $( '#ca-upload' ).hasClass( 'enabled' ) &&
			window.location.search.indexOf( 'article_action=photo-upload' ) > -1;
	}

	function shouldShowEditTutorial() {
		// FIXME: Limit audience to only users with low edit count
		return $( '#ca-edit' ).hasClass( 'enabled' ) &&
			window.location.search.indexOf( 'article_action=edit' ) > -1;
	}

	$( function() {
		var photoOverlay, editOverlay;

		if ( shouldShowEditTutorial() ) {
			editOverlay = new PageActionOverlay( {
				target: $( '#ca-edit' ),
				noArrow: true,
				className: 'slide active editing',
				summary: mw.msg( 'mobile-frontend-editor-tutorial-summary', mw.config.get( 'wgTitle' ) ),
				confirmMsg: mw.msg( 'mobile-frontend-editor-tutorial-confirm' )
			} );
			editOverlay.show();
			$( '#ca-edit' ).on( 'mousedown', $.proxy( editOverlay, 'hide' ) );
			$( '.tutorial .actionable' ).click( function( ev ) {
				ev.preventDefault();
				// Hide the tutorial
				editOverlay.hide();
				// Load the editing interface
				window.location.href = $( '#ca-edit a.edit-page' ).attr( 'href' );
			} );
		} else if ( shouldShowUploadTutorial() ) {
			photoOverlay = new LeadPhotoTutorialOverlay( {
				target: $( '#ca-upload' ),
				funnel: 'newbie'
			} );
			photoOverlay.show();
			$( '#ca-upload' ).on( 'mousedown', $.proxy( photoOverlay, 'hide' ) );
		}
	} );

}( mw.mobileFrontend, jQuery ) );
