var
	util = require( './util' ),
	overlayManager = null;

// We pass this to history.pushState/replaceState to indicate that we're controlling the page URL.
// Then we look for this marker on page load so that if the page is refreshed, we don't generate an
// extra history entry (see #getSingleton below and T201852).
const MANAGED_STATE = 'MobileFrontend OverlayManager was here!';

/**
 * Manages opening and closing overlays when the URL hash changes to one
 * of the registered values (see OverlayManager.add()).
 *
 * This allows overlays to function like real pages, with similar browser back/forward
 * and refresh behavior.
 *
 * @class OverlayManager
 * @param {Router} router
 * @param {Element} container where overlays should be managed
 */
function OverlayManager( router, container ) {
	router.on( 'route', this._checkRoute.bind( this ) );
	this.router = router;
	// use an object instead of an array for entries so that we don't
	// duplicate entries that already exist
	this.entries = {};
	// stack of all the open overlays, stack[0] is the latest one
	this.stack = [];
	this.hideCurrent = true;
	// Set the element that overlays will be appended to
	this.container = container;
}

/**
 * Attach an event to the overlays hide event
 *
 * @param {Overlay} overlay
 */
function attachHideEvent( overlay ) {
	overlay.on( 'hide', function () {
		overlay.emit( '_om_hide' );
	} );
}

OverlayManager.prototype = {
	/**
	 * Don't try to hide the active overlay on a route change event triggered
	 * by hiding another overlay.
	 * Called when something other than OverlayManager calls Overlay.hide
	 * on an overlay that it itself managed by the OverlayManager.
	 * MUST be called when the stack is not empty.
	 *
	 * @memberof OverlayManager
	 * @instance
	 * @private
	 */
	_onHideOverlayOutsideOverlayManager: function () {
		const currentRoute = this.stack[0].route,
			routeIsString = typeof currentRoute === 'string',
			currentPath = this.router.getPath(),
			// Since routes can be strings or regexes, it's important to do an equality
			// check BEFORE a match check.
			routeIsSame = ( routeIsString && currentPath === currentRoute ) ||
				currentPath.match( currentRoute );

		this.hideCurrent = false;

		// If the path hasn't changed then the user didn't close the overlay by
		// calling history.back() or triggering a route change. We must go back
		// to get out of the overlay. See T237677.
		if ( routeIsSame ) {
			// does the route need to change?
			this.router.back();
		}
	},

	/** Attach overlay to DOM
	 *
	 * @memberof OverlayManager
	 * @instance
	 * @private
	 * @param {Overlay} overlay to attach
	 */
	_attachOverlay: function ( overlay ) {
		if ( !overlay.$el.parents().length ) {
			this.container.appendChild( overlay.$el[0] );
		}
	},
	/**
	 * Show the overlay and bind the '_om_hide' event to _onHideOverlay.
	 *
	 * @memberof OverlayManager
	 * @instance
	 * @private
	 * @param {Overlay} overlay to show
	 */
	_show: function ( overlay ) {
		// Mark the state so that if the page is refreshed, we don't generate an extra history entry
		// (see #getSingleton below and T201852).
		// eslint-disable-next-line no-restricted-properties
		window.history.replaceState( MANAGED_STATE, null, window.location.href );

		// the _om_hide event is added to an overlay that is displayed.
		// It will fire if an Overlay emits a hide event (See attachHideEvent)
		// in the case where a route change has not occurred (this event is disabled
		// inside _hideOverlay which is called inside _checkRoute)
		overlay.once( '_om_hide', this._onHideOverlayOutsideOverlayManager.bind( this ) );

		this._attachOverlay( overlay );
		overlay.show();
	},

	/**
	 * Hide overlay
	 *
	 * @memberof OverlayManager
	 * @instance
	 * @private
	 * @param {Overlay} overlay to hide
	 * @param {Function} onBeforeExitCancel to pass to onBeforeExit
	 * @return {boolean} Whether the overlay has been hidden
	 */
	_hideOverlay: function ( overlay, onBeforeExitCancel ) {
		let result;

		function exit() {
			result = true;
			overlay.hide();
		}
		// remove the callback for updating state when overlay closed using
		// overlay close button
		overlay.off( '_om_hide' );

		if ( overlay.options && overlay.options.onBeforeExit ) {
			overlay.options.onBeforeExit( exit, onBeforeExitCancel );
		} else {
			exit();
		}

		// if closing prevented, reattach the callback
		if ( !result ) {
			overlay.once( '_om_hide', this._onHideOverlayOutsideOverlayManager.bind( this ) );
		}

		return result;
	},

	/**
	 * Show match's overlay if match is not null.
	 *
	 * @memberof OverlayManager
	 * @instance
	 * @private
	 * @param {Object|null} match Object with factory function's result. null if no match.
	 */
	_processMatch: function ( match ) {
		var factoryResult,
			self = this;

		if ( match ) {
			if ( match.overlay ) {
				// if the match is an overlay that was previously opened, reuse it
				self._show( match.overlay );
			} else {
				// else create an overlay using the factory function result
				factoryResult = match.factoryResult;
				match.overlay = factoryResult;
				attachHideEvent( match.overlay );
				self._show( factoryResult );
			}
		}
	},

	/**
	 * A callback for Router's `route` event.
	 *
	 * @memberof OverlayManager
	 * @instance
	 * @private
	 * @param {jQuery.Event} ev Event object.
	 */
	_checkRoute: function ( ev ) {
		const current = this.stack[0];

		// When entering an overlay for the first time,
		// the manager should remember the user's scroll position
		// overlays always open at top of page
		// and we'll want to restore it later.
		// This should happen before the call to _matchRoute which will "show" the overlay.
		// The Overlay has similar logic for overlays that are not managed via the overlay.
		if ( !current ) {
			this.scrollTop = window.pageYOffset;
		}

		// if there is an overlay in the stack and it's opened, try to close it
		if (
			current &&
			current.overlay !== undefined &&
			this.hideCurrent &&
			!this._hideOverlay( current.overlay, () => {
				// if hide prevented, prevent route change event
				ev.preventDefault();
			} )
		) {
			return;
		}

		const match = Object.keys( this.entries ).reduce( function ( m, id ) {
			return m || this._matchRoute( ev.path, this.entries[ id ] );
		}.bind( this ), null );

		if ( !match ) {
			// if hidden and no new matches, reset the stack
			this.stack = [];
			// restore the scroll position.
			window.scrollTo( window.pageXOffset, this.scrollTop );
		}

		this.hideCurrent = true;
		this._processMatch( match );
	},

	/**
	 * Check if a given path matches one of the existing entries and
	 * remove it from the stack.
	 *
	 * @memberof OverlayManager
	 * @instance
	 * @private
	 * @param {string} path Path (hash) to check.
	 * @param {Object} entry Entry object created in OverlayManager#add.
	 * @return {Object|null} Match object with factory function's result.
	 *  Returns null if no match.
	 */
	_matchRoute: function ( path, entry ) {
		var
			next,
			didMatch,
			captures,
			match,
			previous = this.stack[1],
			self = this;

		if ( typeof entry.route === 'string' ) {
			didMatch = entry.route === path;
			captures = [];
		} else {
			match = path.match( entry.route );
			didMatch = !!match;
			captures = didMatch ? match.slice( 1 ) : [];
		}

		/**
		 * Returns object to add to stack
		 *
		 * @method
		 * @ignore
		 * @return {Object}
		 */
		function getNext() {
			return {
				path: path,
				// Important for managing states of things such as the image overlay which change
				// overlay routing parameters during usage.
				route: entry.route,
				factoryResult: entry.factory.apply( self, captures )
			};
		}

		if ( didMatch ) {
			// if previous stacked overlay's path matches, assume we're going back
			// and reuse a previously opened overlay
			if ( previous && previous.path === path ) {
				self.stack.shift();
				return previous;
			} else {
				next = getNext();
				if ( this.stack[0] && next.path === this.stack[0].path ) {
					// current overlay path is same as path to check which means overlay
					// is attempting to refresh so just replace current overlay with new
					// overlay
					self.stack[0] = next;
				} else {
					self.stack.unshift( next );
				}
				return next;
			}
		}

		return null;
	},

	/**
	 * Add an overlay that should be shown for a specific fragment identifier.
	 *
	 * The following code will display an overlay whenever a user visits a URL that
	 * ends with '#/hi/name'. The value of `name` will be passed to the overlay.
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
	 * @memberof OverlayManager
	 * @instance
	 * @param {RegExp|string} route definition that can be a regular
	 * expression (optionally with parameters) or a string literal.
	 *
	 * T238364: Routes should only contain characters allowed by RFC3986 to ensure
	 * compatibility across browsers. Encode the route with `encodeURIComponent()`
	 * prior to registering it with OverlayManager if necessary (should probably
	 * be done with all routes containing user generated characters) to avoid
	 * inconsistencies with how different browsers encode illegal URI characters:
	 *
	 * ```
	 *   var encodedRoute = encodeURIComponent('ugc < " ` >');
	 *
	 *   overlayManager.add(
	 *     encodedRoute,
	 *     function () { return new Overlay(); }
	 *   );
	 *
	 *   window.location.hash = '#' + encodedRoute;
	 * ```
	 * The above example shows how to register a string literal route with illegal
	 * URI characters. Routes registered as a regex will likely NOT have to
	 * perform any encoding (unless they explicitly contain illegal URI
	 * characters) as their user generated content portion will likely just be a
	 * capturing group (e.g. `/\/hi\/(.*)/`).
	 * @param {Function} factory a function returning an overlay
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
		util.docReady( function () {
			self._processMatch( self._matchRoute( self.router.getPath(), entry ) );
		} );
	},

	/**
	 * Replace the currently displayed overlay with a new overlay without changing the
	 * URL. This is useful for when you want to switch overlays, but don't want to
	 * change the back button or close box behavior.
	 *
	 * @memberof OverlayManager
	 * @instance
	 * @param {Object} overlay The overlay to display
	 */
	replaceCurrent: function ( overlay ) {
		if ( this.stack.length === 0 ) {
			throw new Error( 'Trying to replace OverlayManager\'s current overlay, but stack is empty' );
		}
		this._hideOverlay( this.stack[0].overlay );
		this.stack[0].overlay = overlay;
		attachHideEvent( overlay );
		this._show( overlay );
	}
};

/**
 * Retrieve a singleton instance using 'mediawiki.router'.
 *
 * @memberof OverlayManager
 * @return {OverlayManager}
 */
OverlayManager.getSingleton = function () {
	if ( !overlayManager ) {
		const
			router = mw.loader.require( 'mediawiki.router' ),
			container = document.createElement( 'div' ),
			// Note getPath returns hash minus the '#' character:
			hash = router.getPath(),
			// eslint-disable-next-line no-restricted-properties
			state = window.history.state;
		container.className = 'mw-overlays-container';
		document.body.appendChild( container );
		// If an overlay was loaded by directly navigating to an URL with a hash (e.g. linked from
		// another page or browser bookmark), generate an extra history entry to allow closing the
		// overlay without leaving the page (see T201852). Put our marker into the entry state so
		// that we can detect it if the page is refreshed and do not generate another entry.
		if ( hash && state !== MANAGED_STATE ) {
			// eslint-disable-next-line no-restricted-properties
			window.history.replaceState( null, null, '#' );
			// eslint-disable-next-line no-restricted-properties
			window.history.pushState( MANAGED_STATE, null, `#${hash}` );
		}
		overlayManager = new OverlayManager( router, container );
	}
	return overlayManager;
};

OverlayManager.test = {
	MANAGED_STATE,
	__clearCache: () => {
		overlayManager = null;
	}
};
module.exports = OverlayManager;
