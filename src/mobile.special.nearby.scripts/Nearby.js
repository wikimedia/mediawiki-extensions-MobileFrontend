/** @event */
var
	NEARBY_EVENT_POST_RENDER = 'Nearby-postRender',
	MessageBox = require( '../mobile.startup/MessageBox' ),
	NearbyGateway = require( './NearbyGateway' ),
	util = require( '../mobile.startup/util' ),
	WatchstarPageList = require( '../mobile.startup/watchstar/WatchstarPageList.js' ),
	mfExtend = require( '../mobile.startup/mfExtend' );

/**
 * List of nearby pages
 * @class Nearby
 * @uses NearbyGateway
 * @extends WatchstarPageList
 *
 * @param {Object} options Configuration options
 * @param {OO.EventEmitter} options.eventBus Object used to emit Nearby-postRender events
 * @param {Function} [options.onItemClick] Callback invoked when a result is
 *                                         clicked. Defaults to nop.
 */
function Nearby( options ) {
	var self = this,
		_super = WatchstarPageList;

	this.range = options.range || mw.config.get( 'wgMFNearbyRange' ) || 1000;
	this.source = options.source || 'nearby';
	this.nearbyApi = new NearbyGateway( {
		api: options.api
	} );
	this.eventBus = options.eventBus;

	if ( options.errorType ) {
		options.errorOptions = self._errorOptions( options.errorType );
	}

	this.onItemClick = options.onItemClick;

	_super.apply( this, arguments );
}

mfExtend( Nearby, WatchstarPageList, {
	/**
	 * @memberof Nearby
	 * @instance
	 */
	errorMessages: {
		empty: {
			heading: mw.msg( 'mobile-frontend-nearby-noresults' ),
			hasHeading: true,
			msg: mw.msg( 'mobile-frontend-nearby-noresults-guidance' )
		},
		http: {
			heading: mw.msg( 'mobile-frontend-nearby-error' ),
			hasHeading: true,
			msg: mw.msg( 'mobile-frontend-nearby-error-guidance' )
		},
		incompatible: {
			heading: mw.msg( 'mobile-frontend-nearby-requirements' ),
			hasHeading: true,
			msg: mw.msg( 'mobile-frontend-nearby-requirements-guidance' )
		}
	},
	/**
	 * @memberof Nearby
	 * @instance
	 */
	templatePartials: util.extend( {}, WatchstarPageList.prototype.templatePartials, {
		pageList: WatchstarPageList.prototype.template,
		messageBox: MessageBox.prototype.template
	} ),
	/**
	 * @memberof Nearby
	 * @instance
	 */
	template: mw.template.get( 'mobile.special.nearby.scripts', 'Nearby.hogan' ),
	/**
	 * @memberof Nearby
	 * @instance
	 * @mixes WatchstarPageList#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {mw.Api} defaults.api
	 * @property {Object} defaults.errorOptions options to pass to a messagebox template
	 * tells the user that their location is being looked up
	 */
	defaults: util.extend( {}, WatchstarPageList.prototype.defaults, {
		errorOptions: undefined
	} ),
	/**
	 * Request pages from api based on provided options.
	 * When options.longitude and options.latitude set getPages near that location.
	 * If those are not present use options.title to find pages near that title.
	 * If no valid options given resolve return object with error message.
	 * @memberof Nearby
	 * @instance
	 * @param {Object} options Configuration options
	 * @return {jQuery.Deferred}
	 * @private
	 */
	_find: function ( options ) {
		var result = util.Deferred(),
			self = this;

		/**
		 * Handler for successful query
		 * @param {Array} pages as passed by then callback of Nearby##getPages
		 */
		function pagesSuccess( pages ) {
			options.pages = pages;
			if ( pages && pages.length === 0 ) {
				options.errorOptions = self._errorOptions( 'empty' );
			}
			self._isLoading = false;
			result.resolve( options );
		}

		/**
		 * Handler for failed query
		 *
		 * @param {string} code Error Code
		 */
		function pagesError( code ) {
			self._isLoading = false;
			options.errorOptions = self._errorOptions( code );
			result.resolve( options );
		}

		if ( options.latitude && options.longitude ) {
			this.nearbyApi.getPages(
				{
					latitude: options.latitude,
					longitude: options.longitude
				},
				this.range, options.exclude
			).then( pagesSuccess, pagesError );
		} else if ( options.pageTitle ) {
			this.nearbyApi.getPagesAroundPage( options.pageTitle, this.range )
				.then( pagesSuccess, pagesError );
		} else {
			if ( options.errorType ) {
				options.errorOptions = this._errorOptions( options.errorType );
			}
			result.resolve( options );
		}
		return result;
	},
	/**
	 * Generate a list of options that can be passed to a messagebox template.
	 * @memberof Nearby
	 * @instance
	 * @private
	 * @param {string} key to a defined error message
	 * @param {string} msg Message to use, instead of a mapped error message
	 *  from this.errorMessages
	 * @return {Object}
	 */
	_errorOptions: function ( key ) {
		var message = this.errorMessages[ key ] || this.errorMessages.http;
		return util.extend( {
			className: 'errorbox'
		}, message );
	},
	/**
	 * @inheritdoc
	 * @memberof Nearby
	 * @instance
	 */
	postRender: function () {
		var self = this;

		if ( !this._isLoading ) {
			this.$el.find( '.page-list' ).removeClass( 'hidden' );
		}
		WatchstarPageList.prototype.postRender.apply( this );
		this._postRenderLinks();
		// FIXME: This should probably just be $( function () {} )
		this.$el.find( function () {
			// todo: use the local emitter when refresh() doesn't recreate the
			//       OO.EventEmitter by calling the super's constructor.
			self.eventBus.emit( NEARBY_EVENT_POST_RENDER );
		} );
	},
	/**
	 * Hijack links to apply several customisations to them:
	 * Ensure that when clicked they register an uploads funnel.
	 * Ensure that when a user navigates back to the page their page position is restored using
	 * fragment identifier trickery.
	 * @private
	 * @memberof Nearby
	 * @instance
	 */
	_postRenderLinks: function () {
		var self = this;
		this.$el.find( 'a' ).each( function ( i ) {
			// FIXME: not unique if multiple Nearby objects on same page
			self.$el.find( this ).attr( 'id', 'nearby-page-list-item-' + i );
		} ).on( 'click', this.onItemClick );
	},
	/**
	 * Refresh the list of the nearby articles depending on the options.
	 * The current location, latitude/longitude, or page title can be used
	 * to find the articles.
	 * @memberof Nearby
	 * @instance
	 * @param {Object} options Configuration options
	 * @throws {Error} If Nearby has not been initialised correctly.
	 * @return {jQuery.Deferred}
	 */
	refresh: function ( options ) {
		var self = this,
			_super = WatchstarPageList;

		this.$el.find( '.page-list' ).addClass( 'hidden' );
		// Run it once for loader etc
		this._isLoading = true;
		if ( ( options.latitude && options.longitude ) || options.pageTitle ) {
			// Flush any existing list of pages
			options.pages = [];

			// Get some new pages
			return this._find( options ).then( function ( options ) {
				_super.call( self, options );
			}, function ( errorType ) {
				options.errorOptions = self._errorOptions( errorType );
				self._isLoading = false;
				_super.call( self, options );
			} );
		} else {
			throw new Error( 'No title or longitude, latitude options have been passed' );
		}
	}
} );

module.exports = Nearby;
