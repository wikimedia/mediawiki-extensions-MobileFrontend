( function( M, $ ) {
	var api = M.require( 'api' ),
		popup = M.require( 'notifications' ),
		popupClass = 'toast';

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
				popup.show(
					mw.msg( 'mobile-frontend-thanked-notice', name, gender ),
					popupClass
				);
				d.resolve();
			} )
			.fail( function( errorCode ) {
				switch( errorCode ) {
					case 'invalidrevision':
						popup.show( mw.msg( 'thanks-error-invalidrevision' ), popupClass );
						break;
					case 'ratelimited':
						popup.show( mw.msg( 'thanks-error-ratelimited' ), popupClass );
						break;
					default:
						popup.show( mw.msg( 'thanks-error-undefined' ), popupClass );
				}
				d.reject();
			} );
		} );
		return d;
	}

	function createThankLink() {
		var $user = $( '.mw-mf-user' );
		// Don't show thank button for anonymous users or self
		if ( !$user.hasClass( 'mw-mf-anon' ) &&
			$user.data( 'user-name' ) !== mw.config.get( 'wgUserName' ) )
		{
			$( '<button class="mw-mf-thank-button">' )
				.text( mw.msg( 'thanks-thank' ) )
				.on( 'click', function() {
					var $thankLink = $( this ),
						name = $user.data( 'user-name' ),
						rev = $user.data( 'user-id' ),
						gender = $user.data( 'user-gender' );

					if ( !$thankLink.hasClass( 'thanked' ) ) {
						thankUser( name, rev, gender  ).done( function() {
							$thankLink.addClass( 'thanked' ).attr( 'disabled', true );
							$thankLink.text( mw.message( 'thanks-thanked', mw.user ).escaped() );
						} );
					}
				} )
				.prependTo( '#mw-mf-userinfo' );
		}
	}

	$( function() {
		createThankLink();
	} );
} )( mw.mobileFrontend, jQuery );
