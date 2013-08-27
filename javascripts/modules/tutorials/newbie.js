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
		var photoOverlay, editOverlay, target;

		if ( shouldShowEditTutorial() ) {
			if ( window.location.hash ) {
				target = window.location.hash + ' .edit-page';
			} else {
				target = '#ca-edit .edit-page';
			}

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
		} else if ( shouldShowUploadTutorial() ) {
			photoOverlay = new LeadPhotoTutorialOverlay( {
				target: $( '#ca-upload input' ),
				funnel: 'newbie'
			} );
			photoOverlay.show();
			$( '#ca-upload' ).on( 'mousedown', $.proxy( photoOverlay, 'hide' ) );
		}
	} );

}( mw.mobileFrontend, jQuery ) );
