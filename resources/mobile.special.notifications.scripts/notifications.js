( function ( M, $ ) {

	var api = M.require( 'api' ),
		notContinue = null,
		header = '',
		processing = false;

	/**
	 * Initialises JavaScript on the mobile version of Special:Notifications
	 * @method
	 * @ignore
	 */
	function initialize() {
		// Convert more link into a button and bind to loadMore function
		$( '#mw-echo-more' )
			.addClass( 'button' )
			.on( 'click', function ( ev ) {
				ev.preventDefault();
				if ( !processing ) {
					processing = true;
					loadMore();
				}
			} );
		notContinue = mw.config.get( 'wgEchoNextContinue' );
		header = mw.config.get( 'wgEchoDateHeader' );
		mw.loader.using( 'ext.echo.base', function () {
			$( '.mw-echo-notification' ).each( function () {
				mw.echo.setupNotificationLogging( $( this ), 'mobile-archive', true );
			} );
		} );
	}

	/**
	 * Load more notification records.
	 * @method
	 * @ignore
	 */
	function loadMore() {
		var notifications, data, container, $li, unread = [];

		// FIXME: Move to NotificationApi class
		api.get( {
			action: 'query',
			meta: 'notifications',
			notformat: 'html',
			notprop: 'index|list',
			notcontinue: notContinue,
			notlimit: mw.config.get( 'wgEchoDisplayNum' )
		} ).done( function ( result ) {
			container = $( '#mw-echo-special-container' );
			notifications = result.query.notifications;
			unread = [];

			$.each( notifications.index, function ( index, id ) {
				data = notifications.list[id];

				if ( header !== data.timestamp.date ) {
					header = data.timestamp.date;
					$( '<li>' ).addClass( 'mw-echo-date-section' ).append( header ).appendTo( container );
				}

				$li = $( '<li>' )
					.data( 'details', data )
					.data( 'id', id )
					.addClass( 'mw-echo-notification' )
					.attr( {
						// To facilitate debugging / bug reports
						'data-notification-event': data.id
					} )
					.append( data['*'] )
					.appendTo( container );

				if ( !data.read ) {
					$li.addClass( 'mw-echo-unread' );
					unread.push( id );
				}
				mw.loader.using( 'ext.echo.base', function () {
					mw.echo.setupNotificationLogging( $li, 'mobile-archive', true );
				} );
			} );

			notContinue = notifications['continue'];
			if ( unread.length > 0 ) {
				markAsRead( unread );
			} else {
				onSuccess();
			}
		} ).fail( function () {
			onError();
		} );
	}

	/**
	 * Mark notifications as read.
	 * @method
	 * @param {Array} unread id of unread ids to mark as read
	 * @ignore
	 */
	function markAsRead( unread ) {
		// FIXME: Move to NotificationApi class
		api.postWithToken( 'edit', {
			action: 'echomarkread',
			list: unread.join( '|' )
		} ).done( onSuccess ).fail( onError );
	}

	/**
	 * onSuccess callback
	 * Sets processing to false. Also hides #mw-echo-more if notContinue is false.
	 * @method
	 * @ignore
	 * @private
	 */
	function onSuccess() {
		if ( !notContinue ) {
			$( '#mw-echo-more' ).hide();
		}
		processing = false;
	}

	/**
	 * Set #mw-echo-more text to the contents of echo-load-more-error message .
	 * Also sets processing to false.
	 * onError callback
	 * @method
	 * @ignore
	 * @private
	 */
	function onError() {
		// TODO: Show detail error message based on error code
		$( '#mw-echo-more' ).text( mw.msg( 'echo-load-more-error' ) );
		processing = false;
	}

	initialize();

}( mw.mobileFrontend, jQuery ) );
