( function ( M, $ ) {
	var loader = M.require( 'mobile.overlays/moduleLoader' ),
		LoadingOverlay = M.require( 'mobile.overlays/LoadingOverlay' ),
		user = M.require( 'mobile.user/user' ),
		Button = M.require( 'mobile.startup/Button' ),
		$talk = $( '.talk' ),
		title = $talk.data( 'title' ) && decodeURIComponent( $talk.data( 'title' ) ) ||
			mw.config.get( 'wgPageName' ),
		page = M.getCurrentPage(),
		overlayManager = M.require( 'mobile.startup/overlayManager' ),
		skin = M.require( 'skins.minerva.scripts/skin' );

	overlayManager.add( /^\/talk\/?(.*)$/, function ( id ) {
		var result = $.Deferred(),
			talkOptions = {
				api: new mw.Api(),
				title: title,
				licenseMsg: skin.getLicenseMsg()
			};

		loader.loadModule( 'mobile.talk.overlays' ).done( function () {
			var Overlay;
			if ( id === 'new' ) {
				Overlay = M.require( 'mobile.talk.overlays/TalkSectionAddOverlay' );
			} else if ( id ) {
				talkOptions.id = id;
				Overlay = M.require( 'mobile.talk.overlays/TalkSectionOverlay' );
			} else {
				Overlay = M.require( 'mobile.talk.overlays/TalkOverlay' );
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
		$talk.on( 'click', function () {
			window.location.hash = '#/talk';
			return false;
		} );
	}

	init();

	// add an "add discussion" button to talk pages (only for logged in users)
	if (
		!user.isAnon() &&
		( page.inNamespace( 'talk' ) || page.inNamespace( 'user_talk' ) )
	) {
		new Button( {
			label: mw.msg( 'mobile-frontend-talk-add-overlay-submit' ),
			href: '#/talk/new',
			progressive: true
		} ).prependTo( '#content #bodyContent' );

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
