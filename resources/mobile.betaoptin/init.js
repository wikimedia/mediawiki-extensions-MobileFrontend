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
		// a single character has 36 possibilities so this is 2/36 5.6% chance (a-z and 0-9)
		// 3% chance of this happening
		inStable = !context.isBetaGroupMember();
		inSample = $.inArray( token.charAt( 0 ), [ '3', '2' ] ) !== 1;
		if ( inStable && ( inSample || mw.util.getParamValue( 'debug' ) ) ) {
			new BetaOptinPanel()
				.on( 'hide', function () {
					settings.save( 'mobile-betaoptin-token', '~' );
				} )
				.appendTo( M.getCurrentPage().getLeadSectionElement() );
		}
	}

}( mw.mobileFrontend, jQuery ) );
