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
	'author' => array( 'Patrick Reilly', 'Max Semenik', 'Jon Robson', 'Arthur Richards' ),
	'descriptionmsg' => 'mobile-frontend-desc',
	'url' => 'https://www.mediawiki.org/wiki/Extension:MobileFrontend',
);

$cwd = dirname( __FILE__ );
$wgExtensionMessagesFiles['MobileFrontend'] = "$cwd/MobileFrontend.i18n.php";
$wgExtensionMessagesFiles['MobileFrontendAlias'] = "$cwd/MobileFrontend.alias.php";

// autoload extension classes

$autoloadClasses = array (
	'ExtMobileFrontend' => 'MobileFrontend.body',
	'MobileFrontendSiteModule' => 'MobileFrontend.body',

	'DeviceDetection' => 'DeviceDetection',
	'HtmlFormatter' => 'HtmlFormatter',
	'MobileContext' => 'MobileContext',
	'MobileFormatter' => 'MobileFormatter',
	'WmlContext' => 'WmlContext',

	'ApiMobileView' => 'api/ApiMobileView',
	'ApiParseExtender' => 'api/ApiParseExtender',
	'ApiQueryExtracts' => 'api/ApiQueryExtracts',

	'SpecialDonateImage' => 'specials/SpecialDonateImage',
	'SpecialMobileDiff' => 'specials/SpecialMobileDiff',
	'SpecialMobileFeedback' => 'specials/SpecialMobileFeedback',
	'SpecialMobileOptions' => 'specials/SpecialMobileOptions',
	'SpecialMobileMenu' => 'specials/SpecialMobileMenu',
	'SpecialMobileWatchlist' => 'specials/SpecialMobileWatchlist',

	'SkinMobile' => 'skins/SkinMobile',
	'SkinMobileTemplate' => 'skins/SkinMobileTemplate',
	'SkinMobileBase' => 'skins/SkinMobileBase',
	'SkinMobileWML' => 'skins/SkinMobileWML',
	'SkinMobileTemplateWML' => 'skins/SkinMobileTemplateWML',
	'OverloadTemplate' => 'skins/OverloadTemplate',
	'UserLoginMobileTemplate' => 'skins/UserLoginMobileTemplate',
	'UserAccountCreateMobileTemplate' => 'skins/UserAccountCreateMobileTemplate',

	'MFCompatCheck' => 'MFCompatCheck',
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

$wgSpecialPages['DonateImage'] = 'SpecialDonateImage';
$wgSpecialPages['MobileDiff'] = 'SpecialMobileDiff';
$wgSpecialPages['MobileFeedback'] = 'SpecialMobileFeedback';
$wgSpecialPages['MobileOptions'] = 'SpecialMobileOptions';
$wgSpecialPages['MobileMenu'] = 'SpecialMobileMenu';

function efMobileFrontend_Setup() {
	global $wgExtMobileFrontend, $wgMFEnableResourceLoader, $wgResourceModules;

	$wgExtMobileFrontend = new ExtMobileFrontend( RequestContext::getMain() );
	$wgExtMobileFrontend->attachHooks();

	// in absence of ResourceLoader add additional styles
	if ( !$wgMFEnableResourceLoader ) {
		$wgResourceModules['mobile.beta']['styles'][] = 'stylesheets/specials/watchlist.css';
	}
}

// Unit tests
$wgHooks['UnitTestsList'][] = 'efExtMobileFrontendUnitTests';

/**
 * @param $files array
 * @return bool
 */
function efExtMobileFrontendUnitTests( &$files ) {
	$dir = dirname( __FILE__ ) . '/tests';
	$files[] = "$dir/ApiParseExtenderTest.php";
	$files[] = "$dir/MobileContextTest.php";
	$files[] = "$dir/MobileFrontendTest.php";
	$files[] = "$dir/DeviceDetectionTest.php";
	$files[] = "$dir/HtmlFormatterTest.php";
	$files[] = "$dir/MobileFormatterTest.php";
	return true;
}

// ResourceLoader modules
$localBasePath = dirname( __FILE__ );
$remoteExtPath = 'MobileFrontend';

$wgResourceModules['mobile.head'] = array(
	'styles' => array(),
	'scripts' => array( 'javascripts/common/main.js' ),
	'raw' => true,
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'targets' => 'mobile',
);

$wgResourceModules['mobile.jqueryshim'] = array(
	'styles' => array(),
	'scripts' => array( 'javascripts/common/jquery-shim.js' ),
	'raw' => true,
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'targets' => 'mobile',
);

$wgResourceModules['mobile'] = array(
	'styles' => array( 'stylesheets/common/reset.css', 'stylesheets/common/mf-common.css', 'stylesheets/common/mf-footer.css',
		'stylesheets/common/mf-typography.css', 'stylesheets/common/mf-navigation.css',
		'stylesheets/modules/mf-search.css',
		'stylesheets/specials/contact-us.css', 'stylesheets/modules/mf-banner.css',
		'stylesheets/specials/mf-settings.css',
		'stylesheets/specials/mf-login.css',
		'stylesheets/modules/mf-toggle.css',
		'stylesheets/common/mf-hacks.css',
		'stylesheets/modules/mf-cleanuptemplates.css',
		'stylesheets/common/mf-enwp.css' ),
	'scripts' => array( 'javascripts/common/mf-application.js',
		'javascripts/common/mf-history.js',
		'javascripts/common/mf-settings.js', 'javascripts/modules/mf-search.js',
		'javascripts/modules/mf-banner.js' ),
	'raw' => true,
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'targets' => 'mobile',
);

$wgResourceModules['mobile.beta.jquery'] = array(
	'styles' => array(
		'stylesheets/modules/mf-watchlist.css',
		'stylesheets/modules/mf-photo.css',
	),
	'scripts' => array(
		'javascripts/modules/mf-toggle-dynamic.js',
		'javascripts/modules/mf-photo.js',
		'javascripts/actions/mf-edit.js', // FIXME: only serve when action=edit
		'javascripts/modules/mf-watchlist.js', 'javascripts/modules/mf-languages.js' ),
	'raw' => true,
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'targets' => 'mobile',
	'position' => 'bottom',
);

$wgResourceModules['mobile.beta.jquery.eventlog'] = array(
	'scripts' => array( 'javascripts/externals/eventlog.js' ),
	'raw' => true,
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'targets' => 'mobile',
);

$wgResourceModules['mobile.production-only'] = array(
	'styles' => array( 'stylesheets/modules/mf-toggle.css' ),
	'scripts' => array( 'javascripts/modules/mf-toggle.js' ),
	'raw' => true,
	'localBasePath' => dirname( __FILE__ ),
	'remoteExtPath' => 'MobileFrontend',
	'targets' => 'mobile',
);

$wgResourceModules['mobile.beta'] = $wgResourceModules['mobile'];

$wgResourceModules['mobile.beta']['styles'][] = 'stylesheets/actions/mf-edit.css'; // FIXME: only serve me when action=edit
$wgResourceModules['mobile.beta']['styles'][] = 'stylesheets/actions/mf-history.css'; // FIXME: only serve me when action=edit

$wgResourceModules['mobile.alpha'] = array(
	'styles' => array(
		'stylesheets/modules/mf-random.css',
		'stylesheets/modules/mf-tables.css',
	),
	'scripts' => array(
		'javascripts/modules/mf-random.js',
		'javascripts/modules/mf-tables.js',
		'javascripts/modules/mf-user-gallery.js',
	),
	'raw' => true,
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'targets' => 'mobile',
);

$wgResourceModules['mobile.filePage'] = array(
	'styles' => array( 'stylesheets/specials/filepage.css' ),
	'scripts' => array( 'javascripts/specials/filepage.js' ),
	'raw' => true,
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'targets' => 'mobile',
);
$wgResourceModules['mobile.production-jquery'] = array(
	'styles' => array(
		'stylesheets/modules/mf-references.css',
		'stylesheets/modules/mf-cleanuptemplates.css',
	),
	'scripts' => array(
		'javascripts/common/mf-navigation.js',
		'javascripts/common/mf-notification.js', 'javascripts/modules/mf-homepage.js',
		'javascripts/modules/mf-cleanuptemplates.js',
		'javascripts/modules/mf-references.js' ),
	'raw' => true,
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'targets' => 'mobile',
);
$wgResourceModules['mobile.watchlist'] = array(
	'styles' => array( 'stylesheets/specials/watchlist.css' ),
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'targets' => 'mobile',
	'position' => 'top',
);

$wgResourceModules['mobile.site'] = array(
	'class' => 'MobileFrontendSiteModule',
	'targets' => 'mobile',
);

// Resources to be loaded on desktop version of site
$wgResourceModules['mobile.desktop'] = array(
	'scripts' => array( 'javascripts/desktop/unset_stopmobileredirect.js' ),
	'dependencies' => array( 'jquery.cookie' ),
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'targets' => 'desktop',
);

/**
 * Begin configuration variables
 */

/**
 * An api to which any photos should be uploaded
 * e.g. $wgMFPhotoUploadEndpoint = 'http://commons.wikimedia.org/w/api.php';
 * Defaults to the current wiki
 */
$wgMFPhotoUploadEndpoint = '';

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
$wgMobileFrontendFormatCookieExpiry = null;

/**
 * When set to true, the feedback form will post to a remote wiki, which
 * must also be configured.
 * @param bool
 */
$wgMFRemotePostFeedback = false;
$wgMFRemotePostFeedbackUrl = null;
$wgMFRemotePostFeedbackUsername = null;
$wgMFRemotePostFeedbackPassword = null;
$wgMFRemotePostFeedbackArticle = null;

/**
 * Configure the href links for the various links that appear on the
 * MobileFrontend feedback form.
 *
 * These can be any value that you can use as an href value in <a href="">,
 * eg "GeneralFeedback", "http://mysite.com/wiki/GeneralFeedback",
 *   "mailto:someone@example.com"
 *
 * Leaving a value empty will default to a value of '#'
 *
 * Alternatively, you can invoke the 'MobileFrontendOverrideFeedbackLinks' hook
 * rather than just set this var in your LocalSettings. This is really useful
 * if you have more complicated/variable needs for setting up this configuration
 * var that you might not want running on every single page load.
 */
$wgMFFeedbackLinks = array(
	'General' => '', // General feedback
	'ArticlePersonal' => '', // Regarding me, a person, or a company I work for
	'ArticleFactual' => '', // Regarding a factual error
	'ArticleOther' => '', // Regarding another problem
);

$wgExtMobileFrontend = null;

/**
 * A fallback URL for a 'contact us' page if one cannot be dynamically
 * determined for the project (using wfMessage( 'contact-us' )). This is only
 * used in non-beta mode.
 */
$wgMFFeedbackFallbackURL = '#';

/**
 * Whether or not to display sections other than 'Technical feedback' on feedback page
 * @param bool
 */
$wgMFDisplayNonTechnicalFeedback = false;

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
 * Which pages should be included in mobile.site
 */
$wgMobileSiteResourceLoaderModule = array(
	'MediaWiki:Mobile.css' => array( 'type' => 'style' ),
	'MediaWiki:Mobile.js' => array( 'type' => 'script' ),
);

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
 * Log events to a (currently Wikimedia-specific) logging endpoint in beta mode.
 * When off, events will still log to local console.
 *
 * Defaults to false.
 */
$wgMFLogEvents = false;


/**
 * Whether to use ResourceLoader, filtered to mobile target.
 * If not, old method of loading will be used for all scripts.
 */
$wgMFEnableResourceLoader = true;

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
