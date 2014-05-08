( function( M, $ ) {

	var api = M.require( 'api' ),
		notContinue = null,
		header = '',
		processing = false;

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
		mw.loader.using( 'ext.echo.base', function() {
			$( '.mw-echo-notification' ).each( function () {
				mw.echo.setupNotificationLogging( $( this ), 'mobile-archive', true );
			} );
		} );
	}

	/**
	 * Load more notification records.
	 */
	function loadMore() {
		var notifications, data, container, $li, unread = [];

		api.get( {
			action : 'query',
			meta : 'notifications',
			notformat : 'html',
			notprop : 'index|list',
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
				mw.loader.using( 'ext.echo.base', function() {
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
	 */
	function markAsRead( unread ) {
		api.getTokenWithEndpoint( 'edit' ).done( function( token ) {
			api.post( {
				action : 'echomarkread',
				list : unread.join( '|' ),
				token : token
			} ).done( onSuccess ).fail( onError );
		} ).fail( onError );
	}

	function onSuccess() {
		if ( !notContinue ) {
			$( '#mw-echo-more' ).hide();
		}
		processing = false;
	}

	function onError() {
		// TODO: Show detail error message based on error code
		$( '#mw-echo-more' ).text( mw.msg( 'echo-load-more-error' ) );
		processing = false;
	}

	initialize();

}( mw.mobileFrontend, jQuery ) );
