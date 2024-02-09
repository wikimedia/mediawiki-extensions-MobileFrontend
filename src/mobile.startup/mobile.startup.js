const
	moduleLoader = require( './moduleLoaderSingleton' ),
	util = require( './util' );

/**
 * FIXME: Can be removed when Minerva has removed reference.
 */
function DeprecatedPageGateway() {
	mw.log.warn( '[1.40] Use of PageGateway is a NOOP and deprecated. Please remove this call.' );
}

const currentPageHTMLParser = require( './currentPageHTMLParser' );
const time = require( './time' );
const Icon = require( './Icon' );

const LanguageInfo = require( './LanguageInfo' );
const IconButton = require( './IconButton' );
const currentPage = require( './currentPage' );
const Drawer = require( './Drawer' );
const CtaDrawer = require( './CtaDrawer' );
const Anchor = require( './Anchor' );
const Button = require( './Button' );
const lazyImageLoader = require( './lazyImages/lazyImageLoader' );
const icons = require( './icons' );
const PageHTMLParser = require( './PageHTMLParser' );
const showOnPageReload = require( './showOnPageReload' );
const OverlayManager = require( './OverlayManager' );
const eventBusSingleton = require( './eventBusSingleton' );
const mfExtend = require( './mfExtend' );
const View = require( './View' );
const Overlay = require( './Overlay' );
const ReferencesHtmlScraperGateway = require( './references/ReferencesHtmlScraperGateway' );
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

// Expose the entry chunk through libraryTarget and library. This allows
// arbitrary file access via ResourceLoader like
// `mfModules['mobile.startup'].moduleLoader.require('mobile.startup/LoadingOverlay')`.
module.exports = {
	moduleLoader,
	/**
	 * @deprecated use ES6 classes instead
	 */
	mfExtend,
	time,
	/**
	 * @deprecated 1.41 use ES6 functions and classes instead.
	 */
	util,
	headers,
	View,
	PageGateway: DeprecatedPageGateway,
	/**
	 * @deprecated 1.41 should be moved into Minerva
	 */
	LanguageInfo,
	/**
	 * @deprecated use navigator.userAgent instead.
	 */
	Browser: require( './Browser' ),
	/**
	 * @deprecated 1.41 use Codex markup instead.
	 */
	Button,
	/**
	 * @deprecated 1.41 use Codex markup instead.
	 */
	Icon,
	/**
	 * @deprecated 1.41 use Codex markup instead.
	 */
	IconButton,
	ReferencesGateway: require( './references/ReferencesGateway' ),
	ReferencesHtmlScraperGateway,
	icons,
	Page: require( './Page' ),
	currentPage,
	PageHTMLParser,
	currentPageHTMLParser,
	/**
	 * @deprecated 1.41 use Codex link mixin instead.
	 *   https://doc.wikimedia.org/codex/latest/components/mixins/link.html
	 */
	Anchor,
	Skin,
	OverlayManager,
	Overlay,
	loadingOverlay: require( './loadingOverlay' ),
	Drawer,
	CtaDrawer,
	showOnPageReload,
	/**
	 * @deprecated 1.41 should be moved into Minerva
	 */
	toast: showOnPageReload,
	Watchstar: require( './watchstar/watchstar' ),
	/**
	 * @deprecated 1.41 use hook instead
	 */
	eventBusSingleton,
	promisedView,
	Toggler: require( './Toggler' ),
	toc: {
		// In case any old version of Minerva is cached.
		TableOfContents: () => {
			return {
				// in the unlikely event old Minerva code got loaded with new MF.
				$el: util.parseHTML( '<div>' )
			};
		}
	},
	references,
	search,
	lazyImages: {
		lazyImageLoader
	},
	languageOverlay,
	languageInfoOverlay,
	mediaViewer,
	amcOutreach,
	Section: require( './Section' )
};

mw.mobileFrontend = moduleLoader;
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

// Setup a single export for new modules to fold all of the above lines into.
// One export to rule them all!
moduleLoader.define( 'mobile.startup', module.exports );
