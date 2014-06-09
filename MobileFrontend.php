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
 * @licence GNU General Public Licence 2.0 or later
 */

// Needs to be called within MediaWiki; not standalone
if ( !defined( 'MEDIAWIKI' ) ) {
	echo "This is a MediaWiki extension and cannot run standalone.\n";
	die( -1 );
}

// Too many people are trying to use master MF with stable MediaWiki releases
if ( version_compare( $wgVersion, '1.23c', '<' ) ) {
	echo "This version of MobileFrontend requires MediaWiki 1.23, you have $wgVersion.
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
		'Brion Vibber', 'Juliusz Gonera', 'Ryan Kaldari' ),
	'descriptionmsg' => 'mobile-frontend-desc',
	'url' => 'https://www.mediawiki.org/wiki/Extension:MobileFrontend',
);

$wgMessagesDirs['MobileFrontend'] = __DIR__ . '/i18n';
$wgExtensionMessagesFiles['MobileFrontendAlias'] = __DIR__ . "/MobileFrontend.alias.php";

// autoload extension classes
$autoloadClasses = array (
	'ExtMobileFrontend' => 'MobileFrontend.body',
	'MobileFrontendHooks' => 'MobileFrontend.hooks',

	'DeviceDetection' => 'DeviceDetection',
	'HtmlDeviceProperties' => 'DeviceDetection',
	'MobileContext' => 'MobileContext',
	'MobileFormatter' => 'MobileFormatter',
	'MobilePage' => 'MobilePage',
	'MobileUserInfo' => 'MobileUserInfo',

	'ApiMobileView' => 'api/ApiMobileView',
	'ApiParseExtender' => 'api/ApiParseExtender',

	'InlineDiffFormatter' => 'diff/InlineDiffFormatter',
	'InlineDifferenceEngine' => 'diff/InlineDifferenceEngine',

	'MFResourceLoaderModule' => 'modules/MFResourceLoaderModule',
	'MobileSiteModule' => 'modules/MobileSiteModule',

	'SpecialMobileWebApp' => 'specials/SpecialMobileWebApp',
	'SpecialUploads' => 'specials/SpecialUploads',
	'SpecialUserProfile' => 'specials/SpecialUserProfile',
	'SpecialMobileHistory' => 'specials/SpecialMobileHistory',
	'SpecialMobileUserlogin' => 'specials/SpecialMobileUserlogin',
	'SpecialMobileDiff' => 'specials/SpecialMobileDiff',
	'SpecialMobileEditor' => 'specials/SpecialMobileEditor',
	'SpecialMobileOptions' => 'specials/SpecialMobileOptions',
	'SpecialMobileMenu' => 'specials/SpecialMobileMenu',
	'SpecialMobileWatchlist' => 'specials/SpecialMobileWatchlist',
	'SpecialMobileContributions' => 'specials/SpecialMobileContributions',
	'SpecialNearby' => 'specials/SpecialNearby',
	'SpecialMobileLanguages' => 'specials/SpecialMobileLanguages',
	'SpecialMobileNotifications' => 'specials/SpecialMobileNotifications',
	'MobileSpecialPage' => 'specials/MobileSpecialPage',
	'MobileSpecialPageFeed' => 'specials/MobileSpecialPageFeed',

	'MinervaTemplate' => 'skins/MinervaTemplate',
	'MinervaTemplateBeta' => 'skins/MinervaTemplateBeta',
	'MinervaTemplateAlpha' => 'skins/MinervaTemplateAlpha',

	'SkinMinerva' => 'skins/SkinMinerva',
	'SkinMinervaBeta' => 'skins/SkinMinervaBeta',
	'SkinMinervaAlpha' => 'skins/SkinMinervaAlpha',
	'SkinMinervaApp' => 'skins/SkinMinervaApp',

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
$wgHooks['SkinTemplateOutputPageBeforeExec'][] =
	'MobileFrontendHooks::onSkinTemplateOutputPageBeforeExec';
$wgHooks['BeforePageRedirect'][] = 'MobileFrontendHooks::onBeforePageRedirect';
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
$wgHooks['OutputPageParserOutput'][] = 'MobileFrontendHooks::onOutputPageParserOutput';

// use array_merge to ensure we do not override existing values set by core
$wgSpecialPages = array_merge( $wgSpecialPages, array(
	'History' => 'SpecialMobileHistory',
	'MobileDiff' => 'SpecialMobileDiff',
	'MobileEditor' => 'SpecialMobileEditor',
	'MobileOptions' => 'SpecialMobileOptions',
	'MobileMenu' => 'SpecialMobileMenu',
	'MobileLanguages' => 'SpecialMobileLanguages',
	'MobileWebApp' => 'SpecialMobileWebApp',
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


function efMobileFrontend_Setup() {
	global $wgMFNearby, $wgSpecialPages, $wgSpecialPageGroups, $wgResourceLoaderLESSVars,
		$wgResourceLoaderLESSImportPaths,
		$wgMFDeviceWidthTablet, $wgMFDeviceWidthMobileSmall;

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
}

// ResourceLoader modules

/**
 * A boilerplate for the MFResourceLoaderModule that does not support templates
 * Agnostic to whether desktop or mobile specific.
 */
$wgMFResourceBoilerplate = array(
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'MobileFrontend',
);
/**
 * A boilerplate for the MFResourceLoaderModule that supports templates
 */
$wgMFMobileResourceBoilerplate = $wgMFResourceBoilerplate + array(
	'localTemplateBasePath' => __DIR__ . '/templates',
	'class' => 'MFResourceLoaderModule',
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

/**
 * The default skin for MobileFrontend
 * Defaults to SkinMinerva
 */
$wgMFDefaultSkinClass = 'SkinMinerva';

/*
 * Allow editing (uploading) to external CentralAuth-enabled wikis where
 * the user might not be logged in.
 */
$wgMFUseCentralAuthToken = false;

/**
 * An api to which any photos should be uploaded
 * e.g. $wgMFPhotoUploadEndpoint = 'https://commons.wikimedia.org/w/api.php';
 * Defaults to the current wiki
 */
$wgMFPhotoUploadEndpoint = '';

/**
 * An optional alternative api to query for nearby pages
 * e.g. https://en.m.wikipedia.org/w/api.php
 *
 * If set forces nearby to operate in JSONP mode
 * @var String
 */
$wgMFNearbyEndpoint = '';

/**
 * The content namespace(s) that Special:Nearby and Special:Random should use.
 * Should be one or more of NS_* constants, pipe-separated.
 * @var int|string
 */
$wgMFContentNamespace = NS_MAIN;

/**
 * The wiki id/dbname for where photos are uploaded, if photos are uploaded to
 * a wiki other than the local wiki (eg commonswiki).
 * @var string
 */
$wgMFPhotoUploadWiki = null;

/**
 * Path to the logo used in the login/signup form
 * The standard height is 72px
 */
$wgMobileFrontendLogo = false;

/**
 * Template for mobile URLs.
 *
 * This will be used to transcode regular URLs into mobile URLs for the
 * mobile view.
 *
 * It's possible to specify the 'mobileness' of the URL in the host portion of
 * the URL.
 *
 * You can either statically or dynamically create the host-portion of your
 * mobile URL. To statically create it, just set $wgMobileUrlTemplate to
 * the static hostname. For example:
 *		$wgMobileUrlTemplate = "mobile.mydomain.com";
 *
 * Alternatively, the host definition can include placeholders for different
 * parts of the 'host' section of a URL. The placeholders are denoted by '%h'
 * and followed with a digit that maps to the position of a host-part of the
 * original, non-mobile URL. Take the host 'en.wikipedia.org' for example.
 * '%h0' maps to 'en', '%h1' maps to 'wikipedia', and '%h2' maps to 'org'.
 * So, if you wanted a mobile URL scheme that turned "en.wikipedia.org" into
 * "en.m.wikipedia.org", your URL template would look like:
 * 		%h0.m.%h1.%h2
 */
$wgMobileUrlTemplate = '';

/**
 * The number of seconds the 'useformat' cookie should be valid
 *
 * The useformat cookie gets set when a user manually elects to view
 * either the mobile or desktop view of the site.
 *
 * If this value is not set, it will default to $wgCookieExpiration
 */
$wgMobileFrontendFormatCookieExpiry = null;

/**
 * Make the classes, tags and ids stripped from page content configurable.
 * Each item will be stripped from the page.
 */
$wgMFRemovableClasses = array(
	// These rules will be used for all transformations
	'base' => array(),
	// HTML view
	'HTML' => array(),
);

/**
 * Make the logos configurable.
 *
 * Currently, only 'copyright' element is supported, which is the logo for your content license
 *
 * Example: array(
 *	'copyright' => 'mysite_copyright_logo.png',
 * 	);
 */
$wgMFCustomLogos = array();

/**
 * Set to false to allow search engines to index your mobile pages. So far, Google seems
 * to mix mobile and non-mobile pages in its search results, creating confusion.
 */
$wgMFNoindexPages = true;

/**
 * Set the domain of the stopMobileRedirect cookie
 *
 * If this value is not set, it will default to the top domain of the host name
 * (eg en.wikipedia.org = .wikipedia.org)
 * If you want to set this to a top domain (to cover all subdomains), be sure
 * to include the preceding '.' (eg .wikipedia.org NOT wikipedia.org)
 */
$wgMFStopRedirectCookieHost = null;

/**
 * Whether or not to load desktop-specific ResourceLoader resources
 *
 * Current usecase is for deciding whether or not to load JS for unsetting
 * the stopMobileRedirect cookie
 * @var bool
 */
$wgMFEnableDesktopResources = false;

/**
 * Whether to append ™ to the sitename in page footer, or
 * ® to the sitename for alt text in footer if using a custom copyright logo.
 *
 * Defaults off to avoid being confusing.
 *
 * You can also edit the 'mobile-frontend-footer-sitename' message directly.
 */
$wgMFTrademarkSitename = false;

/**
 * Name of the class used for mobile device detection, must be inherited from
 * IDeviceDetector.
 */
$wgDeviceDetectionClass = 'DeviceDetection';


/**
 * Whether geodata related functionality should be enabled
 *
 * Defaults to false.
 */
$wgMFNearby = false;

/**
 * The range in meters that should be searched to find nearby pages on
 * Special:Nearby (defaults to 10km).
 */
$wgMFNearbyRange = 10000;

/**
 * Pages with smaller parsed HTML size are not cached
 * Set to 0 to cache everything or to some large value to disable caching completely
 */
$wgMFMinCachedPageSize = 64 * 1024;

/**
 * Set this to true to automatically show mobile view depending on people's user-agent.
 * WARNING: Make sure that your caching infrastructure is configured appropriately, to avoid
 * people receiving cached versions of pages intended for someone else's devices.
 */
$wgMFAutodetectMobileView = false;

/**
 * Controls whether site notices should be shown.
 */
$wgMFEnableSiteNotice = false;

/**
 * Controls whether tablets should be shown the mobile site. Works only if
 * $wgMFAutodetectMobileView is true.
 */
$wgMFShowMobileViewToTablets = false;

/**
 * (wiki)text to append to photo description during photo upload.
 */
$wgMFPhotoUploadAppendToDesc = '';

/**
 * Whether or not to enable the use of the X-Analytics HTTP response header
 *
 * This header is used for analytics purposes.
 * @see https://www.mediawiki.org/wiki/Analytics/Kraken/Data_Formats/X-Analytics
 * @var bool
 */
$wgMFEnableXAnalyticsLogging = false;

/**
 * Whether or not anonymous (not logged in) users should be able to edit.
 * Note this is highly experimental and comes without any warranty and may introduce bugs
 * until anonymous editing experience is addressed in this extension. Anonymous editing
 * on mobile is still a big unknown. See bug 53069.
 * Thoughts welcomed on https://www.mediawiki.org/wiki/Mobile_wikitext_editing#Anonymous_editing
 */
$wgMFAnonymousEditing = false;

/**
 * A css selector which is used by mf-photo.js to test whether to prompt the user photo uploads on
 * the current page. When the selector matches no elements the photo uploader will show.
 * This is an advanced config variable so use caution in editing.
 */
$wgMFLeadPhotoUploadCssSelector = 'img, .navbox';

/**
 * Enable CSS animations in all browsers that support them
 * @var bool
 */
$wgMFEnableCssAnimations = true;

/**
 * DB key of the category which members will never display mobile view
 */
$wgMFNoMobileCategory = false;

/**
 * Prefixed names of pages that will never display mobile view
 */
$wgMFNoMobilePages = array();

/**
 * Temporary boolean variable to enable/disable progress bars in the photo uploader
 * @var bool
 */
$wgMFAjaxUploadProgressSupport = true;

/**
 * Minimum available screen width at which a device can be considered a tablet/desktop
 */
$wgMFDeviceWidthTablet = 768;

/**
 * Devices with available screen of this value and less will have some styles
 * adapted for improved reading on small screens.
 */
$wgMFDeviceWidthMobileSmall = 280;

/**
 * Whether or not to use the KeepGoing feature
 * See https://www.mediawiki.org/wiki/Extension:MobileFrontend/KeepGoing
 */
$wgMFKeepGoing = false;

/**
 * Controls whether API action=mobileview should have every HTML section tidied for invalid markup
 */
$wgMFTidyMobileViewSections = true;

/**
 * Requests containing header with this name will be considered as coming from mobile devices.
 * The default value is for backwards compatibility.
 * Set to false to explicitly disable this way of detection.
 */
$wgMFMobileHeader = 'X-WAP';

/**
 * Controls whether the "Minerva as a desktop skin" beta feature is enabled
 */
$wgMFEnableMinervaBetaFeature = false;

/**
 * Controls whether the "Nearby pages" beta feature is enabled
 */
$wgMFEnableNearbyPagesBetaFeature = false;

/**
 * Controls whether to collapse sections by default.
 *
 * Leave at default true for "encyclopedia style", where the section 0 lead text will
 * always be visible and subsequent sections may be collapsed by default.
 *
 * Set to false for "dictionary style", sections are not collapsed.
 */
$wgMFCollapseSectionsByDefault = true;

/**
 * ID of the App to deep link to replacing the browser. Set 'false' to have no such link.
 * See https://developers.google.com/app-indexing/webmasters/details
 */
$wgMFAppPackageId = false;

/**
 * Scheme to use for the deep link. Per default, 'http' is used.
 */
$wgMFAppScheme = 'http';

/**
 * Controls, which page action show and which not. Allowed:
 * edit, talk, upload, watch
 */
$wgMFPageActions = array( 'edit', 'talk', 'upload', 'watch' );
