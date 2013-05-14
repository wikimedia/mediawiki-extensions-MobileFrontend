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
	'MobileFrontendDeviceDetectModule' => 'MobileFrontend.body',
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
	'MobileSiteModule' => 'modules/MobileSiteModule',
	'MobileDeviceDetectModule' => 'modules/MobileDeviceDetectModule',

	'SpecialUploads' => 'specials/SpecialUploads',
	'SpecialMobileDiff' => 'specials/SpecialMobileDiff',
	'SpecialMobileOptions' => 'specials/SpecialMobileOptions',
	'SpecialMobileMenu' => 'specials/SpecialMobileMenu',
	'SpecialMobileWatchlist' => 'specials/SpecialMobileWatchlist',
	'SpecialNearby' => 'specials/SpecialNearby',
	'UnlistedSpecialMobilePage' => 'specials/UnlistedSpecialMobilePage',
	'SpecialLoginHandshake' => 'specials/SpecialLoginHandshake',

	'SkinMinerva' => 'skins/SkinMinerva',
	'MinervaTemplate' => 'skins/MinervaTemplate',
	'SkinMobile' => 'skins/SkinMobile',
	'SkinMobileTemplate' => 'skins/SkinMobileTemplate',
	'SkinMobileBase' => 'skins/SkinMobileBase',
	'SkinMobileWML' => 'skins/SkinMobileWML',
	'SkinMobileTemplateWML' => 'skins/SkinMobileTemplateWML',
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

$wgHooks['MakeGlobalVariablesScript'][] = 'MobileFrontendHooks::onMakeGlobalVariablesScript';
$wgHooks['EnableMobileModules'][] = 'MobileFrontendHooks::onEnableMobileModules';
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
$wgHooks['BeforePageDisplay'][] = 'MobileFrontendHooks::onBeforePageDisplay';
$wgHooks['CustomEditor'][] = 'MobileFrontendHooks::onCustomEditor';
$wgHooks['GetPreferences'][] = 'MobileFrontendHooks::onGetPreferences';
$wgHooks['Gadgets::allowLegacy'][] = 'MobileFrontendHooks::onAllowLegacyGadgets';

$wgSpecialPages['Uploads'] = 'SpecialUploads';
$wgSpecialPages['MobileDiff'] = 'SpecialMobileDiff';
$wgSpecialPages['MobileOptions'] = 'SpecialMobileOptions';
$wgSpecialPages['MobileMenu'] = 'SpecialMobileMenu';

function efMobileFrontend_Setup() {
	global $wgExtMobileFrontend, $wgMFNearby, $wgSpecialPages, $wgMFLoginHandshakeUrl;

	$wgExtMobileFrontend = new ExtMobileFrontend( RequestContext::getMain() );

	if ( $wgMFNearby ) {
		$wgSpecialPages['Nearby'] = 'SpecialNearby';
	}

	if ( $wgMFLoginHandshakeUrl ) {
		$wgSpecialPages['LoginHandshake'] = 'SpecialLoginHandshake';
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
	'targets' => array( 'mobile', 'desktop' ),
);

/**
 * A boilerplate for the MFResourceLoaderModule that supports templates
 */
$wgMFMobileResourceTemplateBoilerplate = array(
	'localBasePath' => $localBasePath,
	'localTemplateBasePath' => $localBasePath . '/templates',
	'class' => 'MFResourceLoaderModule',
);

// main page
$wgResourceModules['mobile.mainpage.styles'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup' ),
	'styles' => array(
		'stylesheets/mainpage/mainpage.css',
	),
	'group' => 'other',
);

$wgResourceModules['mobile.mainpage.dependencies'] = array(
	'messages' => array(
		// mf-homepage.js
		'mobile-frontend-empty-homepage-text' => array( 'parse' ),
	),
	'class' => 'MFResourceLoaderModule',
	'group' => 'other',
);

$wgResourceModules['mobile.mainpage.scripts'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array(
		'mobile.startup',
		'mobile.mainpage.dependencies',
	),
	'scripts' => array(
		'javascripts/modules/mf-homepage.js',
	),
	'group' => 'other',
);

// Filepages
$wgResourceModules['mobile.file.styles'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup' ),
	'styles' => array(
		'stylesheets/file/filepage.css',
	),
);

$wgResourceModules['mobile.file.scripts'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup' ),
	'scripts' => array(
		'javascripts/file/filepage.js'
	),
);

$wgResourceModules['mobile.styles.page'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup' ),
	'styles' => array(
		'stylesheets/common/mf-enwp.css'
	),
);

$wgResourceModules['mobile.styles'] = $wgMFMobileResourceBoilerplate + array(
	'styles' => array(
		'stylesheets/externals/reset.css',
		'stylesheets/common/mf-common.css',
		'stylesheets/common/ui.css',
		'stylesheets/common/mf-typography.css',
		'stylesheets/common/mf-footer.css',
		// FIXME: move to module mobile.stable.styles for some reason it breaks RTL when in that module
		'stylesheets/common/mf-navigation.css',
		'stylesheets/common/overlays.css',
		'stylesheets/common/drawer.css',
		'stylesheets/common/mf-hacks.css',
	),
	'position' => 'top',
);

// Important: This module is loaded on both mobile and desktop skin
$wgResourceModules['mobile.startup'] = $wgMFMobileResourceBoilerplate + array(
	'styles' => array(
	),
	'scripts' => array(
		'javascripts/common/polyfills.js',
		'javascripts/common/modules.js',
		'javascripts/externals/hogan.js',
		'javascripts/common/eventemitter.js',
		'javascripts/common/mf-application.js',
		'javascripts/common/history.js',
		'javascripts/common/mf-settings.js',
		'javascripts/modules/mf-stop-mobile-redirect.js',
	),
	'position' => 'bottom',
);

$wgResourceModules['mobile.stable.dependencies'] = array(
	'messages' => array(
		// mf-photo.js
		'mobile-frontend-photo-license' => array( 'parse' ),
		'mobile-frontend-photo-nag-1-bullet-1-heading',
		'mobile-frontend-photo-nag-1-bullet-1-text' => array( 'parse' ),
		'mobile-frontend-photo-nag-1-bullet-2-heading',
		'mobile-frontend-photo-nag-1-bullet-2-text',
		'mobile-frontend-photo-nag-2-bullet-1-heading',
		'mobile-frontend-photo-nag-3-bullet-1-heading',
		'parentheses',
		'mobile-frontend-learn-more',
		'mobile-frontend-photo-nag-learn-more-heading',
		'mobile-frontend-photo-nag-learn-more-1' => array( 'parse' ),
		'mobile-frontend-photo-nag-learn-more-2' => array( 'parse' ),
		'mobile-frontend-photo-nag-learn-more-3' => array( 'parse' ),
	),
	'localBasePath' => $localBasePath,
	'localTemplateBasePath' => $localBasePath . '/templates',
	'templates' => array(
		'wikitext/commons-upload',
		'leadPhoto',
		'overlay',
		'overlays/cleanup',
		'overlays/learnMore',
		'overlays/search/search',
		'overlays/search/results',
		'photoUploader',
		'photoUploadPreview',
		'photoNag',
		'ctaDrawer'
	),
	'class' => 'MFResourceLoaderModule',
);

$wgResourceModules['mobile.beta.plumbing'] = array(
	'localBasePath' => $localBasePath,
	'localTemplateBasePath' => $localBasePath . '/templates',
	'templates' => array(
		'languageSection',
		'overlays/languages',
	),
	'class' => 'MFResourceLoaderModule',
);

$wgResourceModules['mobile.beta'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array(
		'mobile.stable',
		'mobile.beta.plumbing',
	),
	'scripts' => array(
		'javascripts/modules/mf-languages.js',
		'javascripts/common/history-beta.js',
		'javascripts/views/page.js',
		'javascripts/modules/mf-toggle-dynamic.js',
		'javascripts/common/application-beta.js',
	),
	'position' => 'bottom',
	'messages' => array(
		'pagetitle',
		'mobile-frontend-language-header',

		// for mf-toggle-dynamic.js
		'mobile-frontend-show-button',
		'mobile-frontend-hide-button',

		// for mf-languages.js
		'mobile-frontend-language-site-choose',
		'mobile-frontend-language-footer',
	),
);

$wgResourceModules['mobile.toggling'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup' ),
	'messages' => array(
		// for mf-toggle.js
		'mobile-frontend-close-section',
		'mobile-frontend-show-button',
		'mobile-frontend-hide-button',
	),
	'styles' => array(),
	'scripts' => array(
		'javascripts/modules/mf-toggle.js',
	),
);

$wgResourceModules['mobile.action.edit'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup', 'mobile.beta' ),
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
	'group' => 'mobile.action',
);

$wgResourceModules['mobile.action.history'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array( 'mobile.startup' ),
	'styles' => array(
	),
	'scripts' => array(
		'stylesheets/actions/mf-history.css',
	),
	'group' => 'mobile.action',
);

$wgResourceModules['mobile.alpha.plumbing'] = array(
	'localBasePath' => $localBasePath,
	'localTemplateBasePath' => $localBasePath . '/templates',
	'templates' => array(
		'overlays/talk',
		'overlays/talkSectionAdd',
		'talkSection',
	),
	'class' => 'MFResourceLoaderModule',
);

$wgResourceModules['mobile.alpha'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array(
		'mobile.alpha.plumbing',
		'mobile.stable',
		'mobile.beta',
	),
	'messages' => array(

		// for mf-table.js
		'mobile-frontend-table',

		// for talk.js
		'mobile-frontend-talk-explained',
		'mobile-frontend-talk-explained-empty',
		'mobile-frontend-talk-overlay-lead-header',
		'mobile-frontend-talk-overlay-header',
		'mobile-frontend-talk-add-overlay-subject-placeholder',
		'mobile-frontend-talk-add-overlay-content-placeholder',
		'mobile-frontend-talk-edit-summary',
		'mobile-frontend-talk-add-overlay-submit',
	),
	'styles' => array(
		'stylesheets/modules/mf-tables.css',
		'stylesheets/modules/talk.css',
	),
	'scripts' => array(
		'javascripts/modules/mf-inline-style-scrubber.js',
		'javascripts/modules/mf-tables.js',
		'javascripts/modules/mf-translator.js',
		'javascripts/modules/talk.js',
	),
);

$wgResourceModules['mobile.notifications'] = $wgMFMobileResourceBoilerplate + array(
	'styles' => array(
		'stylesheets/common/notifications.css',
	),
	'position' => 'top',
);

$wgResourceModules['mobile.stable.styles'] = $wgMFMobileResourceBoilerplate + array(
	'styles' => array(
		'stylesheets/modules/mf-search.css',
		'stylesheets/modules/mf-toggle.css',
		'stylesheets/modules/mf-references.css',
		'stylesheets/modules/mf-cleanuptemplates.css',
		'stylesheets/modules/mf-watchstar.css',
		'stylesheets/modules/mf-photo.css',
	),
	'position' => 'top',
);

// Important: This module is loaded on both mobile and desktop skin
$wgResourceModules['mobile.stable.universal'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array(
		'mobile.startup',
		'mobile.stable.dependencies',
		'mobile.notifications',
	),
	'scripts' => array(
		'javascripts/externals/hogan.js',
		'javascripts/common/mf-oop.js',
		'javascripts/common/mf-api.js',
		'javascripts/common/mf-view.js',
		'javascripts/widgets/progress-bar.js',
		'javascripts/common/mf-navigation.js',
		'javascripts/common/mf-notification.js',
	),
	'messages' => array(
		// mf-notification.js
		'mobile-frontend-logged-in-toast-notification',

		// mf-navigation.js
		'mobile-frontend-watchlist-cta-button-signup',
		'mobile-frontend-watchlist-cta-button-login',
		'mobile-frontend-drawer-cancel',
		'mobile-frontend-overlay-escape',
	),
);

$wgResourceModules['mobile.stable'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array(
		'mediawiki.jqueryMsg',
		'mobile.startup',
		'mobile.stable.universal',
		'mediawiki.util',
		'mobile.stable.styles',
	),
	'scripts' => array(
		'javascripts/modules/mf-cleanuptemplates.js',
		'javascripts/modules/mf-last-modified.js',
		'javascripts/modules/mf-watchstar.js',
		'javascripts/modules/mf-photo.js',
		'javascripts/modules/mainmenutweaks.js',
		'javascripts/modules/search-2.js',
		'javascripts/modules/mf-references.js'
	),
	'messages' => array(
		// mf-cleanuptemplates.js
		'mobile-frontend-meta-data-issues',
		'mobile-frontend-meta-data-issues-header',

		// mf-last-modified.js
		'mobile-frontend-last-modified-seconds',
		'mobile-frontend-last-modified-hours',
		'mobile-frontend-last-modified-minutes',
		'mobile-frontend-last-modified-hours',
		'mobile-frontend-last-modified-days',
		'mobile-frontend-last-modified-months',
		'mobile-frontend-last-modified-years',

		// mf-watchstar.js
		'mobile-frontend-watchlist-add',
		'mobile-frontend-watchlist-removed',
		'mobile-frontend-watchlist-cta',

		// mf-photo.js
		'mobile-frontend-photo-ownership',
		'mobile-frontend-photo-ownership-help',
		'mobile-frontend-photo-article-edit-comment',
		'mobile-frontend-photo-article-donate-comment',
		'mobile-frontend-photo-upload-error',
		'mobile-frontend-photo-upload-error-filename',
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
		'mobile-frontend-photo-ownership-confirm',
		'mobile-frontend-photo-ownership-bullet-one',
		'mobile-frontend-photo-ownership-bullet-two',
		'mobile-frontend-photo-ownership-bullet-three',
		'mobile-frontend-photo-upload-cta',

		// for search.js
		'mobile-frontend-search-help',
		'mobile-frontend-search-noresults',
	),
);

$wgResourceModules['mobile.site'] = array(
	'dependencies' => array( 'mobile.startup' ),
	'class' => 'MobileSiteModule',
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
 * A boilerplate containing common properties for all RL modules served to mobile site special pages
 */
$wgMFMobileSpecialPageResourceBoilerplate = array(
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'targets' => 'mobile',
	'group' => 'mobile.special',
);
/**
 * A boilerplate for RL script modules
*/
$wgMFMobileSpecialPageResourceScriptBoilerplate = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'dependencies' => array( 'mobile.stable' ),
);
/**
 * A boilerplate for RL style modules for special pages
*/
$wgMFMobileSpecialPageResourceStyleBoilerplate = $wgMFMobileSpecialPageResourceBoilerplate + array(
	// ensure special css is always loaded after mobile.styles for cascading purposes (keep jgonera happy)
	'dependencies' => array( 'mobile.styles' ),
);

// Special page modules we only want to load in beta/alpha:
$wgResourceModules['mobile.special.alpha.scripts'] = $wgMFMobileSpecialPageResourceScriptBoilerplate + array(
	'scripts' => array(
		'javascripts/specials/modules/search-btn.js',
	),
);

$wgResourceModules['mobile.special.alpha.styles'] = $wgMFMobileSpecialPageResourceScriptBoilerplate + array(
	'styles' => array(
		'stylesheets/specials/modules/search-btn.css',
	),
);


/**
	* Special page modules
	*
	* Note: Use correct names to ensure modules load on pages
	* Name must be the name of the special page lowercased prefixed by 'mobile.'
	* suffixed by '.styles' or '.scripts'
	*/
$wgResourceModules['mobile.mobilemenu.styles'] = $wgMFMobileSpecialPageResourceStyleBoilerplate + array(
	'styles' => array(
		'stylesheets/specials/mobilemenu.css',
	),
);
$wgResourceModules['mobile.mobilefeedback.styles'] = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'styles' => array(
		'stylesheets/specials/mobilefeedback.css',
	),
);
$wgResourceModules['mobile.mobileoptions.styles'] = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'styles' => array(
		'stylesheets/specials/mobileoptions.css',
	),
);
$wgResourceModules['mobile.mobileoptions.scripts'] = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'position' => 'top',
	'scripts' => array(
		'javascripts/specials/mobileoptions.js',
	),
);

$wgResourceModules['mobile.nearby.plumbing'] = $wgMFMobileResourceTemplateBoilerplate + array(
	'templates' => array(
		'articleList',
		'overlays/pagePreview',
		'overlays/loading',
	),
);

$wgResourceModules['mobile.nearby.previews'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array(
		'mobile.nearby.scripts',
	),
	'messages' => array(
		// preview.js
		'mobile-frontend-ajax-preview-loading',
	),
	'scripts' => array(
		'javascripts/specials/overlays/preview.js',
	),
);

$wgResourceModules['mobile.nearby.scripts'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array(
		'mobile.nearby.plumbing',
		'mobile.stable',
		'jquery.json',
		'mobile.beta',
	),
	'messages' => array(
		'mobile-frontend-nearby-error',
		'mobile-frontend-nearby-refresh',
		'mobile-frontend-nearby-title',
		'mobile-frontend-nearby-loading',
		'mobile-frontend-nearby-distance',
		'mobile-frontend-nearby-distance-meters',
		'mobile-frontend-nearby-lookup-error',
		'mobile-frontend-nearby-noresults',
		'mobile-frontend-nearby-link',
		'mobile-frontend-needs-photo',
	),
	'styles' => array(
		'stylesheets/specials/watchlist.css',
		'stylesheets/specials/nearby.css',
	),
	'scripts' => array(
		'javascripts/specials/nearby.js',
	),
);
$wgResourceModules['mobile.search.styles'] = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'styles' => array(
		'stylesheets/specials/search.css',
	),
);
$wgResourceModules['mobile.watchlist.scripts'] = $wgMFMobileSpecialPageResourceScriptBoilerplate + array(
	'scripts' => array(
		'javascripts/specials/watchlist.js',
	),
);
$wgResourceModules['mobile.watchlist.styles'] = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'styles' => array(
		'stylesheets/specials/watchlist.css',
	),
);
$wgResourceModules['mobile.userlogin.styles'] = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'styles' => array(
		'stylesheets/specials/userlogin.css',
	),
);
$wgResourceModules['mobile.userlogin.scripts'] = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'scripts' => array(
		'javascripts/specials/userlogin.js',
	),
	'position' => 'top',
);

// Special:Uploads
$wgResourceModules['mobile.uploads.plumbing'] = $wgMFMobileResourceTemplateBoilerplate + array(
	'templates' => array(
		'specials/uploads/carousel',
	),
);
$wgResourceModules['mobile.uploads.scripts'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array(
		'mobile.uploads.plumbing',
		'mobile.stable',
	),
	'messages' => array(
		'mobile-frontend-photo-upload-generic',
		'mobile-frontend-donate-photo-upload-success',
		'mobile-frontend-donate-photo-first-upload-success',
		'mobile-frontend-donate-image-summary',
		'mobile-frontend-listed-image-no-description',
		'mobile-frontend-photo-upload-user-count',
		'mobile-frontend-first-upload-wizard-page-1',
		'mobile-frontend-first-upload-wizard-page-2',
		'mobile-frontend-first-upload-wizard-page-3',
	),
	'scripts' => array(
		'javascripts/widgets/carousel.js',
		'javascripts/specials/uploads.js',
	),
);
$wgResourceModules['mobile.uploads.styles'] = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'styles' => array(
		'stylesheets/specials/uploads.css',
	),
);
$wgResourceModules['mobile.mobilediff.styles'] = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'styles' => array(
		'stylesheets/specials/watchlist.css',
		'stylesheets/specials/mobilediff.css',
	),
);

$wgResourceModules['mobile.mobilediff.scripts'] = $wgMFMobileResourceBoilerplate + array(
	'dependencies' => array(
		'mobile.startup',
	),
	'scripts' => array(
		'javascripts/externals/jsdiff.js',
		'javascripts/specials/mobilediff.js',
	),
);

// FIXME: temporary hack to get round CentralAuth logout screen
$wgResourceModules['mobile.userlogout.scripts'] = $wgMFMobileSpecialPageResourceScriptBoilerplate + array(
	'scripts' => array(
		'javascripts/specials/userlogin.js',
	),
);
$wgResourceModules['mobile.userlogout.styles'] = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'styles' => array(
		'stylesheets/specials/userlogin.css',
	),
);
$wgResourceModules['mobile.loginhandshake.scripts'] = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'dependencies' => array(
		'jquery.cookie',
	),
	'scripts' => array(
		'javascripts/specials/loginhandshake.js',
	),
	'position' => 'top',
);

//@hack: xdevice instead of device to force this module to be last in a link
$wgResourceModules['mobile.xdevice.detect'] = $wgResourceModules['mobile.xdevice.detect.styles'] = $wgMFMobileResourceBoilerplate + array(
	'class' => 'MobileDeviceDetectModule',
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
 * An optional alternative api to query for nearby pages
 * e.g. http://en.m.wikipedia.org/w/api.php
 *
 * If set forces nearby to operate in JSONP mode
 * @var String
 */
$wgMFNearbyEndpoint = '';

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
 * @var ExtMobileFrontend $wgExtMobileFrontend
 */
$wgExtMobileFrontend = null;

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
 * Whether the login form should redirect to another URL on the first login attempt.
 *
 * Defaults to false.
 */
$wgMFLoginHandshakeUrl = false;

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
 */
$wgMFEnablePhotoUploadCTA = false;

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
 * @see http://www.mediawiki.org/wiki/Analytics/Kraken/Data_Formats/X-Analytics
 * @var bool
 */
$wgMFEnableXAnalyticsLogging = false;

/**
 * If set to true, mobile skin's resources are varied by X-Device.
 * Otherwise, page HTML will be varied on it.
 */
$wgMFVaryResources = false;

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
