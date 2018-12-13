var
	moduleLoader = require( './moduleLoaderSingleton' ),
	mfExtend = require( './mfExtend' ),
	context = require( './context' ),
	time = require( './time' ),
	util = require( './util' ),
	View = require( './View' ),
	PageGateway = require( './PageGateway' ),
	Browser = require( './Browser' ),
	cache = require( './cache' ),
	Button = require( './Button' ),
	Icon = require( './Icon' ),
	ReferencesDrawer = require( './references/ReferencesDrawer' ),
	ReferencesGateway = require( './references/ReferencesGateway' ),
	ReferencesHtmlScraperGateway = require( './references/ReferencesHtmlScraperGateway' ),
	ReferencesMobileViewGateway = require( './references/ReferencesMobileViewGateway' ),
	icons = require( './icons' ),
	Panel = require( './Panel' ),
	Section = require( './Section' ),
	Thumbnail = require( './Thumbnail' ),
	Page = require( './Page' ),
	Anchor = require( './Anchor' ),
	Skin = require( './Skin' ),
	OverlayManager = require( './OverlayManager' ),
	Overlay = require( './Overlay' ),
	LoadingOverlay = require( './LoadingOverlay' ),
	Drawer = require( './Drawer' ),
	CtaDrawer = require( './CtaDrawer' ),
	PageList = require( './PageList' ),
	toast = require( './toast' ),
	extendSearchParams = require( './extendSearchParams' ),
	Watchstar = require( './watchstar/Watchstar' ),
	WatchstarPageList = require( './watchstar/WatchstarPageList' ),
	rlModuleLoader = require( './rlModuleLoader' ),
	eventBusSingleton = require( './eventBusSingleton' ),
	Toggler = require( './Toggler' ),
	SearchGateway = require( './search/SearchGateway' );

mw.mobileFrontend = moduleLoader;

OO.mfExtend = mfExtend;

// I know there is a temptation to use moduleLoader here, but if you do resource-modules will fail
// as webpack might change the variable name. Using mw.mobileFrontend means that the variable
// will not be recast.
// These will soon be deprecated - please use the import path mobile.startup going forward.
mw.mobileFrontend.define( 'mobile.startup/util', util );
mw.mobileFrontend.define( 'mobile.startup/View', View );
mw.mobileFrontend.define( 'mobile.startup/Browser', Browser );
mw.mobileFrontend.define( 'mobile.startup/cache', cache );
mw.mobileFrontend.define( 'mobile.startup/time', time );
mw.mobileFrontend.define( 'mobile.startup/context', context );
mw.mobileFrontend.define( 'mobile.startup/PageGateway', PageGateway );
mw.mobileFrontend.define( 'mobile.startup/Button', Button );
mw.mobileFrontend.define( 'mobile.startup/Icon', Icon );
mw.mobileFrontend.define( 'mobile.startup/icons', icons );
mw.mobileFrontend.define( 'mobile.startup/Panel', Panel );
mw.mobileFrontend.define( 'mobile.startup/Section', Section );
mw.mobileFrontend.define( 'mobile.startup/Thumbnail', Thumbnail );
mw.mobileFrontend.define( 'mobile.startup/Page', Page );
mw.mobileFrontend.define( 'mobile.startup/Anchor', Anchor );
mw.mobileFrontend.define( 'mobile.startup/Skin', Skin );
mw.mobileFrontend.define( 'mobile.startup/OverlayManager', OverlayManager );
mw.mobileFrontend.define( 'mobile.startup/Overlay', Overlay );
mw.mobileFrontend.define( 'mobile.startup/LoadingOverlay', LoadingOverlay );
mw.mobileFrontend.define( 'mobile.startup/Drawer', Drawer );
mw.mobileFrontend.define( 'mobile.startup/CtaDrawer', CtaDrawer );
mw.mobileFrontend.define( 'mobile.startup/PageList', PageList );
mw.mobileFrontend.define( 'mobile.startup/toast', toast );
mw.mobileFrontend.define( 'mobile.startup/rlModuleLoader', rlModuleLoader );
mw.mobileFrontend.define( 'mobile.startup/eventBusSingleton', eventBusSingleton );
mw.mobileFrontend.deprecate( 'mobile.search.util/extendSearchParams', extendSearchParams, 'mobile.startup' );
mw.mobileFrontend.deprecate( 'mobile.references/ReferencesDrawer', ReferencesDrawer, 'mobile.startup' );
mw.mobileFrontend.deprecate( 'mobile.references.gateway/ReferencesGateway', ReferencesGateway, 'mobile.startup' );
mw.mobileFrontend.deprecate( 'mobile.references.gateway/ReferencesHtmlScraperGateway',
	ReferencesHtmlScraperGateway, 'mobile.startup' );
mw.mobileFrontend.deprecate( 'mobile.references.gateway/ReferencesMobileViewGateway',
	ReferencesMobileViewGateway, 'mobile.startup' );
mw.mobileFrontend.deprecate( 'mobile.watchstar/Watchstar', Watchstar, 'mobile.startup' );
mw.mobileFrontend.deprecate( 'mobile.pagelist.scripts/WatchstarPageList', WatchstarPageList, 'mobile.startup' );
mw.mobileFrontend.deprecate( 'mobile.toggle/Toggler', Toggler, 'mobile.startup' );
mw.mobileFrontend.deprecate( 'mobile.search.api/SearchGateway', SearchGateway, 'mobile.startup' );

// Expose the entry chunk through libraryTarget and library. This allows
// arbitrary file access via ResourceLoader like
// `mfModules['mobile.startup'].moduleLoader.require('mobile.startup/LoadingOverlay')`.
module.exports = {
	extendSearchParams: extendSearchParams,
	ReferencesDrawer: ReferencesDrawer,
	ReferencesGateway: ReferencesGateway,
	ReferencesHtmlScraperGateway: ReferencesHtmlScraperGateway,
	ReferencesMobileViewGateway: ReferencesMobileViewGateway,
	moduleLoader: moduleLoader,
	time: time,
	util: util,
	View: View,
	Browser: Browser,
	context: context,
	cache: cache,
	Button: Button,
	Icon: Icon,
	icons: icons,
	Panel: Panel,
	Section: Section,
	Page: Page,
	Anchor: Anchor,
	Skin: Skin,
	OverlayManager: OverlayManager,
	Overlay: Overlay,
	LoadingOverlay: LoadingOverlay,
	Drawer: Drawer,
	CtaDrawer: CtaDrawer,
	PageList: PageList,
	toast: toast,
	Watchstar: Watchstar,
	WatchstarPageList: WatchstarPageList,
	rlModuleLoader: rlModuleLoader,
	eventBusSingleton: eventBusSingleton,
	Toggler: Toggler,
	search: {
		SearchGateway: SearchGateway
	}
};

// Setup a single export for new modules to fold all of the above lines into.
// One export to rule them all!
mw.mobileFrontend.define( 'mobile.startup', module.exports );
