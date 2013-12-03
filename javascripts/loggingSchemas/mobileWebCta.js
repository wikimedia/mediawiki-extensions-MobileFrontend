( function( M, $ ) {

	function log( status, campaign, step ) {
		var
			user = M.require( 'user' ),
			username = user.getName(),
			data = {
				status: status,
				campaign: campaign || M.query.campaign,
				campaignStep: step,
				mobileMode: mw.config.get( 'wgMFMode' )
			};

		if ( username ) {
			data.username = username;
			data.userEditCount = mw.config.get( 'wgUserEditCount' );
		}

		return M.log( 'MobileWebCta', data );
	}

	// FIXME: Turn into common component shared with MobileWebClickTracking ?
	function hijackLink( $el, status, campaign, step, url ) {
		function linkHandler( ev ) {
			var href;
			ev.preventDefault();
			if ( url !== undefined ) {
				href = url;
			} else {
				href = $( this ).attr( 'href' );
			}
			log( status, campaign, step ).always( function() {
				window.location.href = href;
			} );
		}
		$el.on( M.tapEvent( 'click' ), linkHandler );
	}

	M.define( 'loggingSchemas/mobileWebCta', {
		log: log,
		hijackLink: hijackLink
	} );

} )( mw.mobileFrontend, jQuery );
