( function( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var LoadingOverlay = M.require( 'LoadingOverlay' ),
		Page = M.require( 'Page' ),
		loadingOverlay = new LoadingOverlay();

	function renderTalkOverlay( pageData ) {
		mw.loader.using( 'mobile.talk', function() {
			var TalkOverlay = M.require( 'modules/talk/TalkOverlay' );

			loadingOverlay.hide();
			new TalkOverlay( { page: new Page( pageData ) } ).show();
		} );
	}

	function onTalkClick( ev ) {
		var talkPage = $( this ).data( 'title' );

		ev.preventDefault();
		loadingOverlay.show();

		// FIXME: use Page's mechanisms for retrieving page data instead
		M.pageApi.getPage( talkPage ).fail( function( resp ) {
			var code;
			if ( resp.error ) {
				code = resp.error.code;
				if ( code === 'missingtitle' ) {
					renderTalkOverlay( {
						sections: [], title: talkPage
					} );
				// FIXME: [LQT] remove when liquid threads is dead (see Bug 51586)
				} else if ( code === 'lqt' ) {
					// Force a visit to the page
					window.location = mw.util.wikiGetlink( talkPage );
				}
			}
		} ).done( function( pageData ) {
			renderTalkOverlay( pageData );
		} );
	}

	function init( title ) {
		var talkPrefix = mw.config.get( 'wgFormattedNamespaces' ) [mw.config.get( 'wgNamespaceNumber' ) + 1 ] + ':';
		// FIXME change when micro.tap.js in stable
		$( '#ca-talk' ).on( M.tapEvent( 'click' ), onTalkClick ).data( 'title', talkPrefix + title );
	}

	init( mw.config.get( 'wgTitle' ) );
	M.on( 'page-loaded', function( page ) {
		init( page.title );
	} );

}( mw.mobileFrontend, jQuery ) );
