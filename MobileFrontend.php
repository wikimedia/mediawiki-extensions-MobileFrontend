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
	'version' => '0.7.0',
	'author' => '[http://www.mediawiki.org/wiki/User:Preilly Preilly]',
	'descriptionmsg' => 'mobile-frontend-desc',
	'url' => 'https://www.mediawiki.org/wiki/Extension:MobileFrontend',
);

$cwd = dirname( __FILE__ );
$wgExtensionMessagesFiles['MobileFrontend'] = "$cwd/MobileFrontend.i18n.php";

// autoload extension classes

$autoloadClasses = array (
	'ExtMobileFrontend' => 'MobileFrontend.body',

	'CssDetection' => 'CssDetection',
	'DeviceDetection' => 'DeviceDetection',
	'HtmlFormatter' => 'HtmlFormatter',
	'MobileFormatter' => 'MobileFormatter',
	'WmlContext' => 'WmlContext',

	'ApiMobileView' => 'api/ApiMobileView',
	'ApiParseExtender' => 'api/ApiParseExtender',
	'ApiQueryExtracts' => 'api/ApiQueryExtracts',

	'MobileFrontendTemplate' => 'templates/MobileFrontendTemplate',
	'ApplicationTemplate' => 'templates/ApplicationTemplate',
	'SearchTemplate'  => 'templates/SearchTemplate',
	'FooterTemplate' => 'templates/FooterTemplate',
	'LeaveFeedbackTemplate' => 'templates/LeaveFeedbackTemplate',
	'DisableTemplate' => 'templates/DisableTemplate',
	'OptInTemplate' => 'templates/OptInTemplate',
	'OptOutTemplate' => 'templates/OptOutTemplate',
	'ApplicationWmlTemplate' => 'templates/ApplicationWmlTemplate',
	'ThanksNoticeTemplate' => 'templates/ThanksNoticeTemplate',
	'SopaNoticeTemplate' => 'templates/SopaNoticeTemplate',
	'SkinMobile' => 'skins/SkinMobile',
);

foreach ( $autoloadClasses as $className => $classFilename ) {
	$wgAutoloadClasses[$className] = "$cwd/$classFilename.php";
}

/**
 * Path to the logo used in the mobile view
 *
 * Should be 22px tall at most
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
$wgMobileFrontendFormatCookieExpiry;

/**
 * URL for script used to disable mobile site
 * (protocol, host, optional port; path portion)
 *
 * e.g., http://en.wikipedia.org/w/mobileRedirect.php
 */
$wgMobileRedirectFormAction = false;

/**
 * A string to mark the particular version of a Javascript or CSS resource
 * 
 * This is useful to update in order to force invalidation of certain caches
 * when new versions of this software gets deployed, as this string gets
 * appended to the query string in the request for resources, which will
 * invalidate caches dependent on URLs.
 *
 * This is entirely optional.
 */
$wgMobileResourceVersion;

$wgExtMobileFrontend = null;

/**
 * Set properties in ExtMobileFrontend to arbitrary values
 * CAUTION: this should not be used in production environments
 *
 * This array can consist of key => value pairs, mapping to 
 * '<property_name>' => <property_value>
 * Any properties you try to set that do not exist in ExtMobileFrontend will
 * be ignored.
 */
$wgMFConfigProperties = array();

$wgExtensionFunctions[] = 'efMobileFrontend_Setup';

$wgAPIPropModules['extracts'] = 'ApiQueryExtracts';
$wgAPIModules['mobileview'] = 'ApiMobileView';

$wgHooks['APIGetAllowedParams'][] = 'ApiParseExtender::onAPIGetAllowedParams';
$wgHooks['APIAfterExecute'][] = 'ApiParseExtender::onAPIAfterExecute';
$wgHooks['APIGetParamDescription'][] = 'ApiParseExtender::onAPIGetParamDescription';
$wgHooks['APIGetDescription'][] = 'ApiParseExtender::onAPIGetDescription';
$wgHooks['OpenSearchXml'][] = 'ApiQueryExtracts::onOpenSearchXml';


function efMobileFrontend_Setup() {
	global $wgExtMobileFrontend, $wgHooks;
	$wgExtMobileFrontend = new ExtMobileFrontend();
	$wgHooks['RequestContextCreateSkin'][] = array( &$wgExtMobileFrontend, 'requestContextCreateSkin' );
	$wgHooks['BeforePageRedirect'][] = array( &$wgExtMobileFrontend, 'beforePageRedirect' );
	$wgHooks['SkinTemplateOutputPageBeforeExec'][] = array( &$wgExtMobileFrontend, 'addMobileFooter' );
	$wgHooks['TestCanonicalRedirect'][] = array( &$wgExtMobileFrontend, 'testCanonicalRedirect' );
	$wgHooks['ResourceLoaderTestModules'][] = array( &$wgExtMobileFrontend, 'addTestModules' );
	$wgHooks['GetCacheVaryCookies'][] = array( &$wgExtMobileFrontend, 'getCacheVaryCookies' );
}

/**
 * Make the classes, tags and ids stripped from page content configurable.
 * Each item will be stripped from the page.
 * See $itemsToRemove for more information.
 */
$wgMFRemovableClasses = array();

/**
 * Make the logos configurable.
 * Key for site.
 * Key for logo.
 * Example: array('site' => 'mysite', 'logo' => 'mysite_logo.png');
 */
$wgMFCustomLogos = array();

// Unit tests
$wgHooks['UnitTestsList'][] = 'efExtMobileFrontendUnitTests';

/**
 * @param $files array
 * @return bool
 */
function efExtMobileFrontendUnitTests( &$files ) {
	$dir = dirname( __FILE__ ) . '/tests';
	$files[] = "$dir/MobileFrontendTest.php";
	$files[] = "$dir/DeviceDetectionTest.php";
	$files[] = "$dir/HtmlFormatterTest.php";
	$files[] = "$dir/MobileFormatterTest.php";
	return true;
}

/**
 * Whether this extension should provide its extracts to OpenSearchXml extension
 */
$wgMFExtendOpenSearchXml = false;

// enable ResourceLoader for css
$wgResourceModules['ext.mobileFrontend'] = array(
	'styles' => array( 'stylesheets/common.css' ),
	'localBasePath' => dirname( __FILE__ ),
	'remoteExtPath' => 'MobileFrontend',
);
$wgResourceModules['ext.mobileFrontendBeta'] = array(
	'styles' => 'stylesheets/beta_common.css',
	'localBasePath' => dirname( __FILE__ ),
	'remoteExtPath' => 'MobileFrontend',
);
