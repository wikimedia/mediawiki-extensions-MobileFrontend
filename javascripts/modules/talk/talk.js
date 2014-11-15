( function ( M, $ ) {
	var licenseLink = mw.config.get( 'wgMFLicenseLink' );

	M.assertMode( [ 'beta', 'alpha', 'app' ] );

	M.overlayManager.add( /^\/talk\/?(.*)$/, function ( id ) {
		var result = $.Deferred(),
			talkOptions = {
				title: $( '#ca-talk a' ).data( 'title' )
			};

		if ( $( '#footer-places-terms-use' ).length > 0 ) {
			talkOptions.licenseMsg = mw.msg( 'mobile-frontend-editor-licensing-with-terms',
				$( '#footer-places-terms-use' ).html(), licenseLink );
		} else {
			talkOptions.licenseMsg = mw.msg( 'mobile-frontend-editor-licensing', licenseLink );
		}

		M.loadModule( 'mobile.talk.overlays' ).done( function () {
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

	function init() {
		$( '#ca-talk a' )
			.attr( 'href', '#/talk' );
	}

	init();

}( mw.mobileFrontend, jQuery ) );
