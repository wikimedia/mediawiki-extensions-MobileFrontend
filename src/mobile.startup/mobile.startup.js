var
	moduleLoader = require( './moduleLoaderSingleton' ),
	schemaMobileWebSearch = require( './search/schemaMobileWebSearch' );

// Expose the entry chunk through libraryTarget and library. This allows
// arbitrary file access via ResourceLoader like
// `mfModules['mobile.startup'].moduleLoader.require('mobile.startup/LoadingOverlay')`.
module.exports = {
	moduleLoader: moduleLoader,
	mfExtend: require( './mfExtend' ),
	context: require( './context' ),
	time: require( './time' ),
	util: require( './util' ),
	View: require( './View' ),
	PageGateway: require( './PageGateway' ),
	Browser: require( './Browser' ),
	Button: require( './Button' ),
	Icon: require( './Icon' ),
	ReferencesDrawer: require( './references/ReferencesDrawer' ),
	ReferencesGateway: require( './references/ReferencesGateway' ),
	ReferencesHtmlScraperGateway: require( './references/ReferencesHtmlScraperGateway' ),
	ReferencesMobileViewGateway: require( './references/ReferencesMobileViewGateway' ),
	icons: require( './icons' ),
	Page: require( './Page' ),
	Anchor: require( './Anchor' ),
	Skin: require( './Skin' ),
	OverlayManager: require( './OverlayManager' ),
	Overlay: require( './Overlay' ),
	loadingOverlay: require( './loadingOverlay' ),
	CtaDrawer: require( './CtaDrawer' ),
	toast: require( './toast' ),
	Watchstar: require( './watchstar/Watchstar' ),
	rlModuleLoader: require( './rlModuleLoader' ),
	eventBusSingleton: require( './eventBusSingleton' ),
	Toggler: require( './Toggler' ),
	toc: {
		TableOfContents: require( './toc/TableOfContents' )
	},
	notifications: {
		overlay: require( './notifications/overlay' )
	},
	search: {
		SearchOverlay: require( './search/SearchOverlay' ),
		MobileWebSearchLogger: require( './search/MobileWebSearchLogger' ),
		SearchGateway: require( './search/SearchGateway' )
	},
	lazyImages: {
		lazyImageLoader: require( './lazyImages/lazyImageLoader' )
	},
	talk: {
		overlay: require( './talk/overlay' )
	},
	languageOverlay: require( './languageOverlay/languageOverlay' )
};

mw.mobileFrontend = moduleLoader;

// Setup a single export for new modules to fold all of the above lines into.
// One export to rule them all!
moduleLoader.define( 'mobile.startup', module.exports );

schemaMobileWebSearch.subscribeMobileWebSearchSchema();
