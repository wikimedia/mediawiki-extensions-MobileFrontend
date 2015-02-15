( function ( M, $ ) {
	var loader = M.require( 'loader' ),
		LoadingOverlay = M.require( 'LoadingOverlay' ),
		user = M.require( 'user' ),
		Button = M.require( 'Button' ),
		$talk = $( '.talk' ),
		title = $talk.data( 'title' ) || mw.config.get( 'wgPageName' ),
		page = M.getCurrentPage(),
		overlayManager = M.require( 'overlayManager' ),
		skin = M.require( 'skin' );

	overlayManager.add( /^\/talk\/?(.*)$/, function ( id ) {
		var result = $.Deferred(),
			talkOptions = {
				title: title,
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
		var talkTitle;

		// FIXME: Remove this after cache is cleared
		if ( !$talk.length && page.inNamespace( '' ) ) {
			// talk page title
			talkTitle = new mw.Title( mw.config.get( 'wgTitle' ), 1 );
			$( '#page-secondary-actions' ).prepend(
				'<a href="' +
				talkTitle.getUrl() +
				'" data-title="' +
				talkTitle.getPrefixedText() +
				'" class="mw-ui-icon mw-ui-icon-before mw-ui-icon-talk talk icon-32px mw-ui-button button">' +
				mw.msg( 'talk' ) +
				'</a>'
			);
			title = talkTitle.getPrefixedText();
		}
		$talk.on( 'click', function () {
			window.location.hash = '#/talk';
			return false;
		} );
	}

	init();

	// add an "add discussion" button to talk pages (only for beta and logged in users)
	if (
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
