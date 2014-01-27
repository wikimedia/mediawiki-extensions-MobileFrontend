( function( M, $ ) {

	var
		Class = M.require( 'Class' ),
		OverlayManager;

	/**
	 * @class
	 * @extends Class
	 * @name OverlayManager
	 */
	OverlayManager = Class.extend( {
		initialize: function( router ) {
			router.on( 'route', $.proxy( this, '_checkRoute' ) );
			this.router = router;
			// use an object instead of an array for routes so that we don't
			// duplicate entries that already exist
			this.routes = {};
			this.stack = [];
			this.hidePrevious = true;
		},

		_showOverlay: function( overlay ) {
			var self = this;

			// if hidden using overlay (not hardware) button, update the state
			overlay.on( 'hide', function() {
				self.hidePrevious = false;
				self.router.back();
			} );
			overlay.show();
		},

		_processMatch: function( match ) {
			var self = this, result;

			if ( match ) {
				result = match.result;
				// http://stackoverflow.com/a/13075985/365238
				if ( $.isFunction( result.promise ) ) {
					result.done( function( overlay ) {
						match.overlay = overlay;
						self._showOverlay( overlay );
					} );
				} else {
					match.overlay = result;
					self._showOverlay( result );
				}
			}
		},

		_checkRoute: function( ev ) {
			var
				self = this,
				previous = this.stack[0],
				match;

			$.each( this.routes, function( id, entry ) {
				match = self._matchRoute( ev.path, entry );
				return match === null;
			} );

			// force hide only if more overlays in stack
			if ( previous &&
				previous.overlay !== undefined &&
				this.hidePrevious &&
				!previous.overlay.hide( this.stack.length > 1 )
			) {
				// if hide prevented, prevent route change event
				ev.preventDefault();
			} else if ( !match ) {
				// if hidden and no new matches, reset the stack
				this.stack = [];
			}

			this.hidePrevious = true;
			this._processMatch( match );
		},

		_matchRoute: function( path, entry ) {
			var
				match = path.match( entry.route ),
				previous = this.stack[1],
				current;

			if ( match ) {
				// if previous stacked overlay's path matches, assume we're going back
				if ( previous && previous.path === path ) {
					this.stack.shift();
					return previous;
				} else {
					current = {
						path: path,
						result: entry.factory.apply( this, match.slice( 1 ) )
					};
					this.stack.unshift( current );
					return current;
				}
			}

			return null;
		},

		/**
		 * Add an overlay that should be shown on a specific route.
		 *
		 * @name OverlayManager.prototype.add
		 * @function
		 * @example
		 * overlayManager.add( /\/hi\/(.*)/, function( name ) {
		 *   var result = $.Deferred();
		 *
		 *   mw.using( 'mobile.HiOverlay', function() {
		 *     var HiOverlay = M.require( 'HiOverlay' );
		 *     result.resolve( new HiOverlay( { name: name } ) );
		 *   } );
		 *
		 *   return result;
		 * } );
		 *
		 * @param {RegExp} route route regular expression, optionally with parameters.
		 * @param {Function} factory a function returning an overlay or a $.Deferred
		 * which resolves to an overlay.
		 */
		add: function( route, factory ) {
			var entry = { route: route, factory: factory };

			this.routes[route] = entry;
			// check if overlay should be shown for the current path
			this._processMatch( this._matchRoute( this.router.getPath(), entry ) );
		}
	} );

	M.define( 'OverlayManager', OverlayManager );

}( mw.mobileFrontend, jQuery ) );
