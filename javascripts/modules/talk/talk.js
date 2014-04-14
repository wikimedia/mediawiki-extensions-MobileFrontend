( function( M, $ ) {
	var LoadingOverlay = M.require( 'LoadingOverlayNew' );

	M.assertMode( [ 'beta', 'alpha', 'app' ] );

	function onTalkClick( ev ) {
		var talkPage = $( this ).data( 'title' ),
			loadingOverlay = new LoadingOverlay();

		ev.preventDefault();
		loadingOverlay.show();
		mw.loader.using( 'mobile.talk.common', function() {
			var TalkOverlay = M.require( 'modules/talk/TalkOverlay' );

			loadingOverlay.hide();
			new TalkOverlay( {
				title: talkPage
			} );
		} );
	}

	function init( title ) {
		var talkPrefix = mw.config.get( 'wgFormattedNamespaces' )[ mw.config.get( 'wgNamespaceNumber' ) + 1 ] + ':';
		// FIXME change when micro.tap.js in stable
		$( '#ca-talk' ).on( M.tapEvent( 'click' ), onTalkClick ).data( 'title', talkPrefix + title );
	}

	init( mw.config.get( 'wgTitle' ) );
	M.on( 'page-loaded', function( page ) {
		init( page.title );
	} );

}( mw.mobileFrontend, jQuery ) );
