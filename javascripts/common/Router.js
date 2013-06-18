( function( M, $ ) {

	var EventEmitter = M.require( 'eventemitter' );

	function matchRoute( hash, entry ) {
		var match = hash.match( entry.path );
		if ( match ) {
			entry.callback.apply( this, match.slice( 1 ) );
			return true;
		}
		return false;
	}

	function extractHash( url ) {
		var match = url.match( /#(.*)$/ );
		return ( match && match[1] ) || '';
	}

	function Router() {
		var self = this;
		// use an object instead of an array for routes so that we don't
		// duplicate entries that already exist
		this.routes = {};
		this._enabled = true;

		$( window ).on( 'hashchange', function( ev ) {
			// hashchange is async and location.hash might not contain the right hash anymore
			var hash = extractHash( ev.originalEvent.newURL ), routeEv = $.Event();

			if ( !self._enabled ) {
				self._enabled = true;
				return;
			}

			self.emit( 'route', routeEv );

			if ( !routeEv.isDefaultPrevented() ) {
				$.each( self.routes, function( id, entry ) {
					return !matchRoute( hash, entry );
				} );
			} else {
				// if route was prevented, ignore the next hash change and revert the
				// hash to its old value
				self._enabled = false;
				window.location.hash = extractHash( ev.originalEvent.oldURL );
			}
		} );
	}

	Router.prototype = new EventEmitter();

	/**
	 * Bind a specific callback to a hash-based route, e.g.
	 *
	 * @example
	 * route( 'alert', function() { alert( 'something' ); } );
	 * route( /hi-(.*)/, function( name ) { alert( 'Hi ' + name ) } );
	 *
	 * @param {Object} path String or RegExp to match.
	 * @param {Function} callback Callback to be run when hash changes to one
	 * that matches.
	 */
	Router.prototype.route = function( path, callback ) {
		var entry = {
			path: typeof path === 'string' ? new RegExp( '^' + path + '$' ) : path,
			callback: callback
		};
		this.routes[entry.path] = entry;
		matchRoute( window.location.hash.slice( 1 ), entry );
	};

	/**
	 * Navigate to a specific route. This is only a wrapper for changing the
	 * hash now.
	 *
	 * @param {string} path String with a route (hash without #).
	 */
	Router.prototype.navigate = function( path ) {
		window.location.hash = path;
	};

	Router.prototype.isSupported = function() {
		return 'onhashchange' in window;
	};

	M.define( 'Router', Router );

}( mw.mobileFrontend, jQuery ) );
