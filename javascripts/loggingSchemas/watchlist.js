( function( M, $ ) {
	var qs = window.location.search.substr( 1 ),
		params = mw.mobileFrontend.deParam( qs );

	M.define( 'loggingSchemas/watchlist', {
		log: function( action, destination ) {
			return M.log( 'MobileWatchlistInteraction', {
				action: action,
				userEditCount: parseInt( mw.config.get( 'wgUserEditCount' ), 10 ),
				watchlistview: params.watchlistview,
				filter: params.filters,
				destination: destination,
				page: mw.config.get( 'wgTitle' ),
				username: mw.config.get( 'wgUserName' ),
				mobileMode: mw.config.get( 'wgMFMode' )
			} );
		},
		hijackLink: function( selector, action ) {
			var schema = this;
			function linkHandler( ev ) {
				var action = $( this ).data( 'action' ),
					href = $( this ).attr( 'href' );
				ev.preventDefault();
				schema.log( action, href ).always( function() {
					window.location.href = href;
				} );
			}
			$( selector ).data( 'action', action ).
				on( 'click', linkHandler );
		}
	} );

} )( mw.mobileFrontend, jQuery );
