( function ( M, $ ) {
	var loader = M.require( 'loader' ),
		LoadingOverlay = M.require( 'LoadingOverlay' ),
		user = M.require( 'user' ),
		Button = M.require( 'Button' ),
		$talk = $( '.talk' ),
		page = M.getCurrentPage(),
		overlayManager = M.require( 'overlayManager' ),
		context = M.require( 'context' ),
		skin = M.require( 'skin' );

	context.assertMode( [ 'beta', 'alpha', 'app' ] );

	overlayManager.add( /^\/talk\/?(.*)$/, function ( id ) {
		var result = $.Deferred(),
			talkOptions = {
				title: $talk.data( 'title' ) || mw.config.get( 'wgPageName' ),
				licenseMsg: skin.getLicenseMsg()
			};

		loader.loadModule( 'mobile.talk.overlays' ).done( function () {
			var Overlay;
			if ( id === 'new' ) {
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
		new Button( {
			label: mw.msg( 'mobile-frontend-talk-add-overlay-submit' ),
			href: '#/talk/new',
			progressive: true
		} ).prependTo( '#content' );

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
