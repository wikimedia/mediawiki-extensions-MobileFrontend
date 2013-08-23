( function( M, $ ) {
	var schema = M.require( 'loggingSchemas/watchlist' ),
		thanks = M.require( 'thanks' );

	$( function() {
		var $user = $( '.mw-mf-user' ), $thankBtn,
			username = $user.data( 'user-name' ),
			rev = $user.data( 'revision-id' ),
			gender = $user.data( 'user-gender' );

		if ( !$user.hasClass( 'mw-mf-anon' ) ) {
			$thankBtn = thanks.createThankLink( username, rev, gender );
			if ( $thankBtn ) {
				$thankBtn.on( 'click', function() {
					schema.log( 'thanks', username );
				} ).prependTo( '#mw-mf-userinfo' );
			}
		}
	} );
} )( mw.mobileFrontend, jQuery );
