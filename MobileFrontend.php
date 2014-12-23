<?php
/**
 * Extension MobileFrontend — Mobile Frontend
 *
 * @file
 * @ingroup Extensions
 * @author Arthur Richards
 * @author Jon Robson
 * @author Juliusz Gonera
 * @author Max Semenik
 * @author Patrick Reilly
 * @author Ryan Kaldari
 * @author Florian Schmidt
 * @licence GNU General Public Licence 2.0 or later
 */

// Needs to be called within MediaWiki; not standalone
if ( !defined( 'MEDIAWIKI' ) ) {
	echo "This is a MediaWiki extension and cannot run standalone.\n";
	die( -1 );
}

// Too many people are trying to use master MF with stable MediaWiki releases
if ( version_compare( $wgVersion, '1.25c', '<' ) ) {
	echo "This version of MobileFrontend requires MediaWiki 1.25, you have $wgVersion.
You can download a more appropriate version from
https://www.mediawiki.org/wiki/Special:ExtensionDistributor/MobileFrontend\n";
	die( -1 );
}

// Define the extension; allows us make sure the extension is used correctly
define( 'MOBILEFRONTEND', 'MobileFrontend' );

// Extension credits that will show up on Special:Version
$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'MobileFrontend',
	'author' => array( 'Patrick Reilly', 'Max Semenik', 'Jon Robson', 'Arthur Richards',
		'Brion Vibber', 'Juliusz Gonera', 'Ryan Kaldari', 'Florian Schmidt' ),
	'descriptionmsg' => 'mobile-frontend-desc',
	'url' => 'https://www.mediawiki.org/wiki/Extension:MobileFrontend',
);

$wgMessagesDirs['MobileFrontend'] = __DIR__ . '/i18n';
$wgExtensionMessagesFiles['MobileFrontendAlias'] = __DIR__ . "/MobileFrontend.alias.php";

// autoload extension classes
$autoloadClasses = array (
	'ExtMobileFrontend' => 'MobileFrontend.body',
	'MobileFrontendHooks' => 'MobileFrontend.hooks',

	'IDeviceProperties' => 'DeviceDetection',
	'IDeviceDetector' => 'DeviceDetection',
	'DeviceProperties' => 'DeviceDetection',
	'PredefinedDeviceProperties' => 'DeviceDetection',
	'DeviceDetection' => 'DeviceDetection',
	'HtmlDeviceProperties' => 'DeviceDetection',
	'MobileContext' => 'MobileContext',
	'MobileFormatter' => 'MobileFormatter',
	'MobilePage' => 'MobilePage',
	'MobileUI' => 'MobileUI',
	'MobileUserInfo' => 'MobileUserInfo',

	'ApiMobileView' => 'api/ApiMobileView',
	'ApiParseExtender' => 'api/ApiParseExtender',

	'InlineDiffFormatter' => 'diff/InlineDiffFormatter',
	'InlineDifferenceEngine' => 'diff/InlineDifferenceEngine',

	'MobileSiteModule' => 'modules/MobileSiteModule',
	'MobileUserModule' => 'modules/MobileUserModule',

	'SpecialUploads' => 'specials/SpecialUploads',
	'SpecialUserProfile' => 'specials/SpecialUserProfile',
	'SpecialMobileHistory' => 'specials/SpecialMobileHistory',
	'SpecialMobileDiff' => 'specials/SpecialMobileDiff',
	'SpecialMobileEditor' => 'specials/SpecialMobileEditor',
	'SpecialMobileOptions' => 'specials/SpecialMobileOptions',
	'SpecialMobileMenu' => 'specials/SpecialMobileMenu',
	'SpecialMobileWatchlist' => 'specials/SpecialMobileWatchlist',
	'SpecialMobileEditWatchlist' => 'specials/SpecialMobileEditWatchlist',
	'SpecialMobileContributions' => 'specials/SpecialMobileContributions',
	'SpecialNearby' => 'specials/SpecialNearby',
	'SpecialMobileLanguages' => 'specials/SpecialMobileLanguages',
	'SpecialMobilePreferences' => 'specials/SpecialMobilePreferences',
	'SpecialMobileNotifications' => 'specials/SpecialMobileNotifications',
	'MobileSpecialPage' => 'specials/MobileSpecialPage',
	'MobileSpecialPageFeed' => 'specials/MobileSpecialPageFeed',

	'MinervaTemplate' => 'skins/MinervaTemplate',
	'MinervaTemplateBeta' => 'skins/MinervaTemplateBeta',
	'MinervaTemplateAlpha' => 'skins/MinervaTemplateAlpha',

	'SkinMinerva' => 'skins/SkinMinerva',
	'SkinMinervaBeta' => 'skins/SkinMinervaBeta',
	'SkinMinervaAlpha' => 'skins/SkinMinervaAlpha',

	'UserLoginAndCreateTemplate' => 'skins/UserLoginAndCreateTemplate',
	'UserLoginMobileTemplate' => 'skins/UserLoginMobileTemplate',
	'UserAccountCreateMobileTemplate' => 'skins/UserAccountCreateMobileTemplate',
);

foreach ( $autoloadClasses as $className => $classFilename ) {
	$wgAutoloadClasses[$className] = __DIR__ . "/includes/$classFilename.php";
}

$wgExtensionFunctions[] = 'efMobileFrontend_Setup';

$wgAPIModules['mobileview'] = 'ApiMobileView';

$wgHooks['APIGetAllowedParams'][] = 'ApiParseExtender::onAPIGetAllowedParams';
$wgHooks['APIAfterExecute'][] = 'ApiParseExtender::onAPIAfterExecute';
$wgHooks['APIGetParamDescription'][] = 'ApiParseExtender::onAPIGetParamDescription';
$wgHooks['APIGetDescription'][] = 'ApiParseExtender::onAPIGetDescription';

$wgHooks['LinksUpdate'][] = 'MobileFrontendHooks::onLinksUpdate';
$wgHooks['RequestContextCreateSkin'][] = 'MobileFrontendHooks::onRequestContextCreateSkin';
$wgHooks['MediaWikiPerformAction'][] = 'MobileFrontendHooks::onMediaWikiPerformAction';
$wgHooks['SkinTemplateOutputPageBeforeExec'][] =
	'MobileFrontendHooks::onSkinTemplateOutputPageBeforeExec';
$wgHooks['BeforePageRedirect'][] = 'MobileFrontendHooks::onBeforePageRedirect';
$wgHooks['DiffViewHeader'][] = 'MobileFrontendHooks::onDiffViewHeader';
$wgHooks['ResourceLoaderTestModules'][] = 'MobileFrontendHooks::onResourceLoaderTestModules';
$wgHooks['GetCacheVaryCookies'][] = 'MobileFrontendHooks::onGetCacheVaryCookies';
$wgHooks['ResourceLoaderGetConfigVars'][] = 'MobileFrontendHooks::onResourceLoaderGetConfigVars';
$wgHooks['SpecialPage_initList'][] = 'MobileFrontendHooks::onSpecialPage_initList';
$wgHooks['ListDefinedTags'][] = 'MobileFrontendHooks::onListDefinedTags';
$wgHooks['RecentChange_save'][] = 'MobileFrontendHooks::onRecentChange_save';
$wgHooks['AbuseFilter-generateUserVars'][] = 'MobileFrontendHooks::onAbuseFilterGenerateUserVars';
$wgHooks['AbuseFilter-builder'][] = 'MobileFrontendHooks::onAbuseFilterBuilder';
$wgHooks['SpecialPageBeforeExecute'][] = 'MobileFrontendHooks::onSpecialPageBeforeExecute';
$wgHooks['UserLoginComplete'][] = 'MobileFrontendHooks::onUserLoginComplete';
$wgHooks['UserLoginForm'][] = 'MobileFrontendHooks::onUserLoginForm';
$wgHooks['UserCreateForm'][] = 'MobileFrontendHooks::onUserCreateForm';
$wgHooks['BeforePageDisplay'][] = 'MobileFrontendHooks::onBeforePageDisplay';
$wgHooks['CustomEditor'][] = 'MobileFrontendHooks::onCustomEditor';
$wgHooks['GetPreferences'][] = 'MobileFrontendHooks::onGetPreferences';
$wgHooks['GetBetaFeaturePreferences'][] = 'MobileFrontendHooks::onGetBetaFeaturePreferences';
$wgHooks['Gadgets::allowLegacy'][] = 'MobileFrontendHooks::onAllowLegacyGadgets';
$wgHooks['UnitTestsList'][] = 'MobileFrontendHooks::onUnitTestsList';
$wgHooks['CentralAuthLoginRedirectData'][] = 'MobileFrontendHooks::onCentralAuthLoginRedirectData';
$wgHooks['CentralAuthSilentLoginRedirect'][] =
	'MobileFrontendHooks::onCentralAuthSilentLoginRedirect';
$wgHooks['ResourceLoaderRegisterModules'][] =
	'MobileFrontendHooks::onResourceLoaderRegisterModules';
$wgHooks['EventLoggingRegisterSchemas'][] =
	'MobileFrontendHooks::onEventLoggingRegisterSchemas';
$wgHooks['OutputPageParserOutput'][] = 'MobileFrontendHooks::onOutputPageParserOutput';
$wgHooks['HTMLFileCache::useFileCache'][] = 'MobileFrontendHooks::onHTMLFileCache_useFileCache';
$wgHooks['LoginFormValidErrorMessages'][] = 'MobileFrontendHooks::onLoginFormValidErrorMessages';

// use array_merge to ensure we do not override existing values set by core
$wgSpecialPages = array_merge( $wgSpecialPages, array(
	'History' => 'SpecialMobileHistory',
	'MobileDiff' => 'SpecialMobileDiff',
	'MobileEditor' => 'SpecialMobileEditor',
	'MobileOptions' => 'SpecialMobileOptions',
	'MobileMenu' => 'SpecialMobileMenu',
	'MobileLanguages' => 'SpecialMobileLanguages',
	'Uploads' => 'SpecialUploads',
	'UserProfile' => 'SpecialUserProfile',
) );

// Register Minerva as a valid skin
$wgValidSkinNames['minerva'] = "Minerva";

// Which users should see an upload button on pageviews?
$wgAvailableRights[] = 'mf-uploadbutton';
$wgGroupPermissions['*']['mf-uploadbutton'] = false;
$wgGroupPermissions['autoconfirmed']['mf-uploadbutton'] = true;
$wgGroupPermissions['sysop']['mf-uploadbutton'] = true;

/**
 * Setup MobileFrontend, load global components
 */
function efMobileFrontend_Setup() {
	global $wgMFNearby, $wgSpecialPages, $wgSpecialPageGroups, $wgResourceLoaderLESSVars,
		$wgResourceLoaderLESSImportPaths,
		$wgMFDeviceWidthTablet, $wgMFDeviceWidthMobileSmall, $wgResourceModules, $wgMobileVEModules;

	// Depends on Mantle extension
	if ( !class_exists( 'MantleHooks' ) ) {
		echo "Please install the Mantle MediaWiki extension.\n";
		die( -1 );
	}

	if ( $wgMFNearby ) {
		$wgSpecialPages['Nearby'] = 'SpecialNearby';
		$wgSpecialPageGroups['Nearby'] = 'pages';
	}
	// Set LESS global variables
	$localBasePath = dirname( __DIR__ );
	$wgResourceLoaderLESSImportPaths = array_merge( $wgResourceLoaderLESSImportPaths, array(
		"$localBasePath/MobileFrontend/less/minerva.less/",
	) );
	$wgResourceLoaderLESSVars = array_merge( $wgResourceLoaderLESSVars,
		array(
			'wgMFDeviceWidthTablet' => "{$wgMFDeviceWidthTablet}px",
			'wgMFDeviceWidthMobileSmall' => "{$wgMFDeviceWidthMobileSmall}px",
			'wgMFThumbnailTiny' =>  MobilePage::TINY_IMAGE_WIDTH . 'px',
			'wgMFThumbnailSmall' =>  MobilePage::SMALL_IMAGE_WIDTH . 'px',
			'wgMFThumbnailMedium' => MobilePage::MEDIUM_IMAGE_WIDTH . 'px',
		)
	);

	// add VisualEditor related modules only, if VisualEditor seems to be installed - T85007
	if ( class_exists( 'VisualEditorHooks' ) ) {
		$wgResourceModules = array_merge( $wgResourceModules, $wgMobileVEModules );
	}
}

// Config instance
$wgConfigRegistry['mobilefrontend'] = 'GlobalVarConfig::newInstance';

// ResourceLoader modules

/**
 * A boilerplate for RL modules that do not support templates
 * Agnostic to whether desktop or mobile specific.
 */
$wgMFResourceBoilerplate = array(
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'MobileFrontend',
);

/**
 * A mobile enabled ResourceLoaderFileModule template
 */
$wgMFResourceFileModuleBoilerplate = $wgMFResourceBoilerplate + array(
	'targets' => array( 'mobile', 'desktop' ),
);

/**
 * A boilerplate containing common properties for all RL modules served to mobile site special pages
 * Restricted to mobile site.
 */
$wgMFMobileSpecialPageResourceBoilerplate = $wgMFResourceBoilerplate + array(
	'targets' => 'mobile',
	'group' => 'other',
);
require_once __DIR__ . "/includes/Resources.php";

/**
 * Begin configuration variables
 */
require_once __DIR__ . "/includes/Config.php";
