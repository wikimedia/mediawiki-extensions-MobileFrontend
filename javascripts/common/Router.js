( function( M, $ ) {

	var EventEmitter = M.require( 'eventemitter' );

	function matchRoute( hash, route ) {
		var match = hash.match( route.path );
		if ( match ) {
			route.callback.apply( this, match.slice( 1 ) );
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
		this.routes = [];
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
				$.each( self.routes, function( i, entry ) {
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
			path: path instanceof RegExp ? path : new RegExp( '^' + path + '$' ),
			callback: callback
		};
		this.routes.push( entry );
		matchRoute( window.location.hash.slice( 1 ), entry );
	};

	Router.prototype.isSupported = function() {
		return 'onhashchange' in window;
	};

	M.define( 'Router', Router );

}( mw.mobileFrontend, jQuery ) );
