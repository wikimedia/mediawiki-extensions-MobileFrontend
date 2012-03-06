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
// WURFL installation dir
define( 'WURFL_DIR', dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'library' .
		DIRECTORY_SEPARATOR . 'WURFL' . DIRECTORY_SEPARATOR );
// WURFL configuration files directory
define( 'RESOURCES_DIR', dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'library' .
		DIRECTORY_SEPARATOR . 'resources' . DIRECTORY_SEPARATOR );

require_once( WURFL_DIR . 'Application.php' );

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
	'MobileFormatter' => 'MobileFormatter',
	'WmlContext' => 'WmlContext',

	'ApiParseExtender' => 'api/ApiParseExtender',
	'ApiQueryExcerpts' => 'api/ApiQueryExcerpts',

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
 * URL for script used to disable mobile site
 * (protocol, host, optional port; path portion)
 *
 * e.g., http://en.wikipedia.org/w/mobileRedirect.php
 */
$wgMobileRedirectFormAction = false;

$wgExtMobileFrontend = null;

$wgExtensionFunctions[] = 'efMobileFrontend_Setup';

$wgAPIPropModules['excerpts'] = 'ApiQueryExcerpts';

$wgHooks['APIGetAllowedParams'][] = 'ApiParseExtender::onAPIGetAllowedParams';
$wgHooks['APIAfterExecute'][] = 'ApiParseExtender::onAPIAfterExecute';
$wgHooks['APIGetParamDescription'][] = 'ApiParseExtender::onAPIGetParamDescription';
$wgHooks['APIGetDescription'][] = 'ApiParseExtender::onAPIGetDescription';

function efMobileFrontend_Setup() {
	global $wgExtMobileFrontend, $wgHooks;
	$wgExtMobileFrontend = new ExtMobileFrontend();
	$wgHooks['BeforePageDisplay'][] = array( &$wgExtMobileFrontend, 'beforePageDisplayHTML' );
	$wgHooks['BeforePageRedirect'][] = array( &$wgExtMobileFrontend, 'beforePageRedirect' );
	$wgHooks['SkinTemplateOutputPageBeforeExec'][] = array( &$wgExtMobileFrontend, 'addMobileFooter' );
	$wgHooks['TestCanonicalRedirect'][] = array( &$wgExtMobileFrontend, 'testCanonicalRedirect' );
	$wgHooks['ResourceLoaderTestModules'][] = array( &$wgExtMobileFrontend, 'addTestModules' );
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
$wgMFCustomLogos = array( array() );

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
	$files[] = "$dir/MobileFormatterTest.php";
	return true;
}
