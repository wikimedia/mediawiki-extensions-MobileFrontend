var
	moduleLoader = require( './moduleLoaderSingleton' ),
	util = require( './util' ),
	schemaMobileWebSearch = require( './search/schemaMobileWebSearch' );

// Expose the entry chunk through libraryTarget and library. This allows
// arbitrary file access via ResourceLoader like
// `mfModules['mobile.startup'].moduleLoader.require('mobile.startup/LoadingOverlay')`.
module.exports = {
	moduleLoader: moduleLoader,
	mfExtend: require( './mfExtend' ),
	context: require( './context' ),
	time: require( './time' ),
	util,
	View: require( './View' ),
	PageGateway: require( './PageGateway' ),
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
	CtaDrawer: require( './CtaDrawer' ),
	toast: require( './toast' ),
	Watchstar: require( './watchstar/Watchstar' ),
	rlModuleLoader: require( './rlModuleLoader' ),
	eventBusSingleton: require( './eventBusSingleton' ),
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
	notifications: {
		overlay: require( './notifications/overlay' )
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
	talk: {
		overlay: require( './talk/overlay' )
	},
	languageOverlay: require( './languageOverlay/languageOverlay' ),
	mediaViewer: {
		overlay: require( './mediaViewer/overlay' )
	}
};

mw.mobileFrontend = moduleLoader;

// Setup a single export for new modules to fold all of the above lines into.
// One export to rule them all!
moduleLoader.define( 'mobile.startup', module.exports );

schemaMobileWebSearch.subscribeMobileWebSearchSchema();
