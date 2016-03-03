( function ( M, $ ) {
	var loader = M.require( 'mobile.overlays/moduleLoader' ),
		LoadingOverlay = M.require( 'mobile.overlays/LoadingOverlay' ),
		user = M.require( 'mobile.user/user' ),
		Button = M.require( 'mobile.startup/Button' ),
		$talk = $( '.talk' ),
		// use the plain return value here - T128273
		title = $talk.attr( 'data-title' ),
		page = M.getCurrentPage(),
		overlayManager = M.require( 'mobile.startup/overlayManager' ),
		skin = M.require( 'skins.minerva.scripts/skin' ),
		pageTitle, talkTitle;

	// if there's no title for any reason, don't do anything
	if ( !title ) {
		return;
	}
	// T127190
	title = decodeURIComponent( title );

	// sanity check: the talk namespace needs to have the next higher integer
	// of the page namespace (the api should add topics only to the talk page of the current
	// page)
	// (https://www.mediawiki.org/wiki/Manual:Using_custom_namespaces#Creating_a_custom_namespace)
	// The method to get associated namespaces will change later (maybe), see T487
	pageTitle = mw.Title.newFromText( mw.config.get( 'wgPageName' ) );
	talkTitle = mw.Title.newFromText( title );
	if (
		!pageTitle ||
		!talkTitle ||
		( pageTitle.getMainText() !== talkTitle.getMainText() ) ||
		( pageTitle.getNamespaceId() + 1 !== talkTitle.getNamespaceId() )
	) {
		return;
	}

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
