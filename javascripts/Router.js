// FIXME: Merge this code with OverlayManager
( function ( M, $ ) {

	var key, router,
		EventEmitter = M.require( 'eventemitter' );

	/**
	 * Does hash match entry.path?
	 * @method
	 * @private
	 * @ignore
	 * @param {String} hash String to match
	 * @param {Object} entry Entry object
	 * @returns {Boolean} Whether hash matches entry.path
	 */
	function matchRoute( hash, entry ) {
		var match = hash.match( entry.path );
		if ( match ) {
			entry.callback.apply( this, match.slice( 1 ) );
			return true;
		}
		return false;
	}

	/**
	 * Provides navigation routing and location information
	 * @class Router
	 * @uses EventEmitter
	 */
	function Router() {
		EventEmitter.prototype.initialize.apply( this, arguments );
		var self = this;
		// use an object instead of an array for routes so that we don't
		// duplicate entries that already exist
		this.routes = {};
		this._enabled = true;
		this._oldHash = this.getPath();

		$( window ).on( 'popstate', function () {
			self.emit( 'popstate' );
		} );

		$( window ).on( 'hashchange', function () {
			// ev.originalEvent.newURL is undefined on Android 2.x
			var routeEv;

			if ( self._enabled ) {
				routeEv = $.Event( 'route', {
					path: self.getPath()
				} );
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

	for ( key in EventEmitter.prototype ) {
		if ( EventEmitter.prototype.hasOwnProperty( key ) ) {
			Router.prototype[ key ] = EventEmitter.prototype[ key ];
		}
	}

	/**
	 * Check the current route and run appropriate callback if it matches.
	 * @method
	 */
	Router.prototype.checkRoute = function () {
		var hash = this.getPath();

		$.each( this.routes, function ( id, entry ) {
			return !matchRoute( hash, entry );
		} );
	};

	/**
	 * Bind a specific callback to a hash-based route, e.g.
	 *
	 *     @example
	 *     route( 'alert', function () { alert( 'something' ); } );
	 *     route( /hi-(.*)/, function ( name ) { alert( 'Hi ' + name ) } );
	 *
	 * @method
	 * @param {Object} path String or RegExp to match.
	 * @param {Function} callback Callback to be run when hash changes to one
	 * that matches.
	 */
	Router.prototype.route = function ( path, callback ) {
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
	 * @param {String} path String with a route (hash without #).
	 */
	Router.prototype.navigate = function ( path ) {
		window.location.hash = path;
	};

	/**
	 * Navigate to the previous route. This is a wrapper for window.history.back
	 * @method
	 * @return {jQuery.Deferred}
	 */
	Router.prototype.back = function () {
		var deferredRequest = $.Deferred(),
			self = this,
			timeoutID;

		this.once( 'popstate', function () {
			clearTimeout( timeoutID );
			deferredRequest.resolve();
		} );

		window.history.back();

		// If for some reason (old browser, bug in IE/windows 8.1, etc) popstate doesn't fire,
		// resolve manually. Since we don't know for sure which browsers besides IE10/11 have
		// this problem, it's better to fall back this way rather than singling out browsers
		// and resolving the deferred request for them individually.
		// See https://connect.microsoft.com/IE/feedback/details/793618/history-back-popstate-not-working-as-expected-in-webview-control
		// Give browser a few ms to update its history.
		timeoutID = setTimeout( function () {
			self.off( 'popstate' );
			deferredRequest.resolve();
		}, 50 );

		return deferredRequest;
	};

	/**
	 * Get current path (hash).
	 *
	 * @method
	 * @return {String} Current path.
	 */
	Router.prototype.getPath = function () {
		return window.location.hash.slice( 1 );
	};

	/**
	 * Determine if current browser supports onhashchange event
	 * @method
	 * @return {Boolean}
	 */
	Router.prototype.isSupported = function () {
		return 'onhashchange' in window;
	};

	router = new Router();

	M.define( 'router', router );
	M.define( 'Router', Router );

}( mw.mobileFrontend, jQuery ) );
