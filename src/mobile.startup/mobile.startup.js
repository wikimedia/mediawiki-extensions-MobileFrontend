const currentPageHTMLParser = require( './currentPageHTMLParser' );
const time = require( './time' );
const LanguageInfo = require( './LanguageInfo' );
const currentPage = require( './currentPage' );
const Drawer = require( './Drawer' );
const CtaDrawer = require( './CtaDrawer' );
const lazyImageLoader = require( './lazyImages/lazyImageLoader' );
const icons = require( './icons' );
const PageHTMLParser = require( './PageHTMLParser' );
const showOnPageReload = require( './showOnPageReload' );
const OverlayManager = require( './OverlayManager' );
const View = require( './View' );
const Overlay = require( './Overlay' );
const references = require( './references/references' );
const search = {
	SearchOverlay: require( './search/SearchOverlay' ),
	SearchGateway: require( './search/SearchGateway' )
};
const promisedView = require( './promisedView' );
const headers = require( './headers' );
const Skin = require( './Skin' );
const mediaViewer = {
	overlay: require( './mediaViewer/overlay' )
};
const languageInfoOverlay = require( './languageOverlay/languageInfoOverlay' );
const languageOverlay = require( './languageOverlay/languageOverlay' );
const amcOutreach = require( './amcOutreach/amcOutreach' );

// Expose chunk to temporary variable which will be deleted and exported via ResourceLoader
// package inside mobile.startup.exports.
mw._mobileFrontend = {
	/**
	 * @internal for use inside Minerva only.
	 */
	amcOutreach,
	/**
	 * @internal for use inside GrowthExperiments only.
	 */
	overlayHeader: headers.header,
	/**
	 * @internal for use inside Minerva, GrowthExperiments only.
	 */
	Drawer,
	/**
	 * @internal for use inside Minerva only.
	 */
	CtaDrawer,
	/**
	 * @internal for use inside Minerva, ExternalGuidance and Echo only.
	 */
	View,
	/**
	 * @internal for use inside Minerva, ExternalGuidance,
	 *  GrowthExperiments and Echo only.
	 */
	Overlay,
	/**
	 * @internal for use inside Minerva only.
	 */
	currentPageHTMLParser,
	/**
	 * @internal for use inside Minerva, ExternalGuidance and Echo only.
	 */
	getOverlayManager: () => {
		return OverlayManager.getSingleton();
	},
	/**
	 * @internal for use inside Minerva only.
	 */
	currentPage,
	/**
	 * @internal for use inside Minerva only.
	 */
	PageHTMLParser,
	/**
	 * @internal for use inside Minerva only.
	 */
	spinner: icons.spinner,
	/**
	 * @internal for use inside Minerva only.
	 */
	mediaViewer,
	/**
	 * @internal for use inside Minerva only.
	 */
	references,
	/**
	 * @internal for use inside Minerva only.
	 */
	search,
	/**
	 * @internal for use inside Minerva only.
	 */
	time,
	/**
	 * @internal for use inside Echo, GrowthExperiments only.
	 */
	promisedView,
	/**
	 * Loads all images on the page.
	 *
	 * @stable for skins to call
	 * @return {jQuery.Deferred}
	 */
	loadAllImagesInPage: () => {
		return lazyImageLoader.loadImages(
			lazyImageLoader.queryPlaceholders( document.getElementById( 'content' ) )
		);
	},
	/**
	 * Show a notification on page reload.
	 *
	 * @param msg
	 * @internal for Minerva
	 * @return {jQuery.Deferred}
	 */
	notifyOnPageReload: ( msg ) => showOnPageReload( msg ),
	/**
	 * @internal for use inside VisualEditor
	 */
	license() {
		const skin = Skin.getSingleton();
		return skin.getLicenseMsg();
	},
	/**
	 * @internal for use inside Minerva
	 */
	languages: {
		languageOverlay,
		languageInfoOverlay( api, showSuggestedLanguage ) {
			languageInfoOverlay( new LanguageInfo( api ), showSuggestedLanguage );
		}
	}
};
