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
			// use an object instead of an array for entries so that we don't
			// duplicate entries that already exist
			this.entries = {};
			this.stack = [];
			this.hidePrevious = true;
		},

		_onHideOverlay: function() {
			this.hidePrevious = false;
			this.router.back();
		},

		_showOverlay: function( overlay ) {
			// if hidden using overlay (not hardware) button, update the state
			overlay.one( 'hide.overlay-manager', $.proxy( this, '_onHideOverlay' ) );
			overlay.show();
		},

		_hideOverlay: function( overlay ) {
			var result;

			overlay.off( 'hide.overlay-manager' );
			result = overlay.hide( this.stack.length > 1 );

			if ( !result ) {
				overlay.one( 'hide.overlay-manager', $.proxy( this, '_onHideOverlay' ) );
			}

			return result;
		},

		_processMatch: function( match ) {
			var self = this, factoryResult;

			if ( match ) {
				if ( match.overlay ) {
					self._showOverlay( match.overlay );
				} else {
					factoryResult = match.factoryResult;
					// http://stackoverflow.com/a/13075985/365238
					if ( $.isFunction( factoryResult.promise ) ) {
						factoryResult.done( function( overlay ) {
							match.overlay = overlay;
							self._showOverlay( overlay );
						} );
					} else {
						match.overlay = factoryResult;
						self._showOverlay( factoryResult );
					}
				}
			}
		},

		_checkRoute: function( ev ) {
			var
				self = this,
				previous = this.stack[0],
				match;

			$.each( this.entries, function( id, entry ) {
				match = self._matchRoute( ev.path, entry );
				return match === null;
			} );

			// force hide only if more overlays in stack
			if ( previous &&
				previous.overlay !== undefined &&
				this.hidePrevious &&
				!this._hideOverlay( previous.overlay )
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
						factoryResult: entry.factory.apply( this, match.slice( 1 ) )
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
		 *   var factoryResult = $.Deferred();
		 *
		 *   mw.using( 'mobile.HiOverlay', function() {
		 *     var HiOverlay = M.require( 'HiOverlay' );
		 *     factoryResult.resolve( new HiOverlay( { name: name } ) );
		 *   } );
		 *
		 *   return factoryResult;
		 * } );
		 *
		 * @param {RegExp} route route regular expression, optionally with parameters.
		 * @param {Function} factory a function returning an overlay or a $.Deferred
		 * which resolves to an overlay.
		 */
		add: function( route, factory ) {
			var entry = { route: route, factory: factory };

			this.entries[route] = entry;
			// check if overlay should be shown for the current path
			this._processMatch( this._matchRoute( this.router.getPath(), entry ) );
		},

		/**
		 * Replace the currently displayed overlay with a new overlay without changing the
		 * URL. This is useful for when you want to switch overlays, but don't want to
		 * change the back button or close box behavior.
		 *
		 * @name OverlayManager.prototype.replaceCurrent
		 * @function
		 * @param {Object} overlay The overlay to display
		*/
		replaceCurrent: function( overlay ) {
			if ( this.stack.length === 0 ) {
				throw new Error( "Trying to replace OverlayManager's current overlay, but stack is empty" );
			}
			this._hideOverlay( this.stack[0].overlay );
			this.stack[0].overlay = overlay;
			this._showOverlay( overlay );
		}
	} );

	M.define( 'OverlayManager', OverlayManager );

}( mw.mobileFrontend, jQuery ) );
