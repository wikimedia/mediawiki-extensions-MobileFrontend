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
	actionParams: require( './actionParams' ),
	util: require( './util' ),
	View: require( './View' ),
	PageGateway: require( './PageGateway' ),
	Browser: require( './Browser' ),
	cache: require( './cache' ),
	Button: require( './Button' ),
	Icon: require( './Icon' ),
	ReferencesDrawer: require( './references/ReferencesDrawer' ),
	ReferencesGateway: require( './references/ReferencesGateway' ),
	ReferencesHtmlScraperGateway: require( './references/ReferencesHtmlScraperGateway' ),
	ReferencesMobileViewGateway: require( './references/ReferencesMobileViewGateway' ),
	icons: require( './icons' ),
	Panel: require( './Panel' ),
	Section: require( './Section' ),
	Page: require( './Page' ),
	Anchor: require( './Anchor' ),
	Skin: require( './Skin' ),
	OverlayManager: require( './OverlayManager' ),
	Overlay: require( './Overlay' ),
	loadingOverlay: require( './loadingOverlay' ),
	Drawer: require( './Drawer' ),
	CtaDrawer: require( './CtaDrawer' ),
	PageList: require( './PageList' ),
	toast: require( './toast' ),
	extendSearchParams: require( './extendSearchParams' ),
	Watchstar: require( './watchstar/Watchstar' ),
	WatchstarPageList: require( './watchstar/WatchstarPageList' ),
	rlModuleLoader: require( './rlModuleLoader' ),
	eventBusSingleton: require( './eventBusSingleton' ),
	Toggler: require( './Toggler' ),
	schemaMobileWebSearch: schemaMobileWebSearch,
	ScrollEndEventEmitter: require( './ScrollEndEventEmitter' ),
	MessageBox: require( './MessageBox' ),
	toc: {
		TableOfContents: require( './toc/TableOfContents' )
	},
	search: {
		SearchOverlay: require( './search/SearchOverlay' ),
		MobileWebSearchLogger: require( './search/MobileWebSearchLogger' ),
		SearchGateway: require( './search/SearchGateway' )
	},
	lazyImages: {
		lazyImageLoader: require( './lazyImages/lazyImageLoader' )
	}
};

mw.mobileFrontend = moduleLoader;
OO.mfExtend = module.exports.mfExtend;

// Setup a single export for new modules to fold all of the above lines into.
// One export to rule them all!
moduleLoader.define( 'mobile.startup', module.exports );

schemaMobileWebSearch.subscribeMobileWebSearchSchema();
