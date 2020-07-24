var
	moduleLoader = require( './moduleLoaderSingleton' ),
	util = require( './util' );

// Expose the entry chunk through libraryTarget and library. This allows
// arbitrary file access via ResourceLoader like
// `mfModules['mobile.startup'].moduleLoader.require('mobile.startup/LoadingOverlay')`.
module.exports = {
	moduleLoader: moduleLoader,
	mfExtend: require( './mfExtend' ),
	time: require( './time' ),
	util,
	headers: require( './headers' ),
	View: require( './View' ),
	PageGateway: require( './PageGateway' ),
	LanguageInfo: require( './LanguageInfo' ),
	Browser: require( './Browser' ),
	Button: require( './Button' ),
	Icon: require( './Icon' ),
	ReferencesGateway: require( './references/ReferencesGateway' ),
	ReferencesHtmlScraperGateway: require( './references/ReferencesHtmlScraperGateway' ),
	icons: require( './icons' ),
	Page: require( './Page' ),
	currentPage: require( './currentPage' ),
	PageHTMLParser: require( './PageHTMLParser' ),
	currentPageHTMLParser: require( './currentPageHTMLParser' ),
	Anchor: require( './Anchor' ),
	Skin: require( './Skin' ),
	OverlayManager: require( './OverlayManager' ),
	Overlay: require( './Overlay' ),
	loadingOverlay: require( './loadingOverlay' ),
	Drawer: require( './Drawer' ),
	CtaDrawer: require( './CtaDrawer' ),
	showOnPageReload: require( './showOnPageReload' ),
	// For Minerva compatibility (access deprecated)
	toast: require( './showOnPageReload' ),
	Watchstar: require( './watchstar/watchstar' ),
	categoryOverlay: require( './categoryOverlay' ),
	eventBusSingleton: require( './eventBusSingleton' ),
	promisedView: require( './promisedView' ),
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
	references: require( './references/references' ),
	search: {
		SearchOverlay: require( './search/SearchOverlay' ),
		MobileWebSearchLogger: require( './search/MobileWebSearchLogger' ),
		SearchGateway: require( './search/SearchGateway' )
	},
	lazyImages: {
		lazyImageLoader: require( './lazyImages/lazyImageLoader' )
	},
	languageOverlay: require( './languageOverlay/languageOverlay' ),
	languageInfoOverlay: require( './languageOverlay/languageInfoOverlay' ),
	mediaViewer: {
		overlay: require( './mediaViewer/overlay' )
	},
	amcOutreach: require( './amcOutreach/amcOutreach' ),
	Section: require( './Section' )
};

mw.mobileFrontend = moduleLoader;

// Setup a single export for new modules to fold all of the above lines into.
// One export to rule them all!
moduleLoader.define( 'mobile.startup', module.exports );
