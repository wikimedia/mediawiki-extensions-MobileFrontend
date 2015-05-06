( function ( M, $ ) {
	var inSample, inStable,
		context = M.require( 'context' ),
		settings = M.require( 'settings' ),
		token = settings.get( 'mobile-betaoptin-token' ),
		BetaOptinPanel = M.require( 'mobile.betaoptin/BetaOptinPanel' );

	// local storage is supported in this case, when ~ means it was dismissed
	if ( token !== false && token !== '~' ) {
		if ( !token ) {
			token = mw.user.generateRandomSessionId();
			settings.save( 'mobile-betaoptin-token', token );
		}

		inStable = !context.isBetaGroupMember();
		// Correct all those poor souls who already opted in to beta via panel
		// and lost their images next time they view a page.
		// FIXME: Remove this in 30 days.
		if ( !inStable && mw.config.get( 'wgImagesDisabled' ) ) {
			$.post( mw.util.getUrl( 'Special:MobileOptions' ), {
				token: mw.user.tokens.get( 'editToken' ),
				enableImages: true
			} );
		}

		// a single character has 16 possibilities so this is 1/16 6.25% chance (a-f and 0-9)
		// 3% chance of this happening
		inSample = $.inArray( token.charAt( 0 ), [ '3' ] ) !== -1;
		if ( inStable && ( inSample || mw.util.getParamValue( 'debug' ) ) ) {
			new BetaOptinPanel()
				.on( 'hide', function () {
					settings.save( 'mobile-betaoptin-token', '~' );
				} )
				.appendTo( M.getCurrentPage().getLeadSectionElement() );
		}
	}

}( mw.mobileFrontend, jQuery ) );
