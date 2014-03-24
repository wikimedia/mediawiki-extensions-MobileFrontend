( function( M, $ ) {

	var EventEmitter = M.require( 'eventemitter' );

	// FIXME: remove when OverlayManager used everywhere
	function matchRoute( hash, entry ) {
		var match = hash.match( entry.path );
		if ( match ) {
			entry.callback.apply( this, match.slice( 1 ) );
			return true;
		}
		return false;
	}

	/**
	 * @class Router
	 */
	function Router() {
		var self = this;
		// use an object instead of an array for routes so that we don't
		// duplicate entries that already exist
		this.routes = {};
		this._enabled = true;
		this._oldHash = this.getPath();

		$( window ).on( 'hashchange', function() {
			// ev.originalEvent.newURL is undefined on Android 2.x
			var routeEv;

			if ( self._enabled ) {
				routeEv = $.Event( 'route', { path: self.getPath() } );
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

			self._oldHash = self.getPath();
		} );
	}

	Router.prototype = new EventEmitter();

	// FIXME: remove when OverlayManager used everywhere
	/**
	 * Check the current route and run appropriate callback if it matches.
	 * @method
	 */
	Router.prototype.checkRoute = function() {
		var hash = this.getPath();

		$.each( this.routes, function( id, entry ) {
			return !matchRoute( hash, entry );
		} );
	};

	/**
	 * Bind a specific callback to a hash-based route, e.g.
	 * FIXME: remove when OverlayManager used everywhere
	 *
	 *     @example
	 *     route( 'alert', function() { alert( 'something' ); } );
	 *     route( /hi-(.*)/, function( name ) { alert( 'Hi ' + name ) } );
	 *
	 * @method
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
		matchRoute( this.getPath(), entry );
	};

	/**
	 * Navigate to a specific route. This is only a wrapper for changing the
	 * hash now.
	 *
	 * @method
	 * @param {string} path String with a route (hash without #).
	 */
	Router.prototype.navigate = function( path ) {
		window.location.hash = path;
	};

	/**
	 * Navigate to the previous route. This is a wrapper for window.history.back
	 * @method
	 */
	Router.prototype.back = function() {
		window.history.back();
	};

	/**
	 * Get current path (hash).
	 *
	 * @method
	 * @return {string} Current path.
	 */
	Router.prototype.getPath = function() {
		return window.location.hash.slice( 1 );
	};

	/**
	 * @method
	 * @return {Boolean}
	 */
	Router.prototype.isSupported = function() {
		return 'onhashchange' in window;
	};

	M.define( 'Router', Router );

}( mw.mobileFrontend, jQuery ) );
