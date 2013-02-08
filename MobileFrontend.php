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
	'MobileFrontendHooks' => 'MobileFrontend.hooks',

	'DeviceDetection' => 'DeviceDetection',
	'HtmlFormatter' => 'HtmlFormatter',
	'MobileContext' => 'MobileContext',
	'MobileFormatter' => 'MobileFormatter',
	'WmlContext' => 'WmlContext',

	'ApiMobileView' => 'api/ApiMobileView',
	'ApiParseExtender' => 'api/ApiParseExtender',
	'ApiQueryExtracts' => 'api/ApiQueryExtracts',

	'MFResourceLoaderModule' => 'modules/MFResourceLoaderModule',

	'SpecialDonateImage' => 'specials/SpecialDonateImage',
	'SpecialMobileDiff' => 'specials/SpecialMobileDiff',
	'SpecialMobileFeedback' => 'specials/SpecialMobileFeedback',
	'SpecialMobileOptions' => 'specials/SpecialMobileOptions',
	'SpecialMobileMenu' => 'specials/SpecialMobileMenu',
	'SpecialMobileWatchlist' => 'specials/SpecialMobileWatchlist',
	'SpecialNearby' => 'specials/SpecialNearby',

	'SkinMobile' => 'skins/SkinMobile',
	'SkinMobileTemplate' => 'skins/SkinMobileTemplate',
	'SkinMobileBase' => 'skins/SkinMobileBase',
	'SkinMobileWML' => 'skins/SkinMobileWML',
	'SkinMobileTemplateWML' => 'skins/SkinMobileTemplateWML',
	'UserLoginAndCreateTemplate' => 'skins/UserLoginAndCreateTemplate',
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

$wgHooks['RequestContextCreateSkin'][] = 'MobileFrontendHooks::onRequestContextCreateSkin';
$wgHooks['SkinTemplateOutputPageBeforeExec'][] = 'MobileFrontendHooks::onSkinTemplateOutputPageBeforeExec';
$wgHooks['BeforePageRedirect'][] = 'MobileFrontendHooks::onBeforePageRedirect';
$wgHooks['ResourceLoaderTestModules'][] = 'MobileFrontendHooks::onResourceLoaderTestModules';
$wgHooks['GetCacheVaryCookies'][] = 'MobileFrontendHooks::onGetCacheVaryCookies';
$wgHooks['ResourceLoaderRegisterModules'][] = 'MobileFrontendHooks::onResourceLoaderRegisterModules';
$wgHooks['ResourceLoaderGetConfigVars'][] = 'MobileFrontendHooks::onResourceLoaderGetConfigVars';
$wgHooks['SpecialPage_initList'][] = 'MobileFrontendHooks::onSpecialPage_initList';
$wgHooks['ListDefinedTags'][] = 'MobileFrontendHooks::onListDefinedTags';
$wgHooks['RecentChange_save'][] = 'MobileFrontendHooks::onRecentChange_save';
$wgHooks['SpecialPageBeforeExecute'][] = 'MobileFrontendHooks::onSpecialPageBeforeExecute';
$wgHooks['UserLoginComplete'][] = 'MobileFrontendHooks::onUserLoginComplete';
$wgHooks['UserLoginForm'][] = 'MobileFrontendHooks::onUserLoginForm';
$wgHooks['UserCreateForm'][] = 'MobileFrontendHooks::onUserCreateForm';

$wgSpecialPages['DonateImage'] = 'SpecialDonateImage';
$wgSpecialPages['MobileDiff'] = 'SpecialMobileDiff';
$wgSpecialPages['MobileFeedback'] = 'SpecialMobileFeedback';
$wgSpecialPages['MobileOptions'] = 'SpecialMobileOptions';
$wgSpecialPages['MobileMenu'] = 'SpecialMobileMenu';

function efMobileFrontend_Setup() {
	global $wgExtMobileFrontend, $wgResourceModules, $wgMFSpecialModuleStubs,
		$wgMFNearby, $wgSpecialPages;

	$wgExtMobileFrontend = new ExtMobileFrontend( RequestContext::getMain() );

	if ( $wgMFNearby ) {
		$wgSpecialPages['Nearby'] = 'SpecialNearby';
	}
	/**
	 * dynamically load mobile special page resources
	 *
	 * It would be preferable to load these in the invocation of the ResourceLoaderRegisterModules hook,
	 * however there is an issue (still being diagnosed) that is preventing $resourceLoader->register()
	 * from loading modules at the bottom of a page. Also, we need at least some of these modules
	 * to be loaded in the production version of MobileFrontend, which does not currently fully support
	 * ResourceLoader - so the way the modules get included in the skin does not play nicely with the hook
	 * (since the hook runs after the modules need to be loaded in the skin).
	 * @see ExtMobileFrontend::generateMobileSpecialPageModules()
	 */
	$specialModules = ExtMobileFrontend::generateMobileSpecialPageModules( $wgMFSpecialModuleStubs );
	$wgResourceModules = array_merge( $wgResourceModules, $specialModules );
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
	$files[] = "$dir/SkinMobileTest.php";
	$files[] = "$dir/DeviceDetectionTest.php";
	$files[] = "$dir/HtmlFormatterTest.php";
	$files[] = "$dir/MobileFormatterTest.php";
	$files[] = "$dir/modules/MFResourceLoaderModuleTest.php";
	return true;
}

// ResourceLoader modules
$localBasePath = dirname( __FILE__ );
$remoteExtPath = 'MobileFrontend';

/**
 * A boilerplate containing common properties for all RL modules served to mobile site
 */
$wgMFMobileResourceBoilerplate = array(
	'raw' => true,
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'targets' => 'mobile',
);

// Filepages
$wgResourceModules['mobile.file.styles'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup' ),
	'styles' => array(
		'stylesheets/file/filepage.css',
	),
	'mobileTargets' => array(),
);

$wgResourceModules['mobile.file.scripts'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup' ),
	'scripts' => array(
		'javascripts/file/filepage.js'
	),
	'mobileTargets' => array(),
);

$wgResourceModules['mobile.styles'] = $wgMFMobileResourceBoilerplate + array(
	'styles' => array(
		'stylesheets/externals/reset.css',
		'stylesheets/common/mf-common.css',
		'stylesheets/common/mf-footer.css',
		'stylesheets/common/mf-typography.css',
		'stylesheets/common/mf-navigation.css',
		'stylesheets/modules/mf-search.css',
		'stylesheets/modules/mf-banner.css',
		'stylesheets/modules/mf-toggle.css',
		'stylesheets/common/mf-hacks.css',
		'stylesheets/modules/mf-cleanuptemplates.css',
		'stylesheets/common/mf-enwp.css'
	),
	'scripts' => array(
	),
	'position' => 'top',
	'mobileTargets' => array( 'stable', 'beta', 'alpha' ),
);

$wgResourceModules['mobile.startup'] = $wgMFMobileResourceBoilerplate + array(
	'styles' => array(
	),
	'scripts' => array(
		'javascripts/common/polyfills.js',
		'javascripts/common/modules.js',
		'javascripts/externals/hogan.js',
		'javascripts/common/eventemitter.js',
		'javascripts/common/mf-application.js',
		'javascripts/common/mf-history.js',
		'javascripts/common/mf-settings.js',
		'javascripts/modules/mf-banner.js',
		'javascripts/modules/mf-stop-mobile-redirect.js',
	),
	'position' => 'bottom',
	'mobileTargets' => array( 'stable', 'beta', 'alpha' ),
);

$wgResourceModules['mobile.beta.dependencies'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array(
		'mobile.stable',
	),
	'messages' => array(
		// mf-photo.js
		'mobile-frontend-photo-license' => array( 'parse' ),
	),
	'localBasePath' => $localBasePath,
	'class' => 'MFResourceLoaderModule',
	'mobileTargets' => array( 'beta', 'alpha' ),
);

$wgResourceModules['mobile.beta'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array(
		'mobile.stable',
		'mobile.beta.dependencies',
		'mediawiki.jqueryMsg',
	),
	'styles' => array(
		'stylesheets/modules/mf-photo.css',
	),
	'scripts' => array(
		'javascripts/common/mf-history-jquery.js',
		'javascripts/modules/mf-toggle-dynamic.js',
		'javascripts/modules/mf-search.js',
		'javascripts/modules/mf-languages.js',
		'javascripts/modules/mf-last-modified.js',
		'javascripts/modules/mf-photo.js',
	),
	'position' => 'bottom',
	'messages' => array(
		'pagetitle',
		'mobile-frontend-language-header',
		'mobile-frontend-last-modified-seconds',
		'mobile-frontend-last-modified-hours',
		'mobile-frontend-last-modified-minutes',
		'mobile-frontend-last-modified-hours',
		'mobile-frontend-last-modified-days',
		'mobile-frontend-last-modified-months',
		'mobile-frontend-last-modified-years',

		// for mf-toggle-dynamic.js
		'mobile-frontend-show-button',
		'mobile-frontend-hide-button',

		// mf-photo.js
		'mobile-frontend-photo-article-edit-comment',
		'mobile-frontend-photo-article-donate-comment',
		'mobile-frontend-photo-upload-error',
		'mobile-frontend-photo-upload-success-article',
		'mobile-frontend-photo-caption-placeholder',
		'mobile-frontend-image-loading',
		'mobile-frontend-image-uploading-wait',
		'mobile-frontend-image-uploading-long',
		'mobile-frontend-image-uploading-cancel',
		'mobile-frontend-photo-upload',
		'mobile-frontend-photo-upload-comment',
		'mobile-frontend-photo-submit',
		'mobile-frontend-photo-cancel',

		// for mf-languages.js
		'mobile-frontend-language-site-choose',
		'mobile-frontend-language-footer',

		// mf-history-jquery.js
		'mobile-frontend-ajax-page-loading',
		'mobile-frontend-ajax-page-error',

		// for mf-search.js
		'mobile-frontend-search-help',
		'mobile-frontend-search-noresults',
		'mobile-frontend-overlay-escape',
	),
	'mobileTargets' => array( 'beta', 'alpha' ),
);

$wgResourceModules['mobile.stable-only'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup' ),
	'messages' => array(
		// for mf-toggle.js
		'mobile-frontend-close-section',
		'mobile-frontend-show-button',
		'mobile-frontend-hide-button',

		// for mf-search.js
		'mobile-frontend-search-help',
		'mobile-frontend-search-noresults',
		'mobile-frontend-overlay-escape',
	),
	'styles' => array( 'stylesheets/modules/mf-toggle.css' ),
	'scripts' => array(
		'javascripts/modules/mf-toggle.js',
		'javascripts/modules/mf-search.js',
	),
	'mobileTargets' => array( 'stable' ),
);

$wgResourceModules['mobile.action.edit'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup' ),
	'messages' => array(
		// mf-edit.js
		'mobile-frontend-page-saving',
	),
	'styles' => array(
		'stylesheets/actions/mf-edit.css',
	),
	'scripts' => array(
		'javascripts/actions/mf-edit.js',
	),
	'mobileTargets' => array(),
);

$wgResourceModules['mobile.action.history'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup' ),
	'styles' => array(
	),
	'scripts' => array(
		'stylesheets/actions/mf-history.css',
	),
	'mobileTargets' => array(),
);

$wgResourceModules['mobile.alpha'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup' ),
	'messages' => array(
		// for mf-random.js
		'mobile-frontend-ajax-random-heading',
		'mobile-frontend-ajax-random-quote',
		'mobile-frontend-ajax-random-quote-author',
		'mobile-frontend-ajax-random-question',
		'mobile-frontend-ajax-random-yes',
		'mobile-frontend-ajax-random-retry',
		'mobile-frontend-ajax-random-suggestions',

		// for mf-table.js
		'mobile-frontend-table',
	),
	'styles' => array(
		'stylesheets/modules/mf-random.css',
		'stylesheets/modules/mf-tables.css',
	),
	'scripts' => array(
		'javascripts/modules/mf-random.js',
		'javascripts/modules/mf-tables.js',
		'javascripts/modules/mf-inline-style-scrubber.js',
	),
	'mobileTargets' => array( 'alpha' ),
);

$wgResourceModules['mobile.stable'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup' ),
	'styles' => array(
		'stylesheets/modules/mf-references.css',
		'stylesheets/modules/mf-cleanuptemplates.css',
		'stylesheets/modules/mf-watchlist.css',
	),
	'scripts' => array(
		'javascripts/externals/hogan.js',
		'javascripts/common/mf-oop.js',
		'javascripts/common/mf-api.js',
		'javascripts/common/mf-view.js',
		'javascripts/widgets/progress-bar.js',
		'javascripts/common/mf-navigation.js',
		'javascripts/common/mf-notification.js', 'javascripts/modules/mf-homepage.js',
		'javascripts/modules/mf-cleanuptemplates.js',
		'javascripts/modules/mf-watchlist.js',
		'javascripts/modules/mf-references.js'
	),
	'messages' => array(
		// mf-cleanuptemplates.js
		'mobile-frontend-meta-data-issues',
		'mobile-frontend-meta-data-issues-header',

		// mf-notification.js
		'mobile-frontend-drawer-cancel',
		'mobile-frontend-logged-in-toast-notification',

		// mf-watchlist.js
		'mobile-frontend-watchlist-add',
		'mobile-frontend-watchlist-removed',
		'mobile-frontend-watchlist-cta',
		'mobile-frontend-watchlist-cta-button-signup',
		'mobile-frontend-watchlist-cta-button-login',
	),
	'mobileTargets' => array( 'stable', 'beta', 'alpha' ),
);

$wgResourceModules['mobile.site'] = array(
	'dependencies' => array( 'mobile.startup' ),
	'class' => 'MobileFrontendSiteModule',
	'targets' => 'mobile',
	'mobileTargets' => array( 'stable', 'beta', 'alpha' ),
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
  * Stubs for mobile SpecialPage resource modules
  *
  * The modules themselves get generated dynamically later
  * during the invocation of the ResourceLoaderRegisterModules hook.
  * @see ExtMobileFrontend::registerMobileSpecialPageModules()
  */
$wgMFSpecialModuleStubs = array(
	'mobilediff' => array( 'alias' => 'watchlist' ),
	'mobilefeedback' => array( 'css' => true ),
	'mobileoptions' => array( 'css' => true, 'js' => true ),
	'nearby' => array( 'js' => true,
		'messages' => array(
			'mobile-frontend-nearby-error',
			'mobile-frontend-nearby-refresh',
			'mobile-frontend-nearby-title',
			'mobile-frontend-nearby-loading',
			'mobile-frontend-nearby-distance-report',
			'mobile-frontend-nearby-lookup-error',
			'mobile-frontend-nearby-noresults',
		),
	),
	'search' => array( 'css' => true ),
	'watchlist' => array( 'css' => true, 'js' => true,
		'dependencies' => array( 'mobile.stable' ),
	),
	'userlogin' => array( 'css' => true ),
	// FIXME: temporary hack to get round CentralNotice logout screen
	'userlogout' => array( 'alias' => 'userlogin' ),
	'donateimage' => array( 'js' => true,
		'css' => true,
		'messages' => array(
			'mobile-frontend-photo-upload-generic',
			'mobile-frontend-donate-photo-upload-success',
			'mobile-frontend-donate-photo-first-upload-success',
			'mobile-frontend-donate-image-summary',
			'mobile-frontend-listed-image-no-description',
		),
		'dependencies' => array(
			'mobile.beta',
		),
	),
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
 * The wiki id/dbname for where photos are uploaded, if photos are uploaded to
 * a wiki other than the local wiki (eg commonswiki).
 * @var string
 */
$wgMFPhotoUploadWiki = null;

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

/**
 * @var ExtMobileFrontend $wgExtMobileFrontend
 */
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
 * Pages with smaller parsed HTML size are not cached
 * Set to 0 to cache everything or to some large value to disable caching completely
 */
$wgMFMinCachedPageSize = 64 * 1024;
