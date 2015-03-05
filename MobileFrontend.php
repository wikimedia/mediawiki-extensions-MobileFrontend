<?php
/**
 * Extension MobileFrontend
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
 * @author Rob Moen
 * @author Sam Smith
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
		'Brion Vibber', 'Juliusz Gonera', 'Ryan Kaldari', 'Florian Schmidt', 'Rob Moen',
		'Sam Smith' ),
	'descriptionmsg' => 'mobile-frontend-desc',
	'url' => 'https://www.mediawiki.org/wiki/Extension:MobileFrontend',
	'license-name' => 'GPL-2.0+',
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

	'MobileCollection' => 'models/MobileCollection',
	'MobilePage' => 'models/MobilePage',

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

	'MFResourceLoaderParsedMessageModule' => 'modules/MFResourceLoaderParsedMessageModule',

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
$wgHooks['ChangeTagsListActive'][] = 'MobileFrontendHooks::onListDefinedTags';
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
$wgHooks['ResourceLoaderGetLessVars'][] = 'MobileFrontendHooks::onResourceLoaderGetLessVars';

$wgSpecialPages += array(
	'History' => 'SpecialMobileHistory',
	'MobileDiff' => 'SpecialMobileDiff',
	'MobileEditor' => 'SpecialMobileEditor',
	'MobileOptions' => 'SpecialMobileOptions',
	'MobileMenu' => 'SpecialMobileMenu',
	'MobileLanguages' => 'SpecialMobileLanguages',
	'Uploads' => 'SpecialUploads',
	'UserProfile' => 'SpecialUserProfile',
);
$wgSpecialPageGroups['Nearby'] = 'pages';

// Register Minerva as a valid skin
$wgValidSkinNames['minerva'] = "Minerva";

// Which users should see an upload button on pageviews?
$wgAvailableRights[] = 'mf-uploadbutton';
$wgGroupPermissions['*']['mf-uploadbutton'] = false;
$wgGroupPermissions['autoconfirmed']['mf-uploadbutton'] = true;
$wgGroupPermissions['sysop']['mf-uploadbutton'] = true;

// Config instance
$wgConfigRegistry['mobilefrontend'] = 'GlobalVarConfig::newInstance';

// Set LESS importpath
$wgResourceLoaderLESSImportPaths[] = __DIR__ . "/less/minerva.less/";

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

/**
 * A mobile enabled ResourceLoaderFileModule template which supports parsed messages.
 */
$wgMFResourceParsedMessageModuleBoilerplate = $wgMFResourceBoilerplate + array(
	'class' => 'MFResourceLoaderParsedMessageModule',
);

require_once __DIR__ . "/includes/Resources.php";

/**
 * Begin configuration variables
 */
require_once __DIR__ . "/includes/Config.php";
