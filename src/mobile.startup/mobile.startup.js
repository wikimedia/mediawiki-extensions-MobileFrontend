const currentPageHTMLParser = require( './currentPageHTMLParser' );
const time = require( './time' );
const currentPage = require( './currentPage' );
const Drawer = require( './Drawer' );
const CtaDrawer = require( './CtaDrawer' );
const icons = require( './icons' );
const PageHTMLParser = require( './PageHTMLParser' );
const showOnPageReload = require( './showOnPageReload' );
const OverlayManager = require( './OverlayManager' );
const View = require( './View' );
const Overlay = require( './Overlay' );
const references = require( './references/references' );
const promisedView = require( './promisedView' );
const headers = require( './headers' );
const Skin = require( './Skin' );
const mediaViewer = {
	overlay: require( './mediaViewer/overlay' )
};
const util = require( './util.js' );
const actionParams = require( './actionParams.js' );
const Icon = require( './Icon.js' );
const IconButton = require( './IconButton.js' );
const Section = require( './Section.js' );
const Button = require( './Button.js' );

// Expose chunk to temporary variable which will be deleted and exported via ResourceLoader
// package inside mobile.startup.exports.

/**
 * The main library for accessing MobileFrontend's stable APIs.
 *
 * @module mobile.startup
 */
module.exports = {
	/**
	 * Internal, strictly for use inside MobileFrontend only
	 *
	 * @private
	 */
	actionParams,
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
		Section,
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
	 * @type module:mobile.startup/mediaViewer
	 */
	mediaViewer,
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
	 * Show a notification on page reload, internal for Minerva
	 *
	 * @memberof module:mobile.startup
	 * @param {string} msg
	 * @return {jQuery.Deferred}
	 */
	notifyOnPageReload: ( msg ) => showOnPageReload( msg ),
	/**
	 * Internal for use inside VisualEditor
	 *
	 * @memberof module:mobile.startup
	 * @return {string|undefined}
	 */
	license() {
		const skin = Skin.getSingleton();
		return skin.getLicenseMsg();
	}
};
