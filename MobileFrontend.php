<?php
/**
 * Extension MobileFrontend — Mobile Frontend
 *
 * @file
 * @ingroup Extensions
 * @author Patrick Reilly
 * @copyright © 2011 Patrick Reilly
 * @licence GNU General Public Licence 2.0 or later
 */

// Needs to be called within MediaWiki; not standalone
if ( !defined( 'MEDIAWIKI' ) ) {
	echo( "This is an extension to the MediaWiki package and cannot be run standalone.\n" );
	die( -1 );
}

// Define the extension; allows us make sure the extension is used correctly
define( 'MOBILEFRONTEND', 'MobileFrontend' );

// Extension credits that will show up on Special:Version
$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'MobileFrontend',
	'author' => array( 'Patrick Reilly', 'Max Semenik', 'Jon Robson', 'Arthur Richards', 'Brion Vibber', 'Juliusz Gonera', 'Ryan Kaldari' ),
	'descriptionmsg' => 'mobile-frontend-desc',
	'url' => 'https://www.mediawiki.org/wiki/Extension:MobileFrontend',
);

$cwd = dirname( __FILE__ );
$wgExtensionMessagesFiles['MobileFrontend'] = "$cwd/MobileFrontend.i18n.php";
$wgExtensionMessagesFiles['MobileFrontendAlias'] = "$cwd/MobileFrontend.alias.php";

// autoload extension classes
$autoloadClasses = array (
	'ExtMobileFrontend' => 'MobileFrontend.body',
	'MobileFrontendHooks' => 'MobileFrontend.hooks',

	'DeviceDetection' => 'DeviceDetection',
	'HtmlDeviceProperties' => 'DeviceDetection',
	'MobileContext' => 'MobileContext',
	'WmlContext' => 'WmlContext',
	'WmlDeviceProperties' => 'DeviceDetection',

	'ExtractFormatter' => 'formatters/ExtractFormatter',
	'HtmlFormatter' => 'formatters/HtmlFormatter',
	'MobileFormatter' => 'formatters/MobileFormatter',
	'MobileFormatterHTML' => 'formatters/MobileFormatterHTML',
	'MobileFormatterWML' => 'formatters/MobileFormatterWML',

	'ApiMobileView' => 'api/ApiMobileView',
	'ApiParseExtender' => 'api/ApiParseExtender',
	'ApiQueryExtracts' => 'api/ApiQueryExtracts',

	'MFResourceLoaderModule' => 'modules/MFResourceLoaderModule',
	'MobileSiteModule' => 'modules/MobileSiteModule',

	'SpecialUploads' => 'specials/SpecialUploads',
	'SpecialMobileUserlogin' => 'specials/SpecialMobileUserlogin',
	'SpecialMobileDiff' => 'specials/SpecialMobileDiff',
	'SpecialMobileOptions' => 'specials/SpecialMobileOptions',
	'SpecialMobileMenu' => 'specials/SpecialMobileMenu',
	'SpecialMobileWatchlist' => 'specials/SpecialMobileWatchlist',
	'SpecialNearby' => 'specials/SpecialNearby',
	'SpecialMobileNotifications' => 'specials/SpecialMobileNotifications',
	'MobileSpecialPage' => 'specials/MobileSpecialPage',

	'MinervaTemplate' => 'skins/MinervaTemplate',
	'MobileTemplate' => 'skins/MobileTemplate',
	'MobileTemplateBeta' => 'skins/MobileTemplateBeta',
	'MobileTemplateAlpha' => 'skins/MobileTemplateAlpha',
	'MobileTemplateWML' => 'skins/MobileTemplateWML',
	'SkinMinerva' => 'skins/SkinMinerva',
	'SkinMobile' => 'skins/SkinMobile',
	'SkinMobileBeta' => 'skins/SkinMobileBeta',
	'SkinMobileAlpha' => 'skins/SkinMobileAlpha',
	'SkinMobileWML' => 'skins/SkinMobileWML',
	'UserLoginAndCreateTemplate' => 'skins/UserLoginAndCreateTemplate',
	'UserLoginMobileTemplate' => 'skins/UserLoginMobileTemplate',
	'UserAccountCreateMobileTemplate' => 'skins/UserAccountCreateMobileTemplate',
);

foreach ( $autoloadClasses as $className => $classFilename ) {
	$wgAutoloadClasses[$className] = "$cwd/includes/$classFilename.php";
}

$wgExtensionFunctions[] = 'efMobileFrontend_Setup';

$wgAPIPropModules['extracts'] = 'ApiQueryExtracts';
$wgAPIModules['mobileview'] = 'ApiMobileView';

$wgHooks['APIGetAllowedParams'][] = 'ApiParseExtender::onAPIGetAllowedParams';
$wgHooks['APIAfterExecute'][] = 'ApiParseExtender::onAPIAfterExecute';
$wgHooks['APIGetParamDescription'][] = 'ApiParseExtender::onAPIGetParamDescription';
$wgHooks['APIGetDescription'][] = 'ApiParseExtender::onAPIGetDescription';
$wgHooks['OpenSearchXml'][] = 'ApiQueryExtracts::onOpenSearchXml';

$wgHooks['LinksUpdate'][] = 'MobileFrontendHooks::onLinksUpdate';

$wgHooks['RequestContextCreateSkin'][] = 'MobileFrontendHooks::onRequestContextCreateSkin';
$wgHooks['SkinTemplateOutputPageBeforeExec'][] = 'MobileFrontendHooks::onSkinTemplateOutputPageBeforeExec';
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
$wgHooks['Gadgets::allowLegacy'][] = 'MobileFrontendHooks::onAllowLegacyGadgets';
$wgHooks['UnitTestsList'][] = 'MobileFrontendHooks::onUnitTestsList';
$wgHooks['CentralAuthLoginRedirectData'][] = 'MobileFrontendHooks::onCentralAuthLoginRedirectData';
$wgHooks['CentralAuthSilentLoginRedirect'][] = 'MobileFrontendHooks::onCentralAuthSilentLoginRedirect';
$wgHooks['UserRequiresHTTPS'][] = 'MobileFrontendHooks::onUserRequiresHTTPS';

$wgSpecialPages['MobileDiff'] = 'SpecialMobileDiff';
$wgSpecialPages['MobileOptions'] = 'SpecialMobileOptions';
$wgSpecialPages['MobileMenu'] = 'SpecialMobileMenu';

function efMobileFrontend_Setup() {
	global $wgMFNearby, $wgSpecialPages, $wgSpecialPageGroups;

	if ( $wgMFNearby ) {
		$wgSpecialPages['Nearby'] = 'SpecialNearby';
		$wgSpecialPageGroups['Nearby'] = 'pages';
	}
}

// ResourceLoader modules
require_once( "$cwd/includes/Resources.php" );

unset( $cwd );

/**
 * Begin configuration variables
 */

/**
 * The default skin for MobileFrontend
 * Defaults to MobileSkin
 */
$wgMFDefaultSkinClass = 'SkinMobile';

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
 * Namespace(s) where Special:Nearby should search. Should be one or more of NS_* constants, pipe-separated
 * @var int|string
 */
$wgMFNearbyNamespace = NS_MAIN;

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
 * See $itemsToRemove for more information.
 */
$wgMFRemovableClasses = array();

/**
 * Make the logos configurable.
 *
 * 'logo' is the principle logo for your site, 'copyright' is the copyright
 * logo to be used in the footer of your site.
 *
 * Example: array(
 * 	'logo' => 'mysite_logo.png',
 *	'copyright' => 'mysite_copyright_logo.png',
 * 	);
 */
$wgMFCustomLogos = array();

/**
 * Whether this extension should provide its extracts to OpenSearchXml extension
 */
$wgMFExtendOpenSearchXml = false;

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
 * Will force login-related links to use https if set to true, otherwise
 * login-related links will use whatever protocol is in use by the user
 */
$wgMFForceSecureLogin = false;

/**
 * Whether geodata related functionality should be enabled
 *
 * Defaults to false.
 */
$wgMFNearby = false;

/**
 * The range in meters that should be searched to find nearby pages on Special:Nearby (defaults to 10km)
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
 * Whether or not to show the upload CTA to logged out users.
 * Note there are a couple of exceptions:
 * it will show on page visits that come from the nearby page
 * it will be overriden in beta and alpha modes of the site
 */
$wgMFEnablePhotoUploadCTA = true;

/**
 * (wiki)text to append to photo description during photo upload.
 */
$wgMFPhotoUploadAppendToDesc = '';

/**
 * Whether or not to display site notices
 * @var bool
 */
$wgMFEnableSiteNotice = false;

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
