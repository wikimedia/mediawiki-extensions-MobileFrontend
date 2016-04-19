/*!
 * Animate patrol links to use asynchronous API requests to
 * patrol pages, rather than navigating to a different URI.
 *
 * @author Florian Schmidt <florian.schmidt.welzow@t-online.de>
 */
( function ( M, $ ) {
	if ( !mw.user.tokens.exists( 'patrolToken' ) ) {
		// Current user has no patrol right, or an old cached version of user.tokens
		// that didn't have patrolToken yet.
		return;
	}
	$( function () {
		var $patrolLinks = $( '.patrollink a' ),
			Icon = M.require( 'mobile.startup/Icon' ),
			toast = M.require( 'mobile.toast/toast' ),
			$spinner = $( new Icon( {
				name: 'spinner',
				additionalClassNames: 'savespinner loading'
			} ).toHtmlString() ),
			href, rcid, apiRequest;

		$patrolLinks.on( 'click', function ( e ) {
			// Hide the link show a spinner instead.
			$( e.target ).hide().after( $spinner );

			href = $( this ).attr( 'href' );
			rcid = mw.util.getParamValue( 'rcid', href );
			apiRequest = new mw.Api();
			apiRequest.postWithToken( 'patrol', {
				action: 'patrol',
				rcid: rcid
			} )
			.done( function ( data ) {
				var title;

				// Disable all patrollinks from the page.
				$patrolLinks.closest( '.patrollink' ).replaceWith(
					$( '<button>' )
						.addClass( 'mw-ui-button patrollink' )
						.prop( 'disabled', true )
						.text( $patrolLinks.closest( '.patrollink' ).text() )
				);
				$spinner.remove();
				if ( data.patrol !== undefined ) {
					// Success
					title = new mw.Title( data.patrol.title );
					toast.show( mw.msg( 'markedaspatrollednotify', title.toText() ) );
				} else {
					// This should never happen as errors should trigger fail
					toast.show( mw.msg( 'markedaspatrollederrornotify' ), 'error' );
				}
			} )
			.fail( function ( error ) {
				$spinner.remove();
				// Restore the patrol link. This allows the user to try again
				// (or open it in a new window, bypassing this ajax module).
				$patrolLinks.show();
				if ( error === 'noautopatrol' ) {
					// Can't patrol own
					toast.show( mw.msg( 'markedaspatrollederror-noautopatrol' ), 'warn' );
				} else {
					toast.show( mw.msg( 'markedaspatrollederrornotify' ), 'error' );
				}
			} );

			e.preventDefault();
		} );
	} );
}( mw.mobileFrontend, jQuery ) );
