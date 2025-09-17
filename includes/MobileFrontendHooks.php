<?php

use MediaWiki\Actions\ActionEntryPoint;
use MediaWiki\Api\ApiQuerySiteinfo;
use MediaWiki\Api\Hook\APIQuerySiteInfoGeneralInfoHook;
use MediaWiki\Auth\AuthenticationRequest;
use MediaWiki\Auth\AuthManager;
use MediaWiki\Cache\Hook\HTMLFileCache__useFileCacheHook;
use MediaWiki\ChangeTags\Hook\ChangeTagsListActiveHook;
use MediaWiki\ChangeTags\Hook\ListDefinedTagsHook;
use MediaWiki\ChangeTags\Taggable;
use MediaWiki\Config\Config;
use MediaWiki\Context\IContextSource;
use MediaWiki\Extension\AbuseFilter\Variables\VariableHolder;
use MediaWiki\Extension\Gadgets\GadgetRepo;
use MediaWiki\Hook\ApiBeforeMainHook;
use MediaWiki\Hook\LoginFormValidErrorMessagesHook;
use MediaWiki\Hook\ManualLogEntryBeforePublishHook;
use MediaWiki\Hook\MediaWikiPerformActionHook;
use MediaWiki\Hook\PostLoginRedirectHook;
use MediaWiki\Hook\RecentChange_saveHook;
use MediaWiki\Hook\RequestContextCreateSkinHook;
use MediaWiki\Hook\SkinAddFooterLinksHook;
use MediaWiki\Hook\SkinAfterBottomScriptsHook;
use MediaWiki\Hook\TitleSquidURLsHook;
use MediaWiki\HookContainer\HookContainer;
use MediaWiki\Html\Html;
use MediaWiki\Logging\ManualLogEntry;
use MediaWiki\MainConfigNames;
use MediaWiki\MediaWikiServices;
use MediaWiki\Output\Hook\AfterBuildFeedLinksHook;
use MediaWiki\Output\Hook\BeforePageDisplayHook;
use MediaWiki\Output\Hook\BeforePageRedirectHook;
use MediaWiki\Output\Hook\GetCacheVaryCookiesHook;
use MediaWiki\Output\Hook\MakeGlobalVariablesScriptHook;
use MediaWiki\Output\Hook\OutputPageBeforeHTMLHook;
use MediaWiki\Output\Hook\OutputPageBodyAttributesHook;
use MediaWiki\Output\Hook\OutputPageParserOutputHook;
use MediaWiki\Output\OutputPage;
use MediaWiki\Page\Article;
use MediaWiki\Page\Hook\ArticleParserOptionsHook;
use MediaWiki\Page\Hook\BeforeDisplayNoArticleTextHook;
use MediaWiki\Parser\ParserOptions;
use MediaWiki\Parser\ParserOutput;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\RecentChanges\RecentChange;
use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\Request\WebRequest;
use MediaWiki\ResourceLoader as RL;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderBeforeResponseHook;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderSiteModulePagesHook;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderSiteStylesModulePagesHook;
use MediaWiki\ResourceLoader\ResourceLoader;
use MediaWiki\Skin\Skin;
use MediaWiki\Skin\SkinException;
use MediaWiki\Skin\SkinFactory;
use MediaWiki\SpecialPage\Hook\AuthChangeFormFieldsHook;
use MediaWiki\SpecialPage\Hook\SpecialPage_initListHook;
use MediaWiki\SpecialPage\Hook\SpecialPageBeforeExecuteHook;
use MediaWiki\SpecialPage\SpecialPage;
use MediaWiki\Title\Title;
use MediaWiki\User\Hook\UserGetDefaultOptionsHook;
use MediaWiki\User\Options\UserOptionsLookup;
use MediaWiki\User\User;
use MediaWiki\Utils\UrlUtils;
use MediaWiki\Watchlist\WatchlistManager;
use MobileFrontend\Api\ApiParseExtender;
use MobileFrontend\ContentProviders\DefaultContentProvider;
use MobileFrontend\Features\FeaturesManager;
use MobileFrontend\Hooks\HookRunner;
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
	ApiBeforeMainHook,
	AuthChangeFormFieldsHook,
	RequestContextCreateSkinHook,
	BeforeDisplayNoArticleTextHook,
	OutputPageBeforeHTMLHook,
	OutputPageBodyAttributesHook,
	ResourceLoaderBeforeResponseHook,
	ResourceLoaderSiteStylesModulePagesHook,
	ResourceLoaderSiteModulePagesHook,
	SkinAfterBottomScriptsHook,
	SkinAddFooterLinksHook,
	BeforePageRedirectHook,
	MediaWikiPerformActionHook,
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
	ArticleParserOptionsHook,
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
	// This should always be kept in sync with Codex `@min-width-breakpoint-tablet`
	// in mediawiki.skin.variables.less
	private const DEVICE_WIDTH_TABLET = '640px';

	private HookContainer $hookContainer;
	private Config $config;
	private SkinFactory $skinFactory;
	private UserOptionsLookup $userOptionsLookup;
	private WatchlistManager $watchlistManager;
	private MobileContext $mobileContext;
	private FeaturesManager $featuresManager;
	private ?GadgetRepo $gadgetRepo;
	private MobileFrontendSkinHooks $skinHooks;

	public function __construct(
		HookContainer $hookContainer,
		Config $config,
		SkinFactory $skinFactory,
		UrlUtils $urlUtils,
		UserOptionsLookup $userOptionsLookup,
		WatchlistManager $watchlistManager,
		MobileContext $mobileContext,
		FeaturesManager $featuresManager,
		?GadgetRepo $gadgetRepo
	) {
		$this->hookContainer = $hookContainer;
		$this->config = $config;
		$this->skinFactory = $skinFactory;
		$this->userOptionsLookup = $userOptionsLookup;
		$this->watchlistManager = $watchlistManager;
		$this->mobileContext = $mobileContext;
		$this->featuresManager = $featuresManager;
		$this->gadgetRepo = $gadgetRepo;
		$this->skinHooks = new MobileFrontendSkinHooks( $urlUtils );
	}

	/**
	 * Obtain the default mobile skin
	 *
	 * @throws SkinException If a factory function isn't registered for the skin name
	 * @return Skin
	 */
	protected function getDefaultMobileSkin(): Skin {
		$defaultSkin = $this->config->get( 'DefaultMobileSkin' ) ?:
			$this->config->get( MainConfigNames::DefaultSkin );
		return $this->skinFactory->makeSkin( Skin::normalizeKey( $defaultSkin ) );
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
		$mobileContext = $this->mobileContext;

		// If mobileaction is set, save toggling cookie and do a redirect
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
		$userSkin = $context->getRequest()->getRawVal( 'useskin' ) ??
			$this->userOptionsLookup->getOption(
				$context->getUser(), 'mobileskin'
			);
		if ( $userSkin && Skin::normalizeKey( $userSkin ) === $userSkin ) {
			$skin = $this->skinFactory->makeSkin( $userSkin );
		} else {
			$skin = $this->getDefaultMobileSkin();
		}

		$hookRunner = new HookRunner( $this->hookContainer );
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
		$context = $this->mobileContext;
		if ( $key === 'places' ) {
			if ( $context->shouldDisplayMobileView() ) {
				$terms = $this->skinHooks->getTermsLink( $skin );
				if ( $terms ) {
					$footerLinks['terms-use'] = $terms;
				}
				$footerLinks['desktop-toggle'] = $this->skinHooks->getDesktopViewLink( $skin, $context );
			} else {
				// If desktop site append a mobile view link
				$footerLinks['mobileview'] =
					$this->skinHooks->getMobileViewLink( $skin, $context );
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
		// TODO: We may want to enable the following script on Desktop Minerva...
		// ... when Minerva is widely used.
		if (
			$this->mobileContext->shouldDisplayMobileView() &&
			$this->featuresManager->isFeatureAvailableForCurrentUser( 'MFLazyLoadImages' )
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
		$displayMobileView = $this->mobileContext->shouldDisplayMobileView();

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

		$context = $this->mobileContext;
		$title = $out->getTitle();
		$displayMobileView = $context->shouldDisplayMobileView();

		if ( !$title ) {
			return;
		}

		$options = $this->config->get( 'MFMobileFormatterOptions' );
		$excludeNamespaces = $options['excludeNamespaces'] ?? [];
		// Perform a few extra changes if we are in mobile mode
		$namespaceAllowed = !$title->inNamespaces( $excludeNamespaces );

		$provider = new DefaultContentProvider( $text );
		$originalProviderClass = DefaultContentProvider::class;
		( new HookRunner( $this->hookContainer ) )->onMobileFrontendContentProvider(
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
		$isMobile = $this->mobileContext->shouldDisplayMobileView();

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
		$shouldDisplayMobileView = $this->mobileContext->shouldDisplayMobileView();
		if ( !$shouldDisplayMobileView ) {
			return;
		}

		// T45123: force mobile URLs only for local redirects
		if ( $this->mobileContext->isLocalUrl( $redirect ) ) {
			$redirect = $this->mobileContext->getMobileUrl( $redirect );
		}
	}

	/**
	 * This hook is called early on api.php requests.
	 *
	 * @param ApiMain &$main
	 * @return void
	 */
	public function onApiBeforeMain( &$main ) {
		// T390929: api.php varies on MobileContext::shouldDisplayMobileView(),
		// based on skin involvement (e.g. api.php?action=parse&useskin),
		// and various extension hooks (e.g. URLs returned by query modules).
		//
		// NOTE: This OutputPage object is discarded and replaced for ApiHelp responses,
		// such as the /w/api.php landing page. This is fine because those are personalised
		// and uncachable (Cache-Control: private).
		$mobileHeader = $this->config->get( 'MFMobileHeader' );
		if ( $mobileHeader ) {
			$main->getOutput()->addVaryHeader( $mobileHeader );
		}
	}

	/**
	 * This hook is called early on load.php requests.
	 *
	 * @param RL\Context $context
	 * @param string[] &$extraHeaders
	 */
	public function onResourceLoaderBeforeResponse( RL\Context $context, array &$extraHeaders ): void {
		// T390929: load.php varies when $wgMFCustomSiteModules is enabled,
		// through the onResourceLoaderSiteStylesModulePages and onResourceLoaderSiteModulePages
		// hooks in this file.
		global $wgMFMobileHeader, $wgMFCustomSiteModules;
		if ( $wgMFMobileHeader
			&& $wgMFCustomSiteModules
			&& array_intersect( $context->getModules(), [ 'startup', 'site', 'site.styles' ] )
		) {
			$extraHeaders[] = "Vary: $wgMFMobileHeader";
		}
	}

	/**
	 * This hook is called early on index.php requests.
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/MediaWikiPerformActionHook
	 *
	 *
	 * @param OutputPage $output Context output
	 * @param Article $article Article on which the action will be performed
	 * @param Title $title Title on which the action will be performed
	 * @param User $user Context user
	 * @param WebRequest $request Context request
	 * @param ActionEntryPoint $entryPoint
	 * @return void
	 */
	public function onMediaWikiPerformAction( $output, $article, $title, $user,
		$request, $entryPoint
	) {
		// T390929: index.php varies on MobileContext::shouldDisplayMobileView,
		// especially in onRequestContextCreateSkin and onBeforePageRedirect.
		$mobileHeader = $this->config->get( 'MFMobileHeader' );
		if ( $mobileHeader ) {
			$output->addVaryHeader( $mobileHeader );
		}

		// Set Diff page to diff-only mode for mobile view
		// this code should only apply to mobile view.
		if ( $this->mobileContext->shouldDisplayMobileView() ) {
			// Default to diff-only mode on mobile diff pages if not specified.
			if ( $request->getCheck( 'diff' ) && !$request->getCheck( 'diffonly' ) ) {
				$request->setVal( 'diffonly', 'true' );
			}
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
		$ctx = $this->mobileContext;
		// Use Mobile.css instead of MediaWiki:Common.css on mobile views.
		if ( $ctx->shouldDisplayMobileView() && $this->config->get( 'MFCustomSiteModules' ) ) {
			unset( $pages['MediaWiki:Common.css'] );
			unset( $pages['MediaWiki:Print.css'] );
			if ( $this->config->get( 'MFSiteStylesRenderBlocking' ) ) {
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
		$ctx = $this->mobileContext;
		// Use Mobile.js instead of MediaWiki:Common.js and MediaWiki:<skinname.js> on mobile views.
		if ( $ctx->shouldDisplayMobileView() && $this->config->get( 'MFCustomSiteModules' ) ) {
			unset( $pages['MediaWiki:Common.js'] );
			$pages['MediaWiki:Mobile.js'] = [ 'type' => 'script' ];
			if ( !$this->config->get( 'MFSiteStylesRenderBlocking' ) ) {
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
		// Enables mobile cookies on wikis w/o mobile domain
		$cookies[] = MobileContext::USEFORMAT_COOKIE_NAME;
		// Don't redirect to mobile if user had explicitly opted out of it
		$cookies[] = MobileContext::STOP_MOBILE_REDIRECT_COOKIE_NAME;

		if (
			$this->mobileContext->shouldDisplayMobileView() ||
			!$this->mobileContext->hasMobileDomain()
		) {
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

		// Get the licensing agreement that is displayed in the uploading interface.
		$vars += [
			'wgMFEnableJSConsoleRecruitment' => $config->get( 'MFEnableJSConsoleRecruitment' ),
			// Browser.js
			'wgMFDeviceWidthTablet' => self::DEVICE_WIDTH_TABLET,
			// src/mobile.editor.overlay
			'wgMFTrackBlockNotices' => $config->get( 'MFTrackBlockNotices' ),
		];
		return $vars;
	}

	/**
	 * @param MobileContext $context
	 * @return array
	 */
	private function getWikibaseStaticConfigVars(
		MobileContext $context
	) {
		$features = array_keys( $this->config->get( 'MFDisplayWikibaseDescriptions' ) );
		$result = [ 'wgMFDisplayWikibaseDescriptions' => [] ];
		$descriptionsEnabled = $this->featuresManager->isFeatureAvailableForCurrentUser(
			'MFEnableWikidataDescriptions'
		);

		foreach ( $features as $feature ) {
			$result['wgMFDisplayWikibaseDescriptions'][$feature] = $descriptionsEnabled &&
				$context->shouldShowWikibaseDescriptions( $feature, $this->config );
		}

		return $result;
	}

	/**
	 * Should special pages be replaced with mobile formatted equivalents?
	 *
	 * @internal
	 * @param User $user for which we need to make the decision based on user prefs
	 * @return bool whether special pages should be substituted with
	 *   mobile friendly equivalents
	 */
	public function shouldMobileFormatSpecialPages( $user ) {
		$enabled = $this->config->get( 'MFEnableMobilePreferences' );

		if ( !$enabled ) {
			return true;
		}
		if ( !$user->isSafeToLoad() ) {
			// if not isSafeToLoad
			// assume an anonymous session
			// (see I2a6ef640d328106c88331da7c53785486e16a353)
			return true;
		}

		$userOption = $this->userOptionsLookup->getOption(
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
		$user = $this->mobileContext->getUser();

		// Perform substitutions of pages that are unsuitable for mobile
		// FIXME: Upstream these changes to core.
		if (
			$this->mobileContext->shouldDisplayMobileView() &&
			$this->shouldMobileFormatSpecialPages( $user ) &&
			$user->isSafeToLoad()
		) {
			if (
				!$this->featuresManager->isFeatureAvailableForCurrentUser( 'MFUseDesktopSpecialEditWatchlistPage' )
			) {
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
	public static function onAbuseFilterGenerateUserVars( $vars, $user, ?RecentChange $rc = null ) {
		$services = MediaWikiServices::getInstance();

		if ( !$rc ) {
			/** @var MobileContext $context */
			$context = $services->getService( 'MobileFrontend.Context' );
			$vars->setVar( 'user_mobile', $context->shouldDisplayMobileView() );
		} else {

			$dbr = $services->getConnectionProvider()->getReplicaDatabase();

			$tags = $services->getChangeTagsStore()->getTags( $dbr, $rc->getAttribute( 'rc_id' ) );
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
		$isMobileView = $this->mobileContext->shouldDisplayMobileView();
		$taglines = $this->mobileContext->getConfig()->get( 'MFSpecialPageTaglines' );
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
		$context = $this->mobileContext;

		if ( !$context->shouldDisplayMobileView() ) {
			return;
		}

		// If 'watch' is set from the login form, watch the requested article
		$campaign = $context->getRequest()->getRawVal( 'campaign' );

		// The user came from one of the drawers that prompted them to login.
		// We must watch the article per their original intent.
		if ( $campaign === 'mobile_watchPageActionCta' ||
			wfArrayToCgi( $returnToQuery ) === 'article_action=watch'
		) {
			$title = Title::newFromText( $returnTo );
			// protect against watching special pages (these cannot be watched!)
			if ( $title !== null && !$title->isSpecialPage() ) {
				$this->watchlistManager->addWatch( $context->getAuthority(), $title );
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
		$context = $this->mobileContext;
		$mfEnableXAnalyticsLogging = $this->config->get( 'MFEnableXAnalyticsLogging' );
		$mfNoIndexPages = $this->config->get( 'MFNoindexPages' );
		$isCanonicalLinkHandledByCore = $this->config->get( 'EnableCanonicalServerLink' );
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
			$this->config->get( 'MFVaryOnUA' ) &&
			$this->config->get( 'MFAutodetectMobileView' ) &&
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

			if ( $this->config->get( 'MFEnableManifest' ) ) {
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

			$fontSize = $this->userOptionsLookup->getOption(
				$context->getUser(), self::MOBILE_PREFERENCES_FONTSIZE
			) ?? 'small';
			$expandSections = $this->userOptionsLookup->getOption(
				$context->getUser(), self::MOBILE_PREFERENCES_EXPAND_SECTIONS
			) ? '1' : '0';

			/** @var \MobileFrontend\Amc\UserMode $userMode */
			$userMode = MediaWikiServices::getInstance()->getService( 'MobileFrontend.AMC.UserMode' );
			$amc = !$userMode->isEnabled() ? '0' : '1';
			$context->getOutput()->addHtmlClasses( [
				'mf-expand-sections-clientpref-' . $expandSections,
				'mf-font-size-clientpref-' . $fontSize,
				'mw-mf-amc-clientpref-' . $amc
			] );
		}

		// T204691
		$theme = $this->config->get( 'MFManifestThemeColor' );
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
		if (
			$this->mobileContext->shouldDisplayMobileView() &&
			!$this->config->get( 'MFRSSFeedLink' )
		) {
			$tags = [];
		}
	}

	/**
	 * Register default preferences for MobileFrontend
	 *
	 * @param array &$defaultUserOptions Reference to default options array
	 */
	public function onUserGetDefaultOptions( &$defaultUserOptions ) {
		if ( $this->config->get( 'MFEnableMobilePreferences' ) ) {
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
		$definition = [
			'type' => 'api',
			'default' => '',
		];
		$preferences[MobileContext::USER_MODE_PREFERENCE_NAME] = $definition;
		$preferences[self::MOBILE_PREFERENCES_EDITOR] = $definition;
		$preferences[self::MOBILE_PREFERENCES_FONTSIZE] = $definition;
		$preferences[self::MOBILE_PREFERENCES_EXPAND_SECTIONS] = $definition;

		if ( $this->config->get( 'MFEnableMobilePreferences' ) ) {
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
			$urlUtils = MediaWikiServices::getInstance()->getUrlUtils();
			$mobileUrlParsed = $urlUtils->parse( $info['mobileServer'] );
			$urlParsed = $urlUtils->parse( $url );
			$urlParsed['host'] = $mobileUrlParsed['host'] ?? '';
			$url = UrlUtils::assemble( $urlParsed );
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
		$title = $outputPage->getTitle();
		$descriptionsEnabled = !$title->isMainPage() &&
			$title->getNamespace() === NS_MAIN &&
			$this->featuresManager->isFeatureAvailableForCurrentUser(
				'MFEnableWikidataDescriptions'
			) && $this->mobileContext->shouldShowWikibaseDescriptions( 'tagline', $this->config );

		// Only set the tagline if the feature has been enabled and the article is in the main namespace
		if ( $this->mobileContext->shouldDisplayMobileView() && $descriptionsEnabled ) {
			$desc = self::findTagline( $po, static function ( $item ) {
				return ExtMobileFrontend::getWikibaseDescription( $item );
			} );
			if ( $desc ) {
				self::setTagline( $outputPage, $desc );
			}
		}
	}

	/**
	 * ArticleParserOptions hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ArticleParserOptions
	 *
	 * @param Article $article
	 * @param ParserOptions $parserOptions
	 */
	public function onArticleParserOptions( Article $article, ParserOptions $parserOptions ) {
		// while the parser is actively being migrated, we rely on the ParserMigration extension for using Parsoid
		if ( ExtensionRegistry::getInstance()->isLoaded( 'ParserMigration' ) ) {
			$context = $this->mobileContext;
			$oracle = MediaWikiServices::getInstance()->getService( 'ParserMigration.Oracle' );

			$shouldUseParsoid =
				$oracle->shouldUseParsoid( $context->getUser(), $context->getRequest(), $article->getTitle() );

			// set the collapsible sections parser flag so that section content is wrapped in a div for easier targeting
			// only if we're in mobile view and parsoid is enabled
			if ( $context->shouldDisplayMobileView() && $shouldUseParsoid ) {
				$parserOptions->setCollapsibleSections();
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
		return !$this->mobileContext->shouldDisplayMobileView();
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

		// If the device is a mobile, Remove the category entry.
		$context = $this->mobileContext;
		if ( $context->shouldDisplayMobileView() ) {
			/** @var \MobileFrontend\Amc\Outreach $outreach */
			$outreach = $services->getService( 'MobileFrontend.AMC.Outreach' );
			unset( $vars['wgCategories'] );
			$vars['wgMFMode'] = $context->isBetaGroupMember() ? 'beta' : 'stable';
			$vars['wgMFAmc'] = $userMode->isEnabled();
			$vars['wgMFAmcOutreachActive'] = $outreach->isCampaignActive();
			$vars['wgMFAmcOutreachUserEligible'] = $outreach->isUserEligible();
			$vars['wgMFLazyLoadImages'] =
				$this->featuresManager->isFeatureAvailableForCurrentUser( 'MFLazyLoadImages' );
			$vars['wgMFEditNoticesFeatureConflict'] = $this->hasEditNoticesFeatureConflict(
				$this->config, $context->getUser()
			);
		}
		// Needed by mobile.startup and mobile.special.watchlist.scripts.
		// Needs to know if in beta mode or not and needs to load for Minerva desktop as well.
		// Ideally this would be inside ResourceLoaderFileModuleWithMFConfig but
		// sessions are not allowed there.
		$vars += $this->getWikibaseStaticConfigVars( $context );
	}

	/**
	 * Check if a conflicting edit notices gadget is enabled for the current user
	 *
	 * @param Config $config
	 * @param User $user
	 * @return bool
	 */
	private function hasEditNoticesFeatureConflict( Config $config, User $user ): bool {
		$gadgetName = $config->get( 'MFEditNoticesConflictingGadgetName' );
		if ( !$gadgetName ) {
			return false;
		}

		if ( $this->gadgetRepo ) {
			$match = array_search( $gadgetName, $this->gadgetRepo->getGadgetIds(), true );
			if ( $match !== false ) {
				try {
					return $this->gadgetRepo->getGadget( $gadgetName )
						->isEnabled( $user );
				} catch ( \InvalidArgumentException ) {
					return false;
				}
			}
		}
		return false;
	}

	/**
	 * Handler for TitleSquidURLs hook to add copies of the cache purge
	 * URLs which are transformed according to the wgMobileUrlCallback, so
	 * that both mobile and non-mobile URL variants get purged.
	 *
	 * @see * https://www.mediawiki.org/wiki/Manual:Hooks/TitleSquidURLs
	 * @param Title $title the article title
	 * @param array &$urls the set of URLs to purge
	 */
	public function onTitleSquidURLs( $title, &$urls ) {
		foreach ( $urls as $url ) {
			$newUrl = $this->mobileContext->getMobileUrl( $url );
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
		$logos = RL\SkinModule::getAvailableLogos( $this->config );
		$mfLogo = $logos['icon'] ?? false;

		// do nothing in desktop mode
		if (
			$this->mobileContext->shouldDisplayMobileView() && $mfLogo
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
		$result['mobileserver'] = $this->mobileContext->getMobileUrl( $wgCanonicalServer );
	}
}
