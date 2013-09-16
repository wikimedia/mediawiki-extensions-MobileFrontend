window.History = {
	Adapter: {
		bind: function() {},
		trigger: function() {}
	},
	enabled: false,
	history: window.history
};

( function( H, $ ) {
	var lastState, currentState, h = H.history;

	function isBrowserSupported( ua ) {
		// http://caniuse.com/history
		return (
			// Chrome browser 5-9
			ua.match( /Chrome\/[5-9]\./ ) ||
			// Chrome 10+
			ua.match( /Chrome\/[1-9][0-9]+\./ ) ||
			// iOS 5+
			ua.match( /OS [5-9]_.*like Mac OS X/ ) ||
			// iOS 10+ (future proofing)
			ua.match( /OS [1-9][0-9]_.*like Mac OS X/ )
		) ? true : false;
	}

	function storeState( data, title, url ) {
		return {
			data: data,
			title: title,
			url: url || window.location.pathname
		};
	}

	function pop( ev ) {
		if ( ev.originalEvent && ev.originalEvent.state ) {
			// native browser event
			currentState = ev.originalEvent.state;
			H.Adapter.trigger( window, 'statechange' );
		} else if ( lastState ) {
			// event triggered in H.pushState() or H.replaceState()
			H.Adapter.trigger( window, 'statechange' );
		}
	}

	function enable() {
		H.enabled = true;
		H.pushState = function( data, title, url ) {
			lastState = currentState;
			currentState = storeState( data, title, url );
			h.pushState( currentState, title, url );
			H.Adapter.trigger( window, 'popstate' );
		};
		H.replaceState = function( data, title, url ) {
			lastState = currentState;
			currentState = storeState( data, title, url );
			h.replaceState( currentState, title, url );
			// we may have replaced the url with another url
			H.Adapter.trigger( window, 'popstate' );
		};
		H.getState = function() {
			return currentState;
		};
		H.Adapter.bind = function( el, event, callback ) {
			$( el ).on( event, callback );
		};
		H.Adapter.trigger = function( el, event, callback ) {
			$( el ).trigger( event, callback );
		};
		H.Adapter.bind( window, 'popstate', pop );
	}

	// feature detect first
	if ( window.history && history.pushState && isBrowserSupported( window.navigator.userAgent ) ) {
		enable();
	}

	// exposed for tests
	window.History._isBrowserSupported = isBrowserSupported;
	window.History._enable = enable;
} ( window.History, jQuery ) );
