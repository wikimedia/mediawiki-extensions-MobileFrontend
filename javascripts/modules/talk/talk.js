( function( M, $ ) {
	var LoadingOverlay = M.require( 'LoadingOverlay' ),
		talkPrefix = mw.config.get( 'wgFormattedNamespaces' )[ mw.config.get( 'wgNamespaceNumber' ) + 1 ] + ':';

	M.assertMode( [ 'beta', 'alpha', 'app' ] );

	M.overlayManager.add( /^\/talk$/, function() {
		var result = $.Deferred(),
			talkOptions = {
				title: talkPrefix + M.getCurrentPage().title
			},
			loadingOverlay = new LoadingOverlay();

		loadingOverlay.show();
		mw.loader.using( 'mobile.talk.common', function() {
			var TalkOverlay = M.require( 'modules/talk/TalkOverlay' );

			loadingOverlay.hide();
			result.resolve( new TalkOverlay( talkOptions ) );
		} );
		return result;
	} );

	function init() {
		$( '#ca-talk a' ).
			attr( 'href', '#/talk' );
		// enable Talk button (only to hide when JS disabled)
		$( '#ca-talk' ).removeClass( 'hidden' );
	}

	init();
	M.on( 'page-loaded', init );

}( mw.mobileFrontend, jQuery ) );
