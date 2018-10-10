var
	moduleLoader = require( './moduleSingleton' ),
	mfExtend = require( './mfExtend' ),
	context = require( './context' ),
	time = require( './time' ),
	user = require( './user' ),
	util = require( './util' ),
	View = require( './View' ),
	PageGateway = require( './PageGateway' ),
	Browser = require( './Browser' ),
	cache = require( './cache' ),
	Button = require( './Button' ),
	Icon = require( './Icon' ),
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
	rlModuleLoader = require( './rlModuleLoader' );

mw.mobileFrontend = moduleLoader;
mw.log.deprecate( moduleLoader, 'on', moduleLoader.on,
	'The global EventEmitter should not be used (T156186).' );

OO.mfExtend = mfExtend;

// I know there is a temptation to use moduleLoader here, but if you do resource-modules will fail
// as webpack might change the variable name. Using mw.mobileFrontend means that the variable
// will not be recast.
mw.mobileFrontend.define( 'mobile.startup/util', util );
mw.mobileFrontend.define( 'mobile.startup/View', View );
mw.mobileFrontend.define( 'mobile.startup/Browser', Browser );
mw.mobileFrontend.define( 'mobile.startup/cache', cache );
mw.mobileFrontend.define( 'mobile.startup/time', time );
mw.mobileFrontend.define( 'mobile.startup/context', context );
mw.mobileFrontend.define( 'mobile.startup/user', user );
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
mw.mobileFrontend.define( 'mobile.startup/rlModuleLoader', rlModuleLoader );

// Expose the entry chunk through libraryTarget and library. This allows
// arbitrary file access via ResourceLoader like
// `mfModules['mobile.startup'].moduleLoader.require('mobile.startup/LoadingOverlay')`.
module.exports = {
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
	rlModuleLoader: rlModuleLoader
};
