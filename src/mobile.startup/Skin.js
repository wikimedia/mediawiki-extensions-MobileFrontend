const browser = require( './Browser' ).getSingleton(),
	View = require( './View' ),
	util = require( './util' ),
	currentPage = require( './currentPage' ),
	eventBus = require( './eventBusSingleton' ),
	mfExtend = require( './mfExtend' );

let skin;

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
	const options = util.extend( {}, params );

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
	postRender() {
		const $el = this.$el;

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
	 * @throws {Error} if mediawiki message is in unexpected format.
	 * @return {jQuery.Object} a list of links
	 */
	getLicenseLinks() {
		const mobileLicense = mw.message( 'mobile-frontend-license-links' );
		const mobileMsgExists = mobileLicense.exists() && mobileLicense.text();
		const userLanguage = mw.config.get( 'wgUserLanguage' );
		if ( userLanguage === 'qqx' ) {
			// Special handling for qqx code so we can easily debug what's going on here.
			return mobileLicense.parseDom();
		} else {
			return mobileMsgExists ? mobileLicense.parseDom() : this.$el.find( '#footer-info-copyright a' ).clone();
		}
	},
	/**
	 * Returns the appropriate license message including links/name to
	 * terms of use (if any) and license page
	 *
	 * @memberof Skin
	 * @instance
	 * @return {string|undefined}
	 */
	getLicenseMsg() {
		const $licenseLinks = this.getLicenseLinks();

		let licenseMsg;
		if ( $licenseLinks.length ) {
			const licensePlural = mw.language.convertNumber(
				$licenseLinks.filter( 'a' ).length
			);

			if ( this.$el.find( '#footer-places-terms-use' ).length > 0 ) {

				const $termsLink = mw.message(
					'mobile-frontend-editor-terms-link',
					this.$el.find( '#footer-places-terms-use a' ).attr( 'href' )
				).parseDom();
				licenseMsg = mw.message(
					'mobile-frontend-editor-licensing-with-terms',
					$termsLink,
					$licenseLinks,
					licensePlural
				).parse();
			} else {
				licenseMsg = mw.message(
					'mobile-frontend-editor-licensing',
					$licenseLinks,
					licensePlural
				).parse();
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
