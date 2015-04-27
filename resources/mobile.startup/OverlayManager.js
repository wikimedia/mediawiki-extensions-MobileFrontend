( function ( M, $ ) {

	var
		Class = M.require( 'Class' ),
		router = M.require( 'router' ),
		OverlayManager, overlayManager;

	/**
	 * Manages opening and closing overlays when the URL hash changes to one
	 * of the registered values (see OverlayManager.add()).
	 *
	 * This allows overlays to function like real pages, with similar browser back/forward
	 * and refresh behavior.
	 *
	 * @class OverlayManager
	 * @extends Class
	 */
	OverlayManager = Class.extend( {
		/** @inheritdoc */
		initialize: function ( router ) {
			router.on( 'route', $.proxy( this, '_checkRoute' ) );
			this.router = router;
			// use an object instead of an array for entries so that we don't
			// duplicate entries that already exist
			this.entries = {};
			// stack of all the open overlays, stack[0] is the latest one
			this.stack = [];
			this.hideCurrent = true;
		},

		/**
		 * Don't try to hide the active overlay on a route change event triggered
		 * by hiding another overlay.
		 * Called when hiding an overlay.
		 * @method
		 * @private
		 */
		_onHideOverlay: function () {
			this.hideCurrent = false;

			this.router.back();
		},

		/**
		 * Show the overlay and bind the '_om_hide' event to _onHideOverlay.
		 * @method
		 * @private
		 * @param {Overlay} overlay to show
		 */
		_showOverlay: function ( overlay ) {
			// if hidden using overlay (not hardware) button, update the state
			overlay.once( '_om_hide', $.proxy( this, '_onHideOverlay' ) );

			overlay.show();
		},

		/**
		 * Hide overlay
		 * @method
		 * @private
		 * @param {Overlay} overlay to hide
		 * @returns {Boolean} Whether the overlay has been hidden
		 */
		_hideOverlay: function ( overlay ) {
			var result;

			// remove the callback for updating state when overlay closed using
			// overlay close button
			overlay.off( '_om_hide' );

			result = overlay.hide( this.stack.length > 1 );

			// if closing prevented, reattach the callback
			if ( !result ) {
				overlay.once( '_om_hide', $.proxy( this, '_onHideOverlay' ) );
			}

			return result;
		},

		/**
		 * Show match's overlay if match is not null.
		 * @method
		 * @private
		 * @param {Object|null} match Object with factory function's result. null if no match.
		 */
		_processMatch: function ( match ) {
			var factoryResult,
				self = this;

			/**
			 * Attach an event to the overlays hide event
			 * @ignore
			 * @param {Overlay} overlay
			 */
			function attachHideEvent( overlay ) {
				overlay.on( 'hide', function () {
					overlay.emit( '_om_hide' );
				} );
			}

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
						factoryResult.done( function ( overlay ) {
							match.overlay = overlay;
							attachHideEvent( overlay );
							self._showOverlay( overlay );
						} );
					} else {
						match.overlay = factoryResult;
						attachHideEvent( match.overlay );
						self._showOverlay( factoryResult );
					}
				}
			}
		},

		/**
		 * A callback for Router's `route` event.
		 * @method
		 * @private
		 * @param {jQuery.Event} ev Event object.
		 */
		_checkRoute: function ( ev ) {
			var
				self = this,
				current = this.stack[0],
				match;

			$.each( this.entries, function ( id, entry ) {
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
		 * @method
		 * @private
		 * @param {String} path Path (hash) to check.
		 * @param {Object} entry Entry object created in OverlayManager#add.
		 * @return {Object|null} Match object with factory function's result. Returns null if no match.
		 * or null if no match.
		 */
		_matchRoute: function ( path, entry ) {
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
		 * end with '#/hi/name'. The value of `name` will be passed to the overlay.
		 *
		 *     @example
		 *     overlayManager.add( /\/hi\/(.*)/, function ( name ) {
		 *       var factoryResult = $.Deferred();
		 *
		 *       mw.using( 'mobile.HiOverlay', function () {
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
		add: function ( route, factory ) {
			var self = this,
				entry = {
					route: route,
					factory: factory
				};

			this.entries[route] = entry;
			// Check if overlay should be shown for the current path.
			// The DOM must fully load before we can show the overlay because Overlay relies on it.
			$( function () {
				self._processMatch( self._matchRoute( self.router.getPath(), entry ) );
			} );
		},

		/**
		 * Replace the currently displayed overlay with a new overlay without changing the
		 * URL. This is useful for when you want to switch overlays, but don't want to
		 * change the back button or close box behavior.
		 *
		 * @method
		 * @param {Object} overlay The overlay to display
		 */
		replaceCurrent: function ( overlay ) {
			if ( this.stack.length === 0 ) {
				throw new Error( 'Trying to replace OverlayManager\'s current overlay, but stack is empty' );
			}
			this._hideOverlay( this.stack[0].overlay );
			this.stack[0].overlay = overlay;
			this._showOverlay( overlay );
		}
	} );

	overlayManager = new OverlayManager( router );

	M.define( 'overlayManager', overlayManager );
	M.define( 'OverlayManager', OverlayManager );

}( mw.mobileFrontend, jQuery ) );
