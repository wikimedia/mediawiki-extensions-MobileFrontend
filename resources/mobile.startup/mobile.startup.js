const currentPageHTMLParser = require( './currentPageHTMLParser.js' );
const time = require( './time.js' );
const currentPage = require( './currentPage.js' );
const Drawer = require( './Drawer.js' );
const CtaDrawer = require( './CtaDrawer.js' );
const Browser = require( './Browser.js' );
const icons = require( './icons.js' );
const PageHTMLParser = require( './PageHTMLParser.js' );
const { showOnPageReload } = require( './showOnPageReload.js' );
const OverlayManager = require( './OverlayManager.js' );
const View = require( './View.js' );
const Overlay = require( './Overlay.js' );
const references = require( './references/references.js' );
const promisedView = require( './promisedView.js' );
const headers = require( './headers.js' );
const util = require( './util.js' );
const Icon = require( './Icon.js' );
const IconButton = require( './IconButton.js' );
const Button = require( './Button.js' );

/**
 * The main library for accessing MobileFrontend's stable APIs.
 *
 * @module mobile.startup
 */
module.exports = {
	/**
	 * Internal, strictly for use inside MobileFrontend only
	 *
	 * @memberof module:mobile.startup
	 * @type module:mobile.startup/util
	 * @private
	 */
	util,
	/**
	 * @private
	 */
	headers,
	// Internal for use inside GrowthExperiments only.
	overlayHeader: headers.header,
	/**
	 * Internal for use inside Minerva, GrowthExperiments only.
	 *
	 * @type module:mobile.startup/Drawer
	 */
	Drawer,
	// Internal for use inside Minerva only.
	CtaDrawer,
	/**
	 * @internal for use strictly inside MobileFrontend only. Other extensions
	 *  should use View.make and Overlay.make
	 */
	class: {
		View,
		Overlay,
		Icon,
		IconButton,
		Button
	},
	/**
	 * @stable for use
	 * @memberof module:mobile.startup
	 * @type module:mobile.startup/View
	 */
	View: {
		make: View.make
	},
	/**
	 * @stable for use
	 * @memberof module:mobile.startup
	 * @type module:mobile.startup/Overlay
	 */
	Overlay: {
		make: Overlay.make
	},
	/**
	 * Internal for use inside Minerva only.
	 *
	 * @memberof module:mobile.startup
	 * @type module:mobile.startup/PageHTMLParser
	 */
	currentPageHTMLParser,
	/**
	 * Internal for use inside Minerva, ExternalGuidance and Echo only.
	 *
	 * @memberof module:mobile.startup
	 * @return {module:mobile.startup/OverlayManager}
	 */
	getOverlayManager: () => OverlayManager.getSingleton(),
	/**
	 * Internal for use inside Minerva only.
	 *
	 * @type module:mobile.startup/Page
	 * @memberof module:mobile.startup
	 */
	currentPage,
	/**
	 * Internal for use inside Minerva only.
	 *
	 * @type module:mobile.startup/PageHTMLParser
	 * @memberof module:mobile.startup
	 */
	PageHTMLParser,
	/**
	 * Internal for use inside Minerva only.
	 *
	 * @type module:mobile.startup/Icon
	 * @memberof module:mobile.startup
	 */
	spinner: icons.spinner,
	/**
	 * Internal for use inside MobileFrontend only
	 *
	 * @private
	 */
	cancelIcon: icons.cancel,
	/**
	 * Internal for use inside Minerva only.
	 *
	 * @memberof module:mobile.startup
	 * @type module:mobile.startup/references
	 */
	references,
	/**
	 * Internal for use inside Minerva only.
	 *
	 * @memberof module:mobile.startup
	 * @type module:mobile.startup/time
	 */
	time,
	// Internal for use inside Echo, GrowthExperiments only.
	promisedView,
	/**
	 * Loads all images on the page, stable to call.
	 *
	 * @memberof module:mobile.startup
	 * @return {jQuery.Deferred}
	 */
	loadAllImagesInPage: () => {
		mw.log.deprecated(
			'[1.47.0] deprecated. Please rewrite loading attribute of all images in page'
		);
	},
	/**
	 * Internal. Only for use in MobileFrontend.
	 */
	getBrowser: () => Browser.getSingleton(),
	/**
	 * Show a notification on page reload, internal for Minerva
	 *
	 * @memberof module:mobile.startup
	 * @param {string} msg
	 * @return {jQuery.Deferred}
	 */
	notifyOnPageReload: ( msg ) => showOnPageReload( msg )
};
