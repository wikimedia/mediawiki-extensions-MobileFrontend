( function( M, $ ) {
	var api = M.require( 'api' ),
		popup = M.require( 'notifications' );

	function thankUser( name, revision, gender ) {
		var d = $.Deferred();
		api.getToken( 'edit' ).done( function( token ) {
			api.get( {
				'action' : 'thank',
				'rev' : revision,
				'source' : 'mobilediff',
				'token' : token
			} )
			.done( function() {
				popup.show( mw.msg( 'mobile-frontend-thanked-notice', name, gender ) );
				d.resolve();
			} )
			.fail( function( errorCode ) {
				switch( errorCode ) {
					case 'invalidrevision':
						popup.show( mw.msg( 'thanks-error-invalidrevision' ) );
						break;
					case 'ratelimited':
						popup.show( mw.msg( 'thanks-error-ratelimited' ) );
						break;
					default:
						popup.show( mw.msg( 'thanks-error-undefined' ) );
				}
				d.reject();
			} );
		} );
		return d;
	}

	/**
	 * Create a thank button for a given edit
	 *
	 * @param name String The username of the user who made the edit
	 * @param rev String The revision the user created
	 * @param gender String The gender of the user who made the edit
	 */
	function createThankLink( name, rev, gender ) {
		// Don't make thank button for self
		if ( name !== mw.config.get( 'wgUserName' ) ) {
			return $( '<button class="mw-mf-thank-button">' )
				.text( mw.msg( 'thanks-thank' ) )
				.on( 'click', function() {
					var $thankLink = $( this );

					if ( !$thankLink.hasClass( 'thanked' ) ) {
						thankUser( name, rev, gender  ).done( function() {
							$thankLink.addClass( 'thanked' ).attr( 'disabled', true );
							$thankLink.text( mw.message( 'thanks-thanked', mw.user ).escaped() );
						} );
					}
				} );
		}
	}

	M.define( 'thanks', {
		createThankLink: createThankLink
	} );
} )( mw.mobileFrontend, jQuery );
