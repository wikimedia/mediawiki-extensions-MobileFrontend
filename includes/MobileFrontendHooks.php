<?php

// phpcs:disable MediaWiki.NamingConventions.LowerCamelFunctionsName.FunctionName

use MediaWiki\Api\Hook\APIQuerySiteInfoGeneralInfoHook;
use MediaWiki\Auth\AuthenticationRequest;
use MediaWiki\Auth\AuthManager;
use MediaWiki\Cache\Hook\HTMLFileCache__useFileCacheHook;
use MediaWiki\ChangeTags\Hook\ChangeTagsListActiveHook;
use MediaWiki\ChangeTags\Hook\ListDefinedTagsHook;
use MediaWiki\ChangeTags\Taggable;
use MediaWiki\Config\Config;
use MediaWiki\Diff\Hook\DifferenceEngineViewHeaderHook;
use MediaWiki\Extension\AbuseFilter\Variables\VariableHolder;
use MediaWiki\Extension\Gadgets\GadgetRepo;
use MediaWiki\Hook\AfterBuildFeedLinksHook;
use MediaWiki\Hook\BeforePageDisplayHook;
use MediaWiki\Hook\BeforePageRedirectHook;
use MediaWiki\Hook\GetCacheVaryCookiesHook;
use MediaWiki\Hook\LoginFormValidErrorMessagesHook;
use MediaWiki\Hook\MakeGlobalVariablesScriptHook;
use MediaWiki\Hook\ManualLogEntryBeforePublishHook;
use MediaWiki\Hook\OutputPageBeforeHTMLHook;
use MediaWiki\Hook\OutputPageBodyAttributesHook;
use MediaWiki\Hook\OutputPageParserOutputHook;
use MediaWiki\Hook\PostLoginRedirectHook;
use MediaWiki\Hook\RecentChange_saveHook;
use MediaWiki\Hook\RequestContextCreateSkinHook;
use MediaWiki\Hook\SkinAddFooterLinksHook;
use MediaWiki\Hook\SkinAfterBottomScriptsHook;
use MediaWiki\Hook\TitleSquidURLsHook;
use MediaWiki\Html\Html;
use MediaWiki\MediaWikiServices;
use MediaWiki\Output\OutputPage;
use MediaWiki\Page\Hook\BeforeDisplayNoArticleTextHook;
use MediaWiki\Parser\ParserOutput;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\ResourceLoader as RL;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderSiteModulePagesHook;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderSiteStylesModulePagesHook;
use MediaWiki\ResourceLoader\ResourceLoader;
use MediaWiki\SpecialPage\Hook\AuthChangeFormFieldsHook;
use MediaWiki\SpecialPage\Hook\SpecialPage_initListHook;
use MediaWiki\SpecialPage\Hook\SpecialPageBeforeExecuteHook;
use MediaWiki\SpecialPage\SpecialPage;
use MediaWiki\Title\Title;
use MediaWiki\User\Hook\UserGetDefaultOptionsHook;
use MediaWiki\User\User;
use MobileFrontend\Api\ApiParseExtender;
use MobileFrontend\ContentProviders\DefaultContentProvider;
use MobileFrontend\Features\FeaturesManager;
use MobileFrontend\Hooks\HookRunner;
use MobileFrontend\Models\MobilePage;
use MobileFrontend\Transforms\LazyImageTransform;
use MobileFrontend\Transforms\MakeSectionsTransform;

/**
 * Hook handlers for MobileFrontend extension
 *
 * If your hook changes the behaviour of the Minerva skin, you are in the wrong place.
 * Any changes relating to Minerva should go into Minerva.hooks.php
 */
class MobileFrontendHooks implements
	APIQuerySiteInfoGeneralInfoHook,
	AuthChangeFormFieldsHook,
	RequestContextCreateSkinHook,
	BeforeDisplayNoArticleTextHook,
	OutputPageBeforeHTMLHook,
	OutputPageBodyAttributesHook,
	ResourceLoaderSiteStylesModulePagesHook,
	ResourceLoaderSiteModulePagesHook,
	SkinAfterBottomScriptsHook,
	SkinAddFooterLinksHook,
	BeforePageRedirectHook,
	DifferenceEngineViewHeaderHook,
	GetCacheVaryCookiesHook,
	SpecialPage_initListHook,
	ListDefinedTagsHook,
	ChangeTagsListActiveHook,
	RecentChange_saveHook,
	SpecialPageBeforeExecuteHook,
	PostLoginRedirectHook,
	BeforePageDisplayHook,
	GetPreferencesHook,
	OutputPageParserOutputHook,
	HTMLFileCache__useFileCacheHook,
	LoginFormValidErrorMessagesHook,
	AfterBuildFeedLinksHook,
	MakeGlobalVariablesScriptHook,
	TitleSquidURLsHook,
	UserGetDefaultOptionsHook,
	ManualLogEntryBeforePublishHook
{
	private const MOBILE_PREFERENCES_SECTION = 'rendering/mobile';
	public const MOBILE_PREFERENCES_SPECIAL_PAGES = 'mobile-specialpages';
	public const MOBILE_PREFERENCES_EDITOR = 'mobile-editor';
	public const MOBILE_PREFERENCES_FONTSIZE = 'mf-font-size';
	public const MOBILE_PREFERENCES_EXPAND_SECTIONS = 'mf-expand-sections';
	private const ENABLE_SPECIAL_PAGE_OPTIMISATIONS = '1';
	// This should always be kept in sync with `@width-breakpoint-tablet`
	// in mediawiki.skin.variables.less
	private const DEVICE_WIDTH_TABLET = '720px';

	/**
	 * Obtain the default mobile skin
	 *
	 * @param Config $config
	 * @throws SkinException If a factory function isn't registered for the skin name
	 * @return Skin
	 */
	protected static function getDefaultMobileSkin( Config $config ): Skin {
		$defaultSkin = $config->get( 'DefaultMobileSkin' );

		if ( !$defaultSkin ) {
			$defaultSkin = $config->get( 'DefaultSkin' );
		}

		$factory = MediaWikiServices::getInstance()->getSkinFactory();
		return $factory->makeSkin( Skin::normalizeKey( $defaultSkin ) );
	}

	/**
	 * RequestContextCreateSkin hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/RequestContextCreateSkin
	 *
	 * @param IContextSource $context The RequestContext object the skin is being created for.
	 * @param Skin|null|string &$skin A variable reference you may set a Skin instance or string
	 *                                key on to override the skin that will be used for the context.
	 * @return bool
	 */
	public function onRequestContextCreateSkin( $context, &$skin ) {
		$services = MediaWikiServices::getInstance();

		/** @var MobileContext $mobileContext */
		$mobileContext = $services->getService( 'MobileFrontend.Context' );
		$config = $services->getService( 'MobileFrontend.Config' );

		$mobileContext->doToggling();
		if ( !$mobileContext->shouldDisplayMobileView() ) {
			return true;
		}

		// Handle any X-Analytics header values in the request by adding them
		// as log items. X-Analytics header values are serialized key=value
		// pairs, separated by ';', used for analytics purposes.
		$xanalytics = $mobileContext->getRequest()->getHeader( 'X-Analytics' );
		if ( $xanalytics ) {
			$xanalytics_arr = explode( ';', $xanalytics );
			if ( count( $xanalytics_arr ) > 1 ) {
				foreach ( $xanalytics_arr as $xanalytics_item ) {
					$mobileContext->addAnalyticsLogItemFromXAnalytics( $xanalytics_item );
				}
			} else {
				$mobileContext->addAnalyticsLogItemFromXAnalytics( $xanalytics );
			}
		}

		// log whether user is using beta/stable
		$mobileContext->logMobileMode();

		// Allow overriding of skin by useskin e.g. useskin=vector&useformat=mobile or by
		// setting the mobileskin preferences (api only currently)
		$userOption = $services->getUserOptionsLookup()->getOption(
			$context->getUser(), 'mobileskin'
		);
		$userSkin = $context->getRequest()->getVal( 'useskin', $userOption );
		if ( $userSkin && Skin::normalizeKey( $userSkin ) === $userSkin ) {
			$skin = $services->getSkinFactory()->makeSkin( $userSkin );
		} else {
			$skin = self::getDefaultMobileSkin( $config );
		}

		$hookRunner = new HookRunner( $services->getHookContainer() );
		$hookRunner->onRequestContextCreateSkinMobile( $mobileContext, $skin );

		return false;
	}

	/**
	 * Update the footer
	 * @param Skin $skin
	 * @param string $key the current key for the current group (row) of footer links.
	 *   e.g. `info` or `places`.
	 * @param array &$footerLinks an empty array that can be populated with new links.
	 *   keys should be strings and will be used for generating the ID of the footer item
	 *   and value should be an HTML string.
	 */
	public function onSkinAddFooterLinks( Skin $skin, string $key, array &$footerLinks ) {
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );

		if ( $key === 'places' ) {
			if ( $context->shouldDisplayMobileView() ) {
				$terms = MobileFrontendSkinHooks::getTermsLink( $skin );
				if ( $terms ) {
					$footerLinks['terms-use'] = $terms;
				}
				$footerLinks['desktop-toggle'] = MobileFrontendSkinHooks::getDesktopViewLink( $skin, $context );
			} else {
				// If desktop site append a mobile view link
				$footerLinks['mobileview'] =
					MobileFrontendSkinHooks::getMobileViewLink( $skin, $context );
			}
		}
	}

	/**
	 * SkinAfterBottomScripts hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SkinAfterBottomScripts
	 *
	 * Adds an inline script for lazy loading the images in Grade C browsers.
	 *
	 * @param Skin $skin
	 * @param string &$html bottomScripts text. Append to $text to add additional
	 *                      text/scripts after the stock bottom scripts.
	 */
	public function onSkinAfterBottomScripts( $skin, &$html ) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		/** @var FeaturesManager $featureManager */
		$featureManager = $services->getService( 'MobileFrontend.FeaturesManager' );

		// TODO: We may want to enable the following script on Desktop Minerva...
		// ... when Minerva is widely used.
		if ( $context->shouldDisplayMobileView() &&
			$featureManager->isFeatureAvailableForCurrentUser( 'MFLazyLoadImages' )
		) {
			$html .= Html::inlineScript( ResourceLoader::filter( 'minify-js',
				LazyImageTransform::gradeCImageSupport()
			) );
		}
	}

	/**
	 * BeforeDisplayNoArticleText hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforeDisplayNoArticleText
	 *
	 * @param Article $article The (empty) article
	 * @return bool This hook can abort
	 */
	public function onBeforeDisplayNoArticleText( $article ) {
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$displayMobileView = $context->shouldDisplayMobileView();

		$title = $article->getTitle();

		// if the page is a userpage
		// @todo: Upstream to core (T248347).
		if ( $displayMobileView &&
			$title->inNamespaces( NS_USER ) &&
			!$title->isSubpage()
		) {
			$out = $article->getContext()->getOutput();
			$userpagetext = ExtMobileFrontend::blankUserPageHTML( $out, $title );
			if ( $userpagetext ) {
				// Replace the default message with ours
				$out->addHTML( $userpagetext );
				return false;
			}
		}

		return true;
	}

	/**
	 * OutputPageBeforeHTML hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/OutputPageBeforeHTML
	 *
	 * Applies MobileFormatter to mobile viewed content
	 *
	 * @param OutputPage $out the OutputPage object to which wikitext is added
	 * @param string &$text the HTML to be wrapped inside the #mw-content-text element
	 */
	public function onOutputPageBeforeHTML( $out, &$text ) {
		// This hook can be executed more than once per page view if the page content is composed from
		// multiple sources! Anything that doesn't depend on $text should use onBeforePageDisplay.

		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$title = $out->getTitle();
		$config = $services->getService( 'MobileFrontend.Config' );
		$displayMobileView = $context->shouldDisplayMobileView();

		if ( !$title ) {
			return;
		}

		$options = $config->get( 'MFMobileFormatterOptions' );
		$excludeNamespaces = $options['excludeNamespaces'] ?? [];
		// Perform a few extra changes if we are in mobile mode
		$namespaceAllowed = !$title->inNamespaces( $excludeNamespaces );

		$provider = new DefaultContentProvider( $text );
		$originalProviderClass = DefaultContentProvider::class;
		( new HookRunner( $services->getHookContainer() ) )->onMobileFrontendContentProvider(
			$provider, $out
		);

		$isParse = ApiParseExtender::isParseAction(
			$context->getRequest()->getText( 'action' )
		);

		if ( get_class( $provider ) === $originalProviderClass ) {
			// This line is important to avoid the default content provider running unnecessarily
			// on desktop views.
			$useContentProvider = $displayMobileView;
			$runMobileFormatter = $displayMobileView && (
				// T245160 - don't run the mobile formatter on old revisions.
				// Note if not the default content provider we ignore this requirement.
				$title->getLatestRevID() > 0 ||
				// Always allow the formatter in ApiParse
				$isParse
			);
		} else {
			// When a custom content provider is enabled, always use it.
			$useContentProvider = true;
			$runMobileFormatter = $displayMobileView;
		}

		if ( $namespaceAllowed && $useContentProvider ) {
			$text = ExtMobileFrontend::domParseWithContentProvider(
				$provider, $out, $runMobileFormatter
			);
		}
	}

	/**
	 * Modifies the `<body>` element's attributes.
	 *
	 * By default, the `class` attribute is set to the output's "bodyClassName"
	 * property.
	 *
	 * @param OutputPage $out
	 * @param Skin $skin
	 * @param string[] &$bodyAttrs
	 */
	public function onOutputPageBodyAttributes( $out, $skin, &$bodyAttrs ): void {
		/** @var \MobileFrontend\Amc\UserMode $userMode */
		$userMode = MediaWikiServices::getInstance()->getService( 'MobileFrontend.AMC.UserMode' );
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$isMobile = $context->shouldDisplayMobileView();

		// FIXME: This can be removed when existing references have been updated.
		if ( $isMobile && !$userMode->isEnabled() ) {
			$bodyAttrs['class'] .= ' mw-mf-amc-disabled';
		}

		if ( $isMobile ) {
			// Add a class to the body so that TemplateStyles (which can only
			// access html and body) and gadgets have something to check for.
			// @stable added in 1.38
			$bodyAttrs['class'] .= ' mw-mf';
		}
	}

	/**
	 * BeforePageRedirect hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageRedirect
	 *
	 * Ensures URLs are handled properly for select special pages.
	 * @param OutputPage $out
	 * @param string &$redirect URL string, modifiable
	 * @param string &$code HTTP code (eg '301' or '302'), modifiable
	 */
	public function onBeforePageRedirect( $out, &$redirect, &$code ) {
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$shouldDisplayMobileView = $context->shouldDisplayMobileView();
		if ( !$shouldDisplayMobileView ) {
			return;
		}

		// T45123: force mobile URLs only for local redirects
		if ( $context->isLocalUrl( $redirect ) ) {
			$out->addVaryHeader( 'X-Subdomain' );
			$redirect = $context->getMobileUrl( $redirect );
		}
	}

	/**
	 * DifferenceEngineViewHeader hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/DifferenceEngineViewHeader
	 *
	 * Redirect Diff page to mobile version if appropriate
	 *
	 * @param DifferenceEngine $diff DifferenceEngine object that's calling
	 */
	public function onDifferenceEngineViewHeader( $diff ) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		if ( !$context->shouldDisplayMobileView() ) {
			// this code should only apply to mobile view.
			return;
		}
		/** @var FeaturesManager $featureManager */
		$featureManager = $services->getService( 'MobileFrontend.FeaturesManager' );

		$oldRevRecord = $diff->getOldRevision();
		$newRevRecord = $diff->getNewRevision();

		$otherParams = $diff->getContext()->getRequest()->getValues();
		$title = $context->getTitle();
		$output = $context->getOutput();
		// Only do redirects to MobileDiff if user is in mobile view and it's not a special page
		if (
			!$title->isSpecialPage() &&
			!$featureManager->isFeatureAvailableForCurrentUser( 'MFUseDesktopDiffPage' ) &&
			self::shouldMobileFormatSpecialPages( $context->getUser() )
		) {
			$newRevId = $newRevRecord->getId();

			// Pass other query parameters, e.g. 'unhide' (T263937)
			unset( $otherParams['diff'] );
			unset( $otherParams['oldid'] );
			// We pass diff/oldid through the page title, so we must unset any parameters
			// that override the title (but don't override diff/oldid)
			unset( $otherParams['title'] );
			unset( $otherParams['curid'] );

			$redirectUrl = SpecialPage::getTitleFor( 'MobileDiff', (string)$newRevId )->getFullURL( $otherParams );

			// The MobileDiff page currently only supports showing a single revision, so
			// only redirect to MobileDiff if we are sure this isn't a multi-revision diff.
			if ( $oldRevRecord ) {
				// Get the revision immediately before the new revision
				$prevRevRecord = MediaWikiServices::getInstance()
					->getRevisionLookup()
					->getPreviousRevision( $newRevRecord );
				if ( $prevRevRecord ) {
					$prevRevId = $prevRevRecord->getId();
					$oldRevId = $oldRevRecord->getId();
					if ( $prevRevId === $oldRevId ) {
						$output->redirect( $redirectUrl );
					}
				}
			} else {
				$output->redirect( $redirectUrl );
			}
		} elseif (
			$featureManager->isFeatureAvailableForCurrentUser( 'MFUseDesktopDiffPage' ) &&
			!isset( $otherParams['diffonly'] )
		) {
			$otherParams['diffonly'] = '1';
			$output->redirect( $title->getFullUrl( $otherParams ) );
		}
	}

	/**
	 * ResourceLoaderSiteStylesModulePages hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderSiteStylesModulePages
	 *
	 * @param string $skin
	 * @param array &$pages to sort modules from.
	 */
	public function onResourceLoaderSiteStylesModulePages( $skin, array &$pages ): void {
		$ctx = MobileContext::singleton();
		$ucaseSkin = ucfirst( $skin );
		$services = MediaWikiServices::getInstance();
		$config = $services->getService( 'MobileFrontend.Config' );
		// Use Mobile.css instead of MediaWiki:Common.css and MediaWiki:<skinname.css> on mobile views.
		if ( $ctx->shouldDisplayMobileView() && $config->get( 'MFCustomSiteModules' ) ) {
			unset( $pages['MediaWiki:Common.css'] );
			unset( $pages['MediaWiki:Print.css'] );
			// MediaWiki:<skinname>.css suffers from the same problems as MediaWiki:Common.css
			// in that it has traditionally been written for desktop skins and is bloated.
			// We have always removed this on mobile for this reason.
			// If we loaded this there is absolutely no point in MediaWiki:Mobile.css! (T248415)
			unset( $pages["MediaWiki:$ucaseSkin.css"] );
			if ( $config->get( 'MFSiteStylesRenderBlocking' ) ) {
				$pages['MediaWiki:Mobile.css'] = [ 'type' => 'style' ];
			}
		}
	}

	/**
	 * ResourceLoaderSiteModulePages hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderSiteModulePages
	 *
	 * @param string $skin
	 * @param array &$pages to sort modules from.
	 */
	public function onResourceLoaderSiteModulePages( $skin, array &$pages ): void {
		$ctx = MobileContext::singleton();
		$services = MediaWikiServices::getInstance();
		$config = $services->getService( 'MobileFrontend.Config' );
		// Use Mobile.js instead of MediaWiki:Common.js and MediaWiki:<skinname.js> on mobile views.
		if ( $ctx->shouldDisplayMobileView() && $config->get( 'MFCustomSiteModules' ) ) {
			unset( $pages['MediaWiki:Common.js'] );
			$pages['MediaWiki:Mobile.js'] = [ 'type' => 'script' ];
			if ( !$config->get( 'MFSiteStylesRenderBlocking' ) ) {
				$pages['MediaWiki:Mobile.css'] = [ 'type' => 'style' ];
			}
		}
	}

	/**
	 * GetCacheVaryCookies hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetCacheVaryCookies
	 *
	 * @param OutputPage $out
	 * @param array &$cookies array of cookies name, add a value to it
	 *                        if you want to add a cookie that have to vary cache options
	 */
	public function onGetCacheVaryCookies( $out, &$cookies ) {
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$hasMobileUrl = $context->hasMobileDomain();

		// Enables mobile cookies on wikis w/o mobile domain
		$cookies[] = MobileContext::USEFORMAT_COOKIE_NAME;
		// Don't redirect to mobile if user had explicitly opted out of it
		$cookies[] = MobileContext::STOP_MOBILE_REDIRECT_COOKIE_NAME;

		if ( $context->shouldDisplayMobileView() || !$hasMobileUrl ) {
			// beta cookie
			$cookies[] = MobileContext::OPTIN_COOKIE_NAME;
		}
	}

	/**
	 * Generate config for usage inside MobileFrontend
	 * This should be used for variables which:
	 *  - vary with the html
	 *  - variables that should work cross skin including anonymous users
	 *  - used for both, stable and beta mode (don't use
	 *    MobileContext::isBetaGroupMember in this function - T127860)
	 *
	 * @return array
	 */
	public static function getResourceLoaderMFConfigVars() {
		$vars = [];
		$config = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Config' );
		$mfScriptPath = $config->get( 'MFScriptPath' );
		$pageProps = $config->get( 'MFQueryPropModules' );
		$searchParams = $config->get( 'MFSearchAPIParams' );
		// Avoid API warnings and allow integration with optional extensions.
		if ( $mfScriptPath || ExtensionRegistry::getInstance()->isLoaded( 'PageImages' ) ) {
			$pageProps[] = 'pageimages';
			$searchParams = array_merge_recursive( $searchParams, [
				'piprop' => 'thumbnail',
				'pithumbsize' => MobilePage::SMALL_IMAGE_WIDTH,
				'pilimit' => 50,
			] );
		}

		// Get the licensing agreement that is displayed in the uploading interface.
		$vars += [
			// Page.js
			'wgMFMobileFormatterHeadings' => $config->get( 'MFMobileFormatterOptions' )['headings'],
			// extendSearchParams
			'wgMFSearchAPIParams' => $searchParams,
			'wgMFQueryPropModules' => $pageProps,
			// SearchGateway.js
			'wgMFSearchGenerator' => $config->get( 'MFSearchGenerator' ),
			// PhotoListGateway.js, SearchGateway.js
			'wgMFThumbnailSizes' => [
				'tiny' => MobilePage::TINY_IMAGE_WIDTH,
				'small' => MobilePage::SMALL_IMAGE_WIDTH,
			],
			'wgMFEnableJSConsoleRecruitment' => $config->get( 'MFEnableJSConsoleRecruitment' ),
			// Browser.js
			'wgMFDeviceWidthTablet' => self::DEVICE_WIDTH_TABLET,
			// toggle.js
			'wgMFCollapseSectionsByDefault' => $config->get( 'MFCollapseSectionsByDefault' ),
			// extendSearchParams.js
			'wgMFTrackBlockNotices' => $config->get( 'MFTrackBlockNotices' ),
		];
		return $vars;
	}

	/**
	 * @param MobileContext $context
	 * @param Config $config
	 * @return array
	 */
	private static function getWikibaseStaticConfigVars(
		MobileContext $context, Config $config
	) {
		$features = array_keys( $config->get( 'MFDisplayWikibaseDescriptions' ) );
		$result = [ 'wgMFDisplayWikibaseDescriptions' => [] ];
		/** @var FeaturesManager $featureManager */
		$featureManager = MediaWikiServices::getInstance()
			->getService( 'MobileFrontend.FeaturesManager' );

		$descriptionsEnabled = $featureManager->isFeatureAvailableForCurrentUser(
			'MFEnableWikidataDescriptions'
		);

		foreach ( $features as $feature ) {
			$result['wgMFDisplayWikibaseDescriptions'][$feature] = $descriptionsEnabled &&
				$context->shouldShowWikibaseDescriptions( $feature, $config );
		}

		return $result;
	}

	/**
	 * Should special pages be replaced with mobile formatted equivalents?
	 *
	 * @param User $user for which we need to make the decision based on user prefs
	 * @return bool whether special pages should be substituted with
	 *   mobile friendly equivalents
	 */
	public static function shouldMobileFormatSpecialPages( $user ) {
		$services = MediaWikiServices::getInstance();
		$config = $services->getService( 'MobileFrontend.Config' );
		$enabled = $config->get( 'MFEnableMobilePreferences' );

		if ( !$enabled ) {
			return true;
		}
		if ( !$user->isSafeToLoad() ) {
			// if not isSafeToLoad
			// assume an anonymous session
			// (see I2a6ef640d328106c88331da7c53785486e16a353)
			return true;
		}

		$userOption = $services->getUserOptionsLookup()->getOption(
			$user,
			self::MOBILE_PREFERENCES_SPECIAL_PAGES,
			self::ENABLE_SPECIAL_PAGE_OPTIMISATIONS
		);

		return $userOption === self::ENABLE_SPECIAL_PAGE_OPTIMISATIONS;
	}

	/**
	 * Hook for SpecialPage_initList in SpecialPageFactory.
	 *
	 * @param array &$list list of special page classes
	 */
	public function onSpecialPage_initList( &$list ) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$user = $context->getUser();
		/** @var FeaturesManager $featureManager */
		$featureManager = $services->getService( 'MobileFrontend.FeaturesManager' );

		// Perform substitutions of pages that are unsuitable for mobile
		// FIXME: Upstream these changes to core.
		if ( $context->shouldDisplayMobileView() &&
			self::shouldMobileFormatSpecialPages( $user )
		) {

			if ( $user->isSafeToLoad() &&
				!$featureManager->isFeatureAvailableForCurrentUser( 'MFUseDesktopSpecialWatchlistPage' )
			) {
				// Replace the standard watchlist view with our custom one
				$list['Watchlist'] = [
					'class' => SpecialMobileWatchlist::class,
					'services' => [
						'ConnectionProvider',
					],
				];
				$list['EditWatchlist'] = SpecialMobileEditWatchlist::class;
			}
		}
	}

	/**
	 * ListDefinedTags hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ListDefinedTags
	 *
	 * @param array &$tags The list of tags. Add your extension's tags to this array.
	 */
	public function onListDefinedTags( &$tags ) {
		$this->addDefinedTags( $tags );
	}

	/**
	 * ChangeTagsListActive hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ChangeTagsListActive
	 *
	 * @param array &$tags The list of tags. Add your extension's tags to this array.
	 */
	public function onChangeTagsListActive( &$tags ) {
		$this->addDefinedTags( $tags );
	}

	/**
	 * @param array &$tags
	 */
	public function addDefinedTags( &$tags ) {
		$tags[] = 'mobile edit';
		$tags[] = 'mobile web edit';
	}

	/**
	 * RecentChange_save hook handler that tags mobile changes
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/RecentChange_save
	 *
	 * @param RecentChange $recentChange
	 */
	public function onRecentChange_save( $recentChange ) {
		self::onTaggableObjectCreation( $recentChange );
	}

	/**
	 * ManualLogEntryBeforePublish hook handler that tags actions logged when user uses mobile mode
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ManualLogEntryBeforePublish
	 *
	 * @param ManualLogEntry $logEntry
	 */
	public function onManualLogEntryBeforePublish( $logEntry ): void {
		self::onTaggableObjectCreation( $logEntry );
	}

	/**
	 * @param Taggable $taggable Object to tag
	 */
	public static function onTaggableObjectCreation( Taggable $taggable ) {
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$userAgent = $context->getRequest()->getHeader( "User-agent" );
		if ( $context->shouldDisplayMobileView() ) {
			$taggable->addTags( [ 'mobile edit' ] );
			// Tag as mobile web edit specifically, if it isn't coming from the apps
			if ( strpos( $userAgent, 'WikipediaApp/' ) !== 0 ) {
				$taggable->addTags( [ 'mobile web edit' ] );
			}
		}
	}

	/**
	 * AbuseFilter-generateUserVars hook handler that adds a user_mobile variable.
	 * Altering the variables generated for a specific user
	 *
	 * @see hooks.txt in AbuseFilter extension
	 * @param VariableHolder $vars object to add vars to
	 * @param User $user
	 * @param RecentChange|null $rc If the variables should be generated for an RC entry, this
	 *  is the entry. Null if it's for the current action being filtered.
	 */
	public static function onAbuseFilterGenerateUserVars( $vars, $user, RecentChange $rc = null ) {
		if ( !$rc ) {
			/** @var MobileContext $context */
			$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
			$vars->setVar( 'user_mobile', $context->shouldDisplayMobileView() );
		} else {
			$dbr = MediaWikiServices::getInstance()
				->getConnectionProvider()
				->getReplicaDatabase();

			$tags = ChangeTags::getTags( $dbr, $rc->getAttribute( 'rc_id' ) );
			$val = (bool)array_intersect( $tags, [ 'mobile edit', 'mobile web edit' ] );
			$vars->setVar( 'user_mobile', $val );
		}
	}

	/**
	 * AbuseFilter-builder hook handler that adds user_mobile variable to list
	 *  of valid vars
	 *
	 * @param array &$builder Array in AbuseFilter::getBuilderValues to add to.
	 */
	public static function onAbuseFilterBuilder( &$builder ) {
		$builder['vars']['user_mobile'] = 'user-mobile';
	}

	/**
	 * Invocation of hook SpecialPageBeforeExecute
	 *
	 * We use this hook to ensure that login/account creation pages
	 * are redirected to HTTPS if they are not accessed via HTTPS and
	 * $wgSecureLogin == true - but only when using the
	 * mobile site.
	 *
	 * @param SpecialPage $special
	 * @param string $subpage subpage name
	 */
	public function onSpecialPageBeforeExecute( $special, $subpage ) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );

		$isMobileView = $context->shouldDisplayMobileView();
		$taglines = $context->getConfig()->get( 'MFSpecialPageTaglines' );
		$name = $special->getName();

		if ( $isMobileView ) {
			$out = $special->getOutput();
			// FIXME: mobile.special.styles should be replaced with mediawiki.special module
			$out->addModuleStyles(
				[ 'mobile.special.styles' ]
			);
			// FIXME: Should be moved to MediaWiki core module.
			if ( $name === 'Userlogin' || $name === 'CreateAccount' ) {
				$out->addModules( 'mobile.special.userlogin.scripts' );
			}
			if ( array_key_exists( $name, $taglines ) ) {
				self::setTagline( $out, $out->msg( $taglines[$name] )->parse() );
			}
		}
	}

	/**
	 * PostLoginRedirect hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/PostLoginRedirect
	 *
	 * Used here to handle watchlist actions made by anons to be handled after
	 * login or account creation redirect.
	 *
	 * @inheritDoc
	 */
	public function onPostLoginRedirect( &$returnTo, &$returnToQuery, &$type ) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		if ( !$context->shouldDisplayMobileView() ) {
			return;
		}

		// If 'watch' is set from the login form, watch the requested article
		$campaign = $context->getRequest()->getVal( 'campaign' );

		// The user came from one of the drawers that prompted them to login.
		// We must watch the article per their original intent.
		if ( $campaign === 'mobile_watchPageActionCta' ||
			wfArrayToCgi( $returnToQuery ) === 'article_action=watch'
		) {
			$title = Title::newFromText( $returnTo );
			// protect against watching special pages (these cannot be watched!)
			if ( $title !== null && !$title->isSpecialPage() ) {
				$services->getWatchlistManager()->addWatch( $context->getAuthority(), $title );
			}
		}
	}

	/**
	 * BeforePageDisplay hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageDisplay
	 *
	 * @param OutputPage $out
	 * @param Skin $skin Skin object that will be used to generate the page, added in 1.13.
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		$context = MobileContext::singleton();
		$services = MediaWikiServices::getInstance();
		$config = $services->getService( 'MobileFrontend.Config' );
		$mfEnableXAnalyticsLogging = $config->get( 'MFEnableXAnalyticsLogging' );
		$mfNoIndexPages = $config->get( 'MFNoindexPages' );
		$isCanonicalLinkHandledByCore = $config->get( 'EnableCanonicalServerLink' );
		$hasMobileUrl = $context->hasMobileDomain();
		$displayMobileView = $context->shouldDisplayMobileView();

		$title = $skin->getTitle();

		// an canonical/alternate link is only useful, if the mobile and desktop URL are different
		// and $wgMFNoindexPages needs to be true
		if ( $hasMobileUrl && $mfNoIndexPages ) {
			$link = false;

			if ( !$displayMobileView ) {
				// add alternate link to desktop sites - bug T91183
				$desktopUrl = $title->getFullURL();
				$link = [
					'rel' => 'alternate',
					'media' => 'only screen and (max-width: ' . self::DEVICE_WIDTH_TABLET . ')',
					'href' => $context->getMobileUrl( $desktopUrl ),
				];
			} elseif ( !$isCanonicalLinkHandledByCore ) {
				$link = [
					'rel' => 'canonical',
					'href' => $title->getFullURL(),
				];
			}

			if ( $link ) {
				$out->addLink( $link );
			}
		}

		// set the vary header to User-Agent, if mobile frontend auto detects, if the mobile
		// view should be delivered and the same url is used for desktop and mobile devices
		// Bug: T123189
		if (
			$config->get( 'MFVaryOnUA' ) &&
			$config->get( 'MFAutodetectMobileView' ) &&
			!$hasMobileUrl
		) {
			$out->addVaryHeader( 'User-Agent' );
		}

		// Set X-Analytics HTTP response header if necessary
		if ( $displayMobileView ) {
			$analyticsHeader = ( $mfEnableXAnalyticsLogging ? $context->getXAnalyticsHeader() : false );
			if ( $analyticsHeader ) {
				$resp = $out->getRequest()->response();
				$resp->header( $analyticsHeader );
			}

			// in mobile view: always add vary header
			$out->addVaryHeader( 'Cookie' );

			if ( $config->get( 'MFEnableManifest' ) ) {
				$out->addLink(
					[
						'rel' => 'manifest',
						'href' => wfAppendQuery(
							wfScript( 'api' ),
							[ 'action' => 'webapp-manifest' ]
						)
					]
				);
			}

			// In mobile mode, MediaWiki:Common.css/MediaWiki:Common.js is not loaded.
			// We load MediaWiki:Mobile.css/js instead
			// We load mobile.init so that lazy loading images works on all skins
			$out->addModules( [ 'mobile.init' ] );
			$out->addModuleStyles( [ 'mobile.init.styles' ] );

			$fontSize = $services->getUserOptionsLookup()->getOption(
				$context->getUser(), self::MOBILE_PREFERENCES_FONTSIZE
			) ?? 'small';
			$expandSections = $services->getUserOptionsLookup()->getOption(
				$context->getUser(), self::MOBILE_PREFERENCES_EXPAND_SECTIONS
			) ?? '0';

			/** @var \MobileFrontend\Amc\UserMode $userMode */
			$userMode = MediaWikiServices::getInstance()->getService( 'MobileFrontend.AMC.UserMode' );
			$amc = !$userMode->isEnabled() ? '0' : '1';
			$context->getOutput()->addHtmlClasses( [
				'mf-expand-sections-clientpref-' . $expandSections,
				'mf-font-size-clientpref-' . $fontSize,
				'mw-mf-amc-clientpref-' . $amc
			] );

			// Allow modifications in mobile only mode
			$hookRunner = new HookRunner( $services->getHookContainer() );
			$hookRunner->onBeforePageDisplayMobile( $out, $skin );
		}

		// T204691
		$theme = $config->get( 'MFManifestThemeColor' );
		if ( $theme && $displayMobileView ) {
			$out->addMeta( 'theme-color', $theme );
		}

		if ( $displayMobileView ) {
			// Adds inline script to allow opening of sections while JS is still loading
			$out->prependHTML( MakeSectionsTransform::interimTogglingSupport() );
		}
	}

	/**
	 * AfterBuildFeedLinks hook handler. Remove all feed links in mobile view.
	 *
	 * @param array &$tags Added feed links
	 */
	public function onAfterBuildFeedLinks( &$tags ) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$config = $services->getService( 'MobileFrontend.Config' );
		if ( $context->shouldDisplayMobileView() && !$config->get( 'MFRSSFeedLink' ) ) {
			$tags = [];
		}
	}

	/**
	 * Register default preferences for MobileFrontend
	 *
	 * @param array &$defaultUserOptions Reference to default options array
	 */
	public function onUserGetDefaultOptions( &$defaultUserOptions ) {
		$config = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Config' );
		if ( $config->get( 'MFEnableMobilePreferences' ) ) {
			$defaultUserOptions += [
				self::MOBILE_PREFERENCES_SPECIAL_PAGES => self::ENABLE_SPECIAL_PAGE_OPTIMISATIONS,
			];
		}
	}

	/**
	 * GetPreferences hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetPreferences
	 *
	 * @param User $user User whose preferences are being modified
	 * @param array &$preferences Preferences description array, to be fed to an HTMLForm object
	 */
	public function onGetPreferences( $user, &$preferences ) {
		$config = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Config' );
		$definition = [
			'type' => 'api',
			'default' => '',
		];
		$preferences[SpecialMobileWatchlist::FILTER_OPTION_NAME] = $definition;
		$preferences[SpecialMobileWatchlist::VIEW_OPTION_NAME] = $definition;
		$preferences[MobileContext::USER_MODE_PREFERENCE_NAME] = $definition;
		$preferences[self::MOBILE_PREFERENCES_EDITOR] = $definition;
		$preferences[self::MOBILE_PREFERENCES_FONTSIZE] = $definition;
		$preferences[self::MOBILE_PREFERENCES_EXPAND_SECTIONS] = $definition;

		if ( $config->get( 'MFEnableMobilePreferences' ) ) {
			$preferences[ self::MOBILE_PREFERENCES_SPECIAL_PAGES ] = [
				'type' => 'check',
				'label-message' => 'mobile-frontend-special-pages-pref',
				'help-message' => 'mobile-frontend-special-pages-pref',
				// The following messages are generated here:
				// * prefs-mobile
				'section' => self::MOBILE_PREFERENCES_SECTION
			];
		}
	}

	/**
	 * CentralAuthLoginRedirectData hook handler
	 * Saves mobile host so that the CentralAuth wiki could redirect back properly
	 *
	 * @see CentralAuthHooks::doCentralLoginRedirect in CentralAuth extension
	 * @param \MediaWiki\Extension\CentralAuth\User\CentralAuthUser $centralUser
	 * @param array &$data Redirect data
	 */
	public static function onCentralAuthLoginRedirectData( $centralUser, &$data ) {
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$server = $context->getConfig()->get( 'Server' );
		if ( $context->shouldDisplayMobileView() ) {
			$data['mobileServer'] = $context->getMobileUrl( $server );
		}
	}

	/**
	 * CentralAuthSilentLoginRedirect hook handler
	 * Points redirects from CentralAuth wiki to mobile domain if user has logged in from it
	 * @see SpecialCentralLogin in CentralAuth extension
	 * @param \MediaWiki\Extension\CentralAuth\User\CentralAuthUser $centralUser
	 * @param string &$url to redirect to
	 * @param array $info token information
	 */
	public static function onCentralAuthSilentLoginRedirect( $centralUser, &$url, $info ) {
		if ( isset( $info['mobileServer'] ) ) {
			$mobileUrlParsed = wfParseUrl( $info['mobileServer'] );
			$urlParsed = wfParseUrl( $url );
			$urlParsed['host'] = $mobileUrlParsed['host'];
			$url = wfAssembleUrl( $urlParsed );
		}
	}

	/**
	 * Sets a tagline for a given page that can be displayed by the skin.
	 *
	 * @param OutputPage $outputPage
	 * @param string $desc
	 */
	private static function setTagline( OutputPage $outputPage, $desc ) {
		$outputPage->setProperty( 'wgMFDescription', $desc );
	}

	/**
	 * Finds the wikidata tagline associated with the page
	 *
	 * @param ParserOutput $po
	 * @param callable $fallbackWikibaseDescriptionFunc A fallback to provide Wikibase description.
	 * Function takes wikibase_item as a first and only argument
	 * @return ?string the tagline as a string, or else null if none is found
	 */
	public static function findTagline( ParserOutput $po, $fallbackWikibaseDescriptionFunc ) {
		$desc = $po->getPageProperty( 'wikibase-shortdesc' );
		$item = $po->getPageProperty( 'wikibase_item' );
		if ( $desc === null && $item && $fallbackWikibaseDescriptionFunc ) {
			return $fallbackWikibaseDescriptionFunc( $item );
		}
		return $desc;
	}

	/**
	 * OutputPageParserOutput hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/OutputPageParserOutput
	 *
	 * @param OutputPage $outputPage the OutputPage object to which wikitext is added
	 * @param ParserOutput $po
	 */
	public function onOutputPageParserOutput( $outputPage, $po ): void {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$config = $services->getService( 'MobileFrontend.Config' );
		/** @var FeaturesManager $featureManager */
		$featureManager = $services->getService( 'MobileFrontend.FeaturesManager' );
		$title = $outputPage->getTitle();
		$descriptionsEnabled = !$title->isMainPage() &&
			$title->getNamespace() === NS_MAIN &&
			$featureManager->isFeatureAvailableForCurrentUser(
				'MFEnableWikidataDescriptions'
			) && $context->shouldShowWikibaseDescriptions( 'tagline', $config );

		// Only set the tagline if the feature has been enabled and the article is in the main namespace
		if ( $context->shouldDisplayMobileView() && $descriptionsEnabled ) {
			$desc = self::findTagline( $po, static function ( $item ) {
				return ExtMobileFrontend::getWikibaseDescription( $item );
			} );
			if ( $desc ) {
				self::setTagline( $outputPage, $desc );
			}
		}
	}

	/**
	 * HTMLFileCache::useFileCache hook handler
	 * Disables file caching for mobile pageviews
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/HTMLFileCache::useFileCache
	 *
	 * @param IContextSource $context
	 * @return bool
	 */
	public function onHTMLFileCache__useFileCache( $context ) {
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		return !$context->shouldDisplayMobileView();
	}

	/**
	 * LoginFormValidErrorMessages hook handler to promote MF specific error message be valid.
	 *
	 * @param array &$messages Array of already added messages
	 */
	public function onLoginFormValidErrorMessages( array &$messages ) {
		$messages = array_merge( $messages,
			[
				// watchstart sign up CTA
				'mobile-frontend-watchlist-signup-action',
				// Watchlist and watchstar sign in CTA
				'mobile-frontend-watchlist-purpose',
				// Edit button sign in CTA
				'mobile-frontend-edit-login-action',
				// Edit button sign-up CTA
				'mobile-frontend-edit-signup-action',
				'mobile-frontend-donate-image-login-action',
				// default message
				'mobile-frontend-generic-login-new',
			]
		);
	}

	/**
	 * Handler for MakeGlobalVariablesScript hook.
	 * For values that depend on the current page, user or request state.
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/MakeGlobalVariablesScript
	 * @param array &$vars Variables to be added into the output
	 * @param OutputPage $out OutputPage instance calling the hook
	 */
	public function onMakeGlobalVariablesScript( &$vars, $out ): void {
		$services = MediaWikiServices::getInstance();
		/** @var \MobileFrontend\Amc\UserMode $userMode */
		$userMode = $services->getService( 'MobileFrontend.AMC.UserMode' );
		/** @var FeaturesManager $featureManager */
		$featureManager = $services->getService( 'MobileFrontend.FeaturesManager' );
		$config = $services->getService( 'MobileFrontend.Config' );

		// If the device is a mobile, Remove the category entry.
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		if ( $context->shouldDisplayMobileView() ) {
			/** @var \MobileFrontend\Amc\Outreach $outreach */
			$outreach = $services->getService( 'MobileFrontend.AMC.Outreach' );
			unset( $vars['wgCategories'] );
			$vars['wgMFMode'] = $context->isBetaGroupMember() ? 'beta' : 'stable';
			$vars['wgMFAmc'] = $userMode->isEnabled();
			$vars['wgMFAmcOutreachActive'] = $outreach->isCampaignActive();
			$vars['wgMFAmcOutreachUserEligible'] = $outreach->isUserEligible();
			$vars['wgMFLazyLoadImages'] =
				$featureManager->isFeatureAvailableForCurrentUser( 'MFLazyLoadImages' );
			$vars['wgMFEditNoticesFeatureConflict'] = self::hasEditNoticesFeatureConflict(
				$config, $context->getUser()
			);
		}
		// Needed by mobile.startup and mobile.special.watchlist.scripts.
		// Needs to know if in beta mode or not and needs to load for Minerva desktop as well.
		// Ideally this would be inside ResourceLoaderFileModuleWithMFConfig but
		// sessions are not allowed there.
		$vars += self::getWikibaseStaticConfigVars( $context, $config );
	}

	/**
	 * Check if a conflicting edit notices gadget is enabled for the current user
	 *
	 * @param Config $config
	 * @param User $user
	 * @return bool
	 */
	public static function hasEditNoticesFeatureConflict( Config $config, User $user ) {
		$gadgetName = $config->get( 'MFEditNoticesConflictingGadgetName' );
		if ( !$gadgetName ) {
			return false;
		}

		$extensionRegistry = ExtensionRegistry::getInstance();
		if ( $extensionRegistry->isLoaded( 'Gadgets' ) ) {
			// @phan-suppress-next-line PhanUndeclaredClassMethod
			$gadgetsRepo = GadgetRepo::singleton();
			$match = array_search( $gadgetName, $gadgetsRepo->getGadgetIds(), true );
			if ( $match !== false ) {
				try {
					return $gadgetsRepo->getGadget( $gadgetName )
						->isEnabled( $user );
				} catch ( \InvalidArgumentException $e ) {
					return false;
				}
			}
		}
		return false;
	}

	/**
	 * Handler for TitleSquidURLs hook to add copies of the cache purge
	 * URLs which are transformed according to the wgMobileUrlTemplate, so
	 * that both mobile and non-mobile URL variants get purged.
	 *
	 * @see * https://www.mediawiki.org/wiki/Manual:Hooks/TitleSquidURLs
	 * @param Title $title the article title
	 * @param array &$urls the set of URLs to purge
	 */
	public function onTitleSquidURLs( $title, &$urls ) {
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		foreach ( $urls as $url ) {
			$newUrl = $context->getMobileUrl( $url );
			if ( $newUrl !== false && $newUrl !== $url ) {
				$urls[] = $newUrl;
			}
		}
	}

	/**
	 * Handler for the AuthChangeFormFields hook to add a logo on top of
	 * the login screen. This is the AuthManager equivalent of changeUserLoginCreateForm.
	 * @param AuthenticationRequest[] $requests AuthenticationRequest objects array
	 * @param array $fieldInfo Field description as given by AuthenticationRequest::mergeFieldInfo
	 * @param array &$formDescriptor A form descriptor suitable for the HTMLForm constructor
	 * @param string $action One of the AuthManager::ACTION_* constants
	 */
	public function onAuthChangeFormFields(
		$requests, $fieldInfo, &$formDescriptor, $action
	) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$config = $services->getService( 'MobileFrontend.Config' );
		$logos = RL\SkinModule::getAvailableLogos( $config );
		$mfLogo = $logos['icon'] ?? false;

		// do nothing in desktop mode
		if (
			$context->shouldDisplayMobileView() && $mfLogo
			&& in_array( $action, [ AuthManager::ACTION_LOGIN, AuthManager::ACTION_CREATE ], true )
		) {
			$logoHtml = Html::rawElement( 'div', [ 'class' => 'mw-mf-watermark' ],
				Html::element( 'img', [ 'src' => $mfLogo, 'alt' => '' ] ) );
			$formDescriptor = [
				'mfLogo' => [
					'type' => 'info',
					'default' => $logoHtml,
					'raw' => true,
				],
			] + $formDescriptor;
		}
	}

	/**
	 * Add the base mobile site URL to the siteinfo API output.
	 * @param ApiQuerySiteinfo $module
	 * @param array &$result Api result array
	 */
	public function onAPIQuerySiteInfoGeneralInfo( $module, &$result ) {
		global $wgCanonicalServer;
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$result['mobileserver'] = $context->getMobileUrl( $wgCanonicalServer );
	}
}
