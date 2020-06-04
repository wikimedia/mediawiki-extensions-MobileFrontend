var skin,
	browser = require( './Browser' ).getSingleton(),
	View = require( './View' ),
	util = require( './util' ),
	currentPage = require( './currentPage' ),
	eventBus = require( './eventBusSingleton' ),
	mfExtend = require( './mfExtend' );

/**
 * Representation of the current skin being rendered.
 *
 * @class Skin
 * @extends View
 * @uses Browser
 * @uses Page
 * @fires Skin#click
 * @param {Object} params Configuration options
 * @param {OO.EventEmitter} params.eventBus Object used to listen for
 * @param {Page} params.page
 * scroll:throttled, resize:throttled, and section-toggled events
 */
function Skin( params ) {
	var options = util.extend( {}, params );

	this.page = options.page;
	this.name = options.name;
	this.eventBus = options.eventBus;
	options.isBorderBox = false;
	View.call( this, options );
}

mfExtend( Skin, View, {
	/**
	 * @memberof Skin
	 * @instance
	 * @mixes View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {Page} defaults.page page the skin is currently rendering
	 */
	defaults: {
		page: undefined
	},

	/**
	 * @inheritdoc
	 * @memberof Skin
	 * @instance
	 */
	postRender: function () {
		var $el = this.$el;

		if ( browser.supportsTouchEvents() ) {
			$el.addClass( 'touch-events' );
		}

		/**
		 * Fired when the skin is clicked.
		 *
		 * @event Skin#click
		 */
		this.$el.find( '#mw-mf-page-center' ).on( 'click', ( ev ) => {
			this.emit( 'click', ev );
		} );
	},

	/**
	 * Returns the appropriate license message including links/name to
	 * terms of use (if any) and license page
	 *
	 * @memberof Skin
	 * @instance
	 * @return {string}
	 */
	getLicenseMsg: function () {
		var licenseMsg,
			mfLicense = mw.config.get( 'wgMFLicense' ),
			licensePlural = mw.language.convertNumber( mfLicense.plural );

		if ( mfLicense.link ) {
			if ( this.$el.find( '#footer-places-terms-use' ).length > 0 ) {
				licenseMsg = mw.msg(
					'mobile-frontend-editor-licensing-with-terms',
					mw.message(
						'mobile-frontend-editor-terms-link',
						this.$el.find( '#footer-places-terms-use a' ).attr( 'href' )
					).parse(),
					mfLicense.link,
					licensePlural
				);
			} else {
				licenseMsg = mw.msg(
					'mobile-frontend-editor-licensing',
					mfLicense.link,
					licensePlural
				);
			}
		}
		return licenseMsg;
	}
} );

/**
 * Get a skin singleton
 *
 * @return {Skin}
 */
Skin.getSingleton = function () {
	if ( !skin ) {
		skin = new Skin( {
			el: 'body',
			page: currentPage(),
			eventBus
		} );
	}
	return skin;
};
module.exports = Skin;
