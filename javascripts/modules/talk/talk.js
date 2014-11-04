( function ( M, $ ) {
	var talkPrefix = mw.config.get( 'wgFormattedNamespaces' )[ mw.config.get( 'wgNamespaceNumber' ) + 1 ] + ':';

	M.assertMode( [ 'beta', 'alpha', 'app' ] );

	M.overlayManager.add( /^\/talk$/, function () {
		var result = $.Deferred(),
			talkOptions = {
				title: talkPrefix + M.getCurrentPage().title
			};

		M.loadModule( 'mobile.talk.overlays' ).done( function () {
			var TalkOverlay = M.require( 'modules/talk/TalkOverlay' );

			result.resolve( new TalkOverlay( talkOptions ) );
		} );
		return result;
	} );

	function init() {
		$( '#ca-talk a' ).
			attr( 'href', '#/talk' );
	}

	init();

}( mw.mobileFrontend, jQuery ) );
