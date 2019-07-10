/* global $ */
/*!
* Animate patrol links to use asynchronous API requests to
* patrol pages, rather than navigating to a different URI.
*
* @author Florian Schmidt <florian.schmidt.welzow@t-online.de>
*/
var user = mw.user,
	$spinner = require( './mobile.startup/icons' ).spinner( {
		additionalClassNames: 'savespinner loading'
	} ).$el,
	toast = require( './mobile.startup/toast' );

/**
 * Initialise mobile page patrolling as provided by the PageTriage extension.
 */
function init() {
	var $patrolLinks = $( '.patrollink a' ),
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
		} ).then( function ( data ) {
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
				toast.show( mw.msg( 'markedaspatrollederrornotify' ), { type: 'error' } );
			}
		}, function ( error ) {
			$spinner.remove();
			// Restore the patrol link. This allows the user to try again
			// (or open it in a new window, bypassing this ajax module).
			$patrolLinks.show();
			if ( error === 'noautopatrol' ) {
				// Can't patrol own
				toast.show( mw.msg( 'markedaspatrollederror-noautopatrol' ), { type: 'warn' } );
			} else {
				toast.show( mw.msg( 'markedaspatrollederrornotify' ), { type: 'error' } );
			}
		} );

		e.preventDefault();
	} );
}
if ( user.tokens.exists( 'patrolToken' ) ) {
	// Current user has no patrol right, or an old cached version of user.tokens
	// that didn't have patrolToken yet.
	$( init );
}
