( function( M, $ ) {

	var
		Class = M.require( 'Class' ),
		OverlayManager;

	/**
	 * Manages opening and closing overlays when the URL hash changes to one
	 * of the registered values (see OverlayManager.add()).
	 *
	 * This allows overlays to function like real pages, with similar browser back/forward
	 * behavior.
	 *
	 * @class OverlayManager
	 * @extends Class
	 */
	OverlayManager = Class.extend( {
		initialize: function( router ) {
			router.on( 'route', $.proxy( this, '_checkRoute' ) );
			this.router = router;
			// use an object instead of an array for entries so that we don't
			// duplicate entries that already exist
			this.entries = {};
			// stack of all the open overlays, stack[0] is the latest one
			this.stack = [];
			this.hideCurrent = true;
		},

		_onHideOverlay: function() {
			// don't try to hide the active overlay on a route change event triggered
			// by hiding another overlay
			this.hideCurrent = false;

			this.router.back();
		},

		_showOverlay: function( overlay ) {
			// if hidden using overlay (not hardware) button, update the state
			overlay.one( 'hide', $.proxy( this, '_onHideOverlay' ) );

			overlay.show();
		},

		_hideOverlay: function( overlay ) {
			var result;

			// remove the callback for updating state when overlay closed using
			// overlay close button
			overlay.off( 'hide' );

			result = overlay.hide( this.stack.length > 1 );

			// if closing prevented, reattach the callback
			if ( !result ) {
				overlay.one( 'hide', $.proxy( this, '_onHideOverlay' ) );
			}

			return result;
		},

		_processMatch: function( match ) {
			var self = this, factoryResult;

			if ( match ) {
				if ( match.overlay ) {
					// if the match is an overlay that was previously opened, reuse it
					self._showOverlay( match.overlay );
				} else {
					// else create an overlay using the factory function result (either
					// a promise or an overlay)
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

		/**
		 * A callback for Router's `route` event.
		 *
		 * @param {$.Event} ev Event object.
		 */
		_checkRoute: function( ev ) {
			var
				self = this,
				current = this.stack[0],
				match;

			$.each( this.entries, function( id, entry ) {
				match = self._matchRoute( ev.path, entry );
				// if matched (match not equal to null), break out of the loop
				return match === null;
			} );

			// if there is an overlay in the stack and it's opened, try to close it
			if (
				current &&
				current.overlay !== undefined &&
				this.hideCurrent &&
				!this._hideOverlay( current.overlay )
			) {
				// if hide prevented, prevent route change event
				ev.preventDefault();
			} else if ( !match ) {
				// if hidden and no new matches, reset the stack
				this.stack = [];
			}

			this.hideCurrent = true;
			this._processMatch( match );
		},

		/**
		 * Check if a given path matches one of the entries.
		 *
		 * @param {string} path Path (hash) to check.
		 * @param {object} entry Entry object created in OverlayManager#add.
		 * @return {object|null} Match object with factory function's result
		 * or null if no match.
		 */
		_matchRoute: function( path, entry ) {
			var
				match = path.match( entry.route ),
				previous = this.stack[1],
				next;

			if ( match ) {
				// if previous stacked overlay's path matches, assume we're going back
				// and reuse a previously opened overlay
				if ( previous && previous.path === path ) {
					this.stack.shift();
					return previous;
				} else {
					next = {
						path: path,
						factoryResult: entry.factory.apply( this, match.slice( 1 ) )
					};
					this.stack.unshift( next );
					return next;
				}
			}

			return null;
		},

		/**
		 * Add an overlay that should be shown for a specific fragment identifier.
		 *
		 * The following code will display an overlay whenever a user visits a URL that
		 * end with '#/hi/<name>'. The value of <name> will be passed to the overlay.
		 *
		 *     @example
		 *     overlayManager.add( /\/hi\/(.*)/, function( name ) {
		 *       var factoryResult = $.Deferred();
		 *
		 *       mw.using( 'mobile.HiOverlay', function() {
		 *         var HiOverlay = M.require( 'HiOverlay' );
		 *         factoryResult.resolve( new HiOverlay( { name: name } ) );
		 *       } );
		 *
		 *       return factoryResult;
		 *     } );
		 *
		 * @method
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
		 * @method
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
