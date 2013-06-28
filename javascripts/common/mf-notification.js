( function( M, $ ) {
	var m = ( function() {
		var calculatePosition = function() {},
			canCancel = true,
			inBeta = mw.config.get( 'wgMFMode' ) === 'beta';

		if ( !M.supportsPositionFixed() ) {
			calculatePosition = function() {
				var h = $( '#mf-notification' ).outerHeight();
				$( '#mf-notification' ).css( {
					top:  ( window.innerHeight + window.pageYOffset ) - h,
					bottom: 'auto',
					position: 'absolute'
				} );
			};
			$( document ).scroll( calculatePosition );
		}

		function isVisible() {
			return $( '#mf-notification' ).is( ':visible' );
		}

		function show( html, classes ) {
			canCancel = false;
			window.setTimeout( function() {
				canCancel = true;
			}, 1000 );
			$( '#mf-notification div' ).html( html );
			calculatePosition();
			return $( '#mf-notification' ).
				removeAttr( 'class' ).
				addClass( classes ).
				addClass( 'position-fixed visible' );
		}

		function close( forceClose ) {
			var $notification = $( '#mf-notification' );
			if ( !$notification.hasClass( 'visible' ) || !canCancel ) {
				return;
			} else if ( !$notification.hasClass( 'locked' ) || forceClose ) {
				$( '#mf-notification' ).removeClass( 'visible' );
			}
		}

		function notifyAuthenticatedUser() {
			var msg = mw.msg( 'mobile-frontend-logged-in-toast-notification',
				mw.config.get( 'wgUserName' ) );

			if ( window.location.search.indexOf( 'welcome=yes' ) > -1 ) {
				show( msg, 'toast' );
			}
		}

		function init( firstRun ) {
			// FIXME: turn into view with template
			var el = $( '<div id="mf-notification" class="position-fixed"><div></div></div>' ).
				appendTo( '#mw-mf-page-center' )[ 0 ];

			if ( inBeta ) {
				notifyAuthenticatedUser();
			}

			firstRun = firstRun === undefined ? true : firstRun;

			function cancelBubble( ev ) {
				ev.stopPropagation();
			}
			el.ontouchstart = cancelBubble;
			$( '<button>' ).click( function( ev ) {
				ev.stopPropagation();
				close( true );
			} ).appendTo( '#mf-notification' );

			if ( firstRun ) {
				$( window ).scroll( function() {
					close();
				} );

				$( document.body ).bind( 'click touchstart', function() {
					close();
				} );
			}
		}

		$( init );
		return {
			close: close,
			isVisible: isVisible,
			show: show
		};

	}() );

	M.define( 'notifications', m );

}( mw.mobileFrontend, jQuery ) );
