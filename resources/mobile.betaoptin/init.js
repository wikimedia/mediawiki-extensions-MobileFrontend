( function ( M, $ ) {
	var inSample, inStable,
		context = M.require( 'context' ),
		settings = M.require( 'settings' ),
		page = M.getCurrentPage(),
		token = settings.get( 'mobile-betaoptin-token' ),
		BetaOptinPanel = M.require( 'mobile.betaoptin/BetaOptinPanel' );

	// local storage is supported in this case, when ~ means it was dismissed
	if ( token !== false && token !== '~' && !page.inNamespace( 'special' ) ) {
		if ( !token ) {
			token = mw.user.generateRandomSessionId();
			settings.save( 'mobile-betaoptin-token', token );
		}

		inStable = !context.isBetaGroupMember();
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
