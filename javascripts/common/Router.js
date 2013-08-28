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

	function getHash() {
		return window.location.hash.slice( 1 );
	}

	function Router() {
		var self = this;
		// use an object instead of an array for routes so that we don't
		// duplicate entries that already exist
		this.routes = {};
		this._enabled = true;
		this._oldHash = getHash();

		$( window ).on( 'hashchange', function() {
			// ev.originalEvent.newURL is undefined on Android 2.x
			var routeEv = $.Event();

			if ( self._enabled ) {
				self.emit( 'route', routeEv );

				if ( !routeEv.isDefaultPrevented() ) {
					self.checkRoute();
				} else {
					// if route was prevented, ignore the next hash change and revert the
					// hash to its old value
					self._enabled = false;
					window.location.hash = self._oldHash;
				}
			} else {
				self._enabled = true;
			}

			self._oldHash = getHash();
		} );
	}

	Router.prototype = new EventEmitter();

	/**
	 * Check the current route and run appropriate callback if it matches.
	 */
	Router.prototype.checkRoute = function() {
		var hash = getHash();

		$.each( this.routes, function( id, entry ) {
			return !matchRoute( hash, entry );
		} );
	};

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
		matchRoute( getHash(), entry );
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
