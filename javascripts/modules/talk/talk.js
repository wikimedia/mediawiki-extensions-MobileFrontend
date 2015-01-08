( function ( M, $ ) {
	var loader = M.require( 'loader' ),
		LoadingOverlay = M.require( 'LoadingOverlay' ),
		user = M.require( 'user' ),
		licenseLink = mw.config.get( 'wgMFLicenseLink' ),
		$talk = $( '.talk' ),
		page = M.getCurrentPage(),
		context = M.require( 'context' );

	context.assertMode( [ 'beta', 'alpha', 'app' ] );

	M.overlayManager.add( /^\/talk\/?(.*)$/, function ( id ) {
		var result = $.Deferred(),
			talkOptions = {
				title: $talk.data( 'title' ) || mw.config.get( 'wgPageName' )
			};

		// FIXME: cache this selector, it's used more than once
		if ( $( '#footer-places-terms-use' ).length > 0 ) {
			talkOptions.licenseMsg = mw.msg( 'mobile-frontend-editor-licensing-with-terms',
				$( '#footer-places-terms-use' ).html(), licenseLink );
		} else {
			talkOptions.licenseMsg = mw.msg( 'mobile-frontend-editor-licensing', licenseLink );
		}

		loader.loadModule( 'mobile.talk.overlays' ).done( function () {
			var Overlay;
			if (  id === 'new' ) {
				Overlay = M.require( 'modules/talk/TalkSectionAddOverlay' );
			} else if ( id ) {
				talkOptions.id = id;
				Overlay = M.require( 'modules/talk/TalkSectionOverlay' );
			} else {
				Overlay = M.require( 'modules/talk/TalkOverlay' );
			}
			result.resolve( new Overlay( talkOptions ) );
		} );
		return result;
	} );

	/**
	 * Create route '#/talk'
	 * @ignore
	 */
	function init() {
		$talk.attr( 'href', '#/talk' );
	}

	init();

	// add an "add discussion" button to talk pages (only for beta and logged in users)
	if (
		context.isBetaGroupMember() &&
		!user.isAnon() &&
		( page.inNamespace( 'talk' ) || page.inNamespace( 'user_talk' ) )
	) {
		// FIXME: Like icons.js, it should be possible to easily create a button, instead of this
		$( '<a class="mw-ui-button mw-ui-progressive">' )
			.text( mw.msg( 'mobile-frontend-talk-add-overlay-submit' ) )
			.attr( 'href', '#/talk/new' )
			.prependTo( '#content' );

		// reload the page after the new discussion was added
		M.on( 'talk-added-wo-overlay', function () {
			var loadingOverlay = new LoadingOverlay();

			window.location.hash = '';
			// setTimeout to make sure, that loadingOverlay's overlayenabled class on html doesnt get removed by
			// OverlayManager (who closes TalkSectionAddOverlay
			window.setTimeout( function () {
				loadingOverlay.show();
				window.location.reload();
			}, 10 );
		} );
	}
}( mw.mobileFrontend, jQuery ) );
