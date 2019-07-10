var icons = require( '../mobile.startup/icons' ),
	PhotoListGateway = require( './PhotoListGateway' ),
	PhotoItem = require( './PhotoItem' ),
	spinner = icons.spinner().$el,
	mfExtend = require( '../mobile.startup/mfExtend' ),
	ScrollEndEventEmitter = require( '../mobile.startup/ScrollEndEventEmitter' ),
	View = require( '../mobile.startup/View' ),
	util = require( '../mobile.startup/util' );

/**
 * Creates a list of photo items
 * @class PhotoList
 * @uses PhotoListApi
 * @uses PhotoItem
 * @uses ScrollEndEventEmitter
 * @extends View
 *
 * @param {Object} options Configuration options
 * @param {mw.Api} options.api instance of an api
 * @param {OO.EventEmitter} options.eventBus Object used to listen for scroll:throttled events
 * @param {string} options.url for overriding default URI for API queries
 */
function PhotoList( options ) {
	var gatewayOptions = {
		url: options.url,
		api: options.api
	};

	if ( options.username ) {
		gatewayOptions.username = options.username;
	} else if ( options.category ) {
		gatewayOptions.category = options.category;
	}
	this.gateway = new PhotoListGateway( gatewayOptions );
	// Set up infinite scroll
	this.scrollEndEventEmitter = new ScrollEndEventEmitter( options.eventBus, 1000 );
	this.scrollEndEventEmitter.on( ScrollEndEventEmitter.EVENT_SCROLL_END,
		this._loadPhotos.bind( this ) );
	View.call( this, options );
}

mfExtend( PhotoList, View, {
	/**
	 * @memberof PhotoList
	 * @instance
	 */
	template: util.template( `
<ul class="image-list content"></ul>
<div class="end"></div>
	` ),
	/**
	 * @inheritdoc
	 * @memberof PhotoList
	 * @instance
	 */
	preRender: function () {
		// Disable until we've got the list rendered
		this.scrollEndEventEmitter.setElement( this.$el );
		this.scrollEndEventEmitter.disable();
	},
	/**
	 * @inheritdoc
	 * @memberof PhotoList
	 * @instance
	 */
	postRender: function () {
		this.$end = this.$el.find( '.end' );
		this.$end.append( spinner );
		this.$list = this.$el.find( 'ul' );

		this._loadPhotos();
	},
	/**
	 * Check to see if the current view is an empty list.
	 * @memberof PhotoList
	 * @instance
	 * @return {boolean} whether no images have been rendered
	 */
	isEmpty: function () {
		return this.$list.find( 'li' ).length === 0;
	},
	/**
	 * Renders an empty message prior to the list.
	 * FIXME: Should be handled in template, not a method.
	 * @memberof PhotoList
	 * @instance
	 */
	showEmptyMessage: function () {
		this.parseHTML( '<p class="content empty">' ).text( mw.msg( 'mobile-frontend-donate-image-nouploads' ) )
			.insertBefore( this.$list );
	},
	/**
	 * Hides the message saying the list is empty
	 * FIXME: Should be handled in template, not a method.
	 * @memberof PhotoList
	 * @instance
	 */
	hideEmptyMessage: function () {
		this.$el.find( '.empty' ).hide();
	},
	/**
	 * Shows loading spinner
	 * @memberof PhotoList
	 * @instance
	 */
	showSpinner: function () {
		this.$end.show();
	},
	/**
	 * Hides loading spinner
	 * @memberof PhotoList
	 * @instance
	 */
	hideSpinner: function () {
		this.$end.hide();
	},
	/**
	 * Shows/hides empty state if PhotoList is empty.
	 * @memberof PhotoList
	 * @instance
	 */
	updateEmptyUI: function () {
		if ( this.isEmpty() ) {
			this.showEmptyMessage();
		} else {
			this.hideEmptyMessage();
		}
	},
	/**
	 * Append an array of photos to the view.
	 * @memberof PhotoList
	 * @instance
	 * @param {Array} photosData Array of objects describing a new {PhotoItem}
	 */
	appendPhotos: function ( photosData ) {
		var self = this;
		photosData.forEach( function ( photo ) {
			new PhotoItem( photo ).appendTo( self.$list );
		} );
	},
	/**
	 * Enables infinite scroll if it's disabled
	 * @memberof PhotoList
	 * @instance
	 */
	enableScroll: function () {
		if ( this.scrollEndEventEmitter.enabled === false ) {
			this.scrollEndEventEmitter.enable();
		}
	},
	/**
	 * Load photos into the view using {{PhotoListApi}} when the end is near
	 * and no current API requests are underway.
	 * @memberof PhotoList
	 * @instance
	 * @private
	 */
	_loadPhotos: function () {
		var self = this;

		self.showSpinner();

		this.gateway.getPhotos().then( function ( response ) {
			var photos = response.photos || [],
				canContinue = response.canContinue;

			self.appendPhotos( photos );
			self.updateEmptyUI();
			if ( canContinue ) {
				self.enableScroll();
			}

			self.hideSpinner();
		} ).catch( function () {
			self.updateEmptyUI();
			self.hideSpinner();

			// try loading again if request failed
			self.enableScroll();
		} );
	}
} );

module.exports = PhotoList;
