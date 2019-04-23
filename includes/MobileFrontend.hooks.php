<?php

use MediaWiki\Auth\AuthManager;
use MediaWiki\Auth\AuthenticationRequest;
use MediaWiki\ChangeTags\Taggable;

/**
 * Hook handlers for MobileFrontend extension
 *
 * Hook handler method names should be in the form of:
 *	on<HookName>()
 * For intance, the hook handler for the 'RequestContextCreateSkin' would be called:
 *	onRequestContextCreateSkin()
 *
 * If your hook changes the behaviour of the Minerva skin, you are in the wrong place.
 * Any changes relating to Minerva should go into Minerva.hooks.php
 */
class MobileFrontendHooks {
	const MOBILE_PREFERENCES_SECTION = 'rendering/mobile';
	const MOBILE_PREFERENCES_SPECIAL_PAGES = 'mobile-specialpages';
	const ENABLE_SPECIAL_PAGE_OPTIMISATIONS = '1';
	// This should always be kept in sync with @width-breakpoint-tablet
	// in resources/src/mediawiki.less/mediawiki.ui/variables.less
	const DEVICE_WIDTH_TABLET = '720px';

	/**
	 * Enables the global booleans $wgHTMLFormAllowTableFormat and $wgUseMediaWikiUIEverywhere
	 * for mobile users.
	 */
	private static function enableMediaWikiUI() {
		// FIXME: Temporary variables, will be deprecated in core in the future
		global $wgHTMLFormAllowTableFormat, $wgUseMediaWikiUIEverywhere;

		$mobileContext = MobileContext::singleton();

		if ( $mobileContext->shouldDisplayMobileView() && !$mobileContext->isBlacklistedPage() ) {
			// Force non-table based layouts (see bug 63428)
			$wgHTMLFormAllowTableFormat = false;
			// Turn on MediaWiki UI styles so special pages with form are styled.
			// FIXME: Remove when this becomes the default.
			$wgUseMediaWikiUIEverywhere = true;
		}
	}

	/**
	 * Obtain the default mobile skin
	 *
	 * @param IContextSource $context ContextSource interface
	 * @param MobileContext $mobileContext
	 * @throws RuntimeException if MFDefaultSkinClass is incorrectly configured
	 * @return Skin
	 */
	protected static function getDefaultMobileSkin( IContextSource $context,
		MobileContext $mobileContext
	) {
		$skinName = $mobileContext->getMFConfig()->get( 'MFDefaultSkinClass' );

		if ( class_exists( $skinName ) ) {
			$skin = new $skinName( $context );
		} else {
			throw new \RuntimeException(
				'wgMFDefaultSkinClass is not setup correctly. ' .
				'It should point to the class name of a valid skin e.g. SkinMinerva, SkinVector'
			);
		}
		return $skin;
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
	public static function onRequestContextCreateSkin( $context, &$skin ) {
		// FIXME: This shouldn't be a global, it should be possible for other extensions
		// to set this via a static variable or set function in ULS
		global $wgULSPosition;

		$mobileContext = MobileContext::singleton();

		$mobileContext->doToggling();
		if ( !$mobileContext->shouldDisplayMobileView()
			|| $mobileContext->isBlacklistedPage()
		) {
			return true;
		}

		// TODO, do we want to have a specific hook just for Mobile Features initialization
		// or do we want to reuse the RequestContextCreateSkinMobile and use MediawikiService
		// to retrieve the FeaturesManager
		// Important: This must be run before RequestContextCreateSkinMobile which may make modifications
		// to the skin based on enabled features.
		\MediaWiki\MediaWikiServices::getInstance()
			->getService( 'MobileFrontend.FeaturesManager' )
			->setup();

		// enable wgUseMediaWikiUIEverywhere
		self::enableMediaWikiUI();

		// FIXME: Remove hack around Universal Language selector bug 57091
		$wgULSPosition = 'none';

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
		$userSkin = $context->getRequest()->getVal(
			'useskin',
			$context->getUser()->getOption( 'mobileskin' )
		);
		if ( $userSkin ) {
			// Normalize the key in case the user is passing gibberish or has old preferences
			$normalizedSkin = Skin::normalizeKey( $userSkin );
			// If the skin has been normalized and is different from user input, use it
			if ( $normalizedSkin === $userSkin ) {
				$skin = $normalizedSkin;
				return false;
			}
		}

		$skin = self::getDefaultMobileSkin( $context, $mobileContext );
		Hooks::run( 'RequestContextCreateSkinMobile', [ $mobileContext, $skin ] );

		return false;
	}

	/**
	 * MediaWikiPerformAction hook handler (enable mwui for all pages)
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/MediaWikiPerformAction
	 *
	 * @param OutputPage $output
	 * @param Article $article
	 * @param Title $title Page title
	 * @param User $user User performing action
	 * @param RequestContext $request
	 * @param MediaWiki $wiki
	 * @return bool
	 */
	public static function onMediaWikiPerformAction( $output, $article, $title,
		$user, $request, $wiki
	) {
		self::enableMediaWikiUI();

		// don't prevent performAction to do anything
		return true;
	}

	/**
	 * SkinTemplateOutputPageBeforeExec hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SkinTemplateOutputPageBeforeExec
	 *
	 * Adds a link to view the current page in 'mobile view' to the desktop footer.
	 *
	 * @param Skin &$skin
	 * @param QuickTemplate &$tpl
	 * @return bool
	 */
	public static function onSkinTemplateOutputPageBeforeExec( Skin &$skin, QuickTemplate &$tpl ) {
		MobileFrontendSkinHooks::prepareFooter( $skin, $tpl );
		return true;
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
	 * @return bool
	 */
	public static function onSkinAfterBottomScripts( Skin $skin, &$html ) {
		$context = MobileContext::singleton();
		$featureManager = \MediaWiki\MediaWikiServices::getInstance()
			->getService( 'MobileFrontend.FeaturesManager' );

		// TODO: We may want to enable the following script on Desktop Minerva...
		// ... when Minerva is widely used.
		if ( $context->shouldDisplayMobileView() &&
			$featureManager->isFeatureAvailableInContext( 'MFLazyLoadImages', $context )
		) {
			$html .= Html::inlineScript( ResourceLoader::filter( 'minify-js',
				MobileFrontendSkinHooks::gradeCImageSupport()
			) );
		}
		return true;
	}

	/**
	 * OutputPageBeforeHTML hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/OutputPageBeforeHTML
	 *
	 * Applies MobileFormatter to mobile viewed content
	 * Also enables Related Articles in the footer in the beta mode.
	 * Adds inline script to allow opening of sections while JS is still loading
	 *
	 * @param OutputPage &$out the OutputPage object to which wikitext is added
	 * @param string &$text the HTML to be wrapped inside the #mw-content-text element
	 * @return bool
	 */
	public static function onOutputPageBeforeHTML( &$out, &$text ) {
		$context = MobileContext::singleton();
		$title = $context->getTitle();
		$config = $context->getMFConfig();

		if ( !$title ) {
			return true;
		}

		// Perform a few extra changes if we are in mobile mode
		$namespaceAllowed = !$title->inNamespaces(
			$config->get( 'MFMobileFormatterNamespaceBlacklist' )
		);
		$displayMobileView = $context->shouldDisplayMobileView();
		$alwaysUseProvider = $config->get( 'MFAlwaysUseContentProvider' );
		if ( $namespaceAllowed && ( $displayMobileView || $alwaysUseProvider ) ) {
			$text = ExtMobileFrontend::domParse( $out, $text, $displayMobileView );
			if ( !$title->isMainPage() ) {
				$text = MobileFrontendSkinHooks::interimTogglingSupport() . $text;
			}
		}
		return true;
	}

	/**
	 * BeforePageRedirect hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageRedirect
	 *
	 * Ensures URLs are handled properly for select special pages.
	 * @param OutputPage $out
	 * @param string &$redirect URL string, modifiable
	 * @param string &$code HTTP code (eg '301' or '302'), modifiable
	 * @return bool
	 */
	public static function onBeforePageRedirect( $out, &$redirect, &$code ) {
		$context = MobileContext::singleton();
		$shouldDisplayMobileView = $context->shouldDisplayMobileView();
		if ( !$shouldDisplayMobileView ) {
			return true;
		}

		// Bug 43123: force mobile URLs only for local redirects
		if ( $context->isLocalUrl( $redirect ) ) {
			$out->addVaryHeader( 'X-Subdomain' );
			$out->addVaryHeader( 'X-CS' );
			$redirect = $context->getMobileUrl( $redirect );
		}

		return true;
	}

	/**
	 * DiffViewHeader hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/DiffViewHeader
	 *
	 * Redirect Diff page to mobile version if appropriate
	 *
	 * @param DifferenceEngine $diff DifferenceEngine object that's calling
	 * @param Revision $oldRev Revision object of the "old" revision (may be null/invalid)
	 * @param Revision $newRev Revision object of the "new" revision
	 * @return bool
	 */
	public static function onDiffViewHeader( $diff, $oldRev, $newRev ) {
		$context = MobileContext::singleton();

		// Only do redirects to MobileDiff if user is in mobile view and it's not a special page
		if ( $context->shouldDisplayMobileView() &&
			!$diff->getContext()->getTitle()->isSpecialPage() &&
			self::shouldMobileFormatSpecialPages( $context->getUser() )
		) {
			$output = $context->getOutput();
			$newRevId = $newRev->getId();

			// The MobileDiff page currently only supports showing a single revision, so
			// only redirect to MobileDiff if we are sure this isn't a multi-revision diff.
			if ( $oldRev ) {
				// Get the revision immediately before the new revision
				$prevRev = $newRev->getPrevious();
				if ( $prevRev ) {
					$prevRevId = $prevRev->getId();
					$oldRevId = $oldRev->getId();
					if ( $prevRevId === $oldRevId ) {
						$output->redirect( SpecialPage::getTitleFor( 'MobileDiff', $newRevId )->getFullURL() );
					}
				}
			} else {
				$output->redirect( SpecialPage::getTitleFor( 'MobileDiff', $newRevId )->getFullURL() );
			}
		}

		return true;
	}

	/**
	 * GetCacheVaryCookies hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetCacheVaryCookies
	 *
	 * @param OutputPage $out
	 * @param array &$cookies array of cookies name, add a value to it
	 *                        if you want to add a cookie that have to vary cache options
	 * @return bool
	 */
	public static function onGetCacheVaryCookies( $out, &$cookies ) {
		$context = MobileContext::singleton();
		$mobileUrlTemplate = $context->getMobileUrlTemplate();

		// Enables mobile cookies on wikis w/o mobile domain
		$cookies[] = MobileContext::USEFORMAT_COOKIE_NAME;
		// Don't redirect to mobile if user had explicitly opted out of it
		$cookies[] = MobileContext::STOP_MOBILE_REDIRECT_COOKIE_NAME;

		if ( $context->shouldDisplayMobileView() || !$mobileUrlTemplate ) {
			// beta cookie
			$cookies[] = MobileContext::OPTIN_COOKIE_NAME;
		}
		// Redirect people who want so from HTTP to HTTPS. Ideally, should be
		// only for HTTP but we don't vary on protocol.
		$cookies[] = 'forceHTTPS';
		return true;
	}

	/**
	 * Varies the parser cache if responsive images should have their variants
	 * stripped from the parser output, since the transformation happens during
	 * the parse.
	 *
	 * See `$wgMFStripResponsiveImages` and `$wgMFResponsiveImageWhitelist` for
	 * more detail about the stripping of responsive images.
	 *
	 * See https://www.mediawiki.org/wiki/Manual:Hooks/PageRenderingHash for more
	 * detail about the `PageRenderingHash` hook.
	 *
	 * @param string &$confstr Reference to the parser cache key
	 * @param User $user The user that is requesting the page
	 * @param array &$forOptions The options used to generate the parser cache key
	 */
	public static function onPageRenderingHash( &$confstr, User $user, &$forOptions ) {
		if ( MobileContext::singleton()->shouldStripResponsiveImages() ) {
			$confstr .= '!responsiveimages=0';
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
	 * @return bool
	 */
	public static function getResourceLoaderMFConfigVars() {
		$vars = [];
		$context = MobileContext::singleton();
		$config = $context->getMFConfig();
		$pageProps = $config->get( 'MFQueryPropModules' );
		$searchParams = $config->get( 'MFSearchAPIParams' );
		// Avoid API warnings and allow integration with optional extensions.
		if ( ExtensionRegistry::getInstance()->isLoaded( 'PageImages' ) ) {
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
			'wgMFMobileFormatterHeadings' => $config->get( 'MFMobileFormatterHeadings' ),
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
			// EditorOverlayBase.js
			'wgMFEditorOptions' => $config->get( 'MFEditorOptions' ),
			// editor.js
			'wgMFUsePreferredEditor' => $config->get( 'MFUsePreferredEditor' ),
			// Skin.js
			'wgMFLicense' => MobileFrontendSkinHooks::getLicense( 'editor' ),
			// schemaMobileWebSearch.js
			'wgMFSchemaSearchSampleRate' => $config->get( 'MFSchemaSearchSampleRate' ),
			// schemaEditAttemptStep.js
			'wgMFSchemaEditAttemptStepOversample' => $config->get( 'MFSchemaEditAttemptStepOversample' ),
			// mobile.init
			'wgMFExperiments' => $config->get( 'MFExperiments' ),
			'wgMFEnableJSConsoleRecruitment' => $config->get( 'MFEnableJSConsoleRecruitment' ),
			// Browser.js
			'wgMFDeviceWidthTablet' => self::DEVICE_WIDTH_TABLET,
			// toggle.js
			'wgMFCollapseSectionsByDefault' => $config->get( 'MFCollapseSectionsByDefault' ),
			// extendSearchParams.js
			// The purpose of this is to report to the client that we are using a custom path
			// and signal to API requests that the origin parameter should be used.
			// A boolean would also suffice here but let's keep things simple and pass verbatim
			'wgMFContentProviderScriptPath' => $config->get( 'MFContentProviderScriptPath' ),
		];
		return $vars;
	}

	/**
	 * @param MobileContext $context
	 * @return array
	 */
	private static function getWikibaseStaticConfigVars( MobileContext $context ) {
		$config = $context->getMFConfig();
		$features = array_keys( $config->get( 'MFDisplayWikibaseDescriptions' ) );
		$result = [ 'wgMFDisplayWikibaseDescriptions' => [] ];
		$featureManager = \MediaWiki\MediaWikiServices::getInstance()
			->getService( 'MobileFrontend.FeaturesManager' );

		$descriptionsEnabled = $featureManager->isFeatureAvailableInContext(
			'MFEnableWikidataDescriptions',
			$context
		);

		foreach ( $features as $feature ) {
			$result['wgMFDisplayWikibaseDescriptions'][$feature] = $descriptionsEnabled &&
				$context->shouldShowWikibaseDescriptions( $feature );
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
		$ctx = MobileContext::singleton();
		$enabled = $ctx->getMFConfig()->get( 'MFEnableMobilePreferences' );

		if ( !$enabled ) {
			return true;
		} elseif ( !$user->isSafeToLoad() ) {
			// if not isSafeToLoad
			// assume an anonymous session
			// (see I2a6ef640d328106c88331da7c53785486e16a353)
			return true;
		} else {
			return $user->getOption( self::MOBILE_PREFERENCES_SPECIAL_PAGES,
				self::ENABLE_SPECIAL_PAGE_OPTIMISATIONS ) === self::ENABLE_SPECIAL_PAGE_OPTIMISATIONS;
		}
	}

	/**
	 * Hook for SpecialPage_initList in SpecialPageFactory.
	 *
	 * @param array &$list list of special page classes
	 * @return bool hook return value
	 */
	public static function onSpecialPageInitList( &$list ) {
		$ctx = MobileContext::singleton();

		// Perform substitutions of pages that are unsuitable for mobile
		// FIXME: Upstream these changes to core.
		if ( $ctx->shouldDisplayMobileView() &&
			self::shouldMobileFormatSpecialPages( $ctx->getUser() )
		) {
			// Replace the standard watchlist view with our custom one
			$list['Watchlist'] = 'SpecialMobileWatchlist';
			$list['EditWatchlist'] = 'SpecialMobileEditWatchlist';

			/* Special:MobileContributions redefines Special:History in
			 * such a way that for Special:Contributions/Foo, Foo is a
			 * username (in Special:History/Foo, Foo is a page name).
			 * Redirect people here as this is essential
			 * Special:Contributions without the bells and whistles.
			 */
			$list['Contributions'] = 'SpecialMobileContributions';
		}
		// add Special:Nearby only, if Nearby is activated
		if ( $ctx->getMFConfig()->get( 'MFNearby' ) ) {
			$list['Nearby'] = 'SpecialNearby';
		}
		return true;
	}

	/**
	 * ListDefinedTags and ChangeTagsListActive hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ListDefinedTags
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ChangeTagsListActive
	 *
	 * @param array &$tags The list of tags. Add your extension's tags to this array.
	 * @return bool
	 */
	public static function onListDefinedTags( &$tags ) {
		$tags[] = 'mobile edit';
		$tags[] = 'mobile web edit';
		return true;
	}

	/**
	 * RecentChange_save hook handler that tags mobile changes
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/RecentChange_save
	 *
	 * ManualLogEntryBeforePublish hook handler that tags actions logged when user uses mobile mode
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ManualLogEntryBeforePublish

	 * @param Taggable $taggable Object to tag
	 * @return bool
	 */
	public static function onTaggableObjectCreation( Taggable $taggable ) {
		$context = MobileContext::singleton();
		$userAgent = $context->getRequest()->getHeader( "User-agent" );
		if ( $context->shouldDisplayMobileView() ) {
			$taggable->addTags( [ 'mobile edit' ] );
			// Tag as mobile web edit specifically, if it isn't coming from the apps
			if ( strpos( $userAgent, 'WikipediaApp/' ) !== 0 ) {
				$taggable->addTags( [ 'mobile web edit' ] );
			}
		}
		return true;
	}

	/**
	 * AbuseFilter-GenerateUserVars hook handler that adds a user_mobile variable.
	 * Altering the variables generated for a specific user
	 *
	 * @see hooks.txt in AbuseFilter extension
	 * @param AbuseFilterVariableHolder $vars object to add vars to
	 * @param User $user
	 * @return bool
	 */
	public static function onAbuseFilterGenerateUserVars( $vars, $user ) {
		$context = MobileContext::singleton();

		if ( $context->shouldDisplayMobileView() ) {
			$vars->setVar( 'user_mobile', true );
		} else {
			$vars->setVar( 'user_mobile', false );
		}

		return true;
	}

	/**
	 * AbuseFilter-builder hook handler that adds user_mobile variable to list
	 *  of valid vars
	 *
	 * @param array &$builder Array in AbuseFilter::getBuilderValues to add to.
	 * @return bool
	 */
	public static function onAbuseFilterBuilder( &$builder ) {
		$builder['vars']['user_mobile'] = 'user-mobile';
		return true;
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
	 * @return bool
	 */
	public static function onSpecialPageBeforeExecute( SpecialPage $special, $subpage ) {
		$context = MobileContext::singleton();
		$isMobileView = $context->shouldDisplayMobileView();
		$taglines = $context->getConfig()->get( 'MFSpecialPageTaglines' );
		$name = $special->getName();

		if ( $isMobileView ) {
			$special->getOutput()->addModuleStyles(
				[ 'mobile.special.styles', 'mobile.messageBox.styles' ]
			);
			if ( $name === 'Userlogin' || $name === 'CreateAccount' ) {
				$special->getOutput()->addModules( 'mobile.special.userlogin.scripts' );
			}
			if ( array_key_exists( $name, $taglines ) ) {
				self::setTagline( $special->getOutput(),
					wfMessage( $taglines[$name] ) );
			}
		}

		return true;
	}

	/**
	 * UserLoginComplete hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/UserLoginComplete
	 *
	 * Used here to handle watchlist actions made by anons to be handled after
	 * login or account creation.
	 *
	 * @param User &$currentUser the user object that was created on login
	 * @param string &$injected_html From 1.13, any HTML to inject after the login success message.
	 * @return bool
	 */
	public static function onUserLoginComplete( &$currentUser, &$injected_html ) {
		$context = MobileContext::singleton();
		if ( !$context->shouldDisplayMobileView() ) {
			return true;
		}

		// If 'watch' is set from the login form, watch the requested article
		$watch = $context->getRequest()->getVal( 'watch' );
		if ( !is_null( $watch ) ) {
			$title = Title::newFromText( $watch );
			// protect against watching special pages (these cannot be watched!)
			if ( !is_null( $title ) && !$title->isSpecialPage() ) {
				WatchAction::doWatch( $title, $currentUser );
			}
		}
		return true;
	}

	/**
	 * Checks whether the editor can handle the existing content handler type.
	 *
	 * @param Title $title
	 * @return bool
	 */
	protected static function isPageContentModelEditable( Title $title ) {
		$contentHandler = ContentHandler::getForTitle( $title );

		return $contentHandler->supportsDirectEditing()
			&& $contentHandler->supportsDirectApiEditing();
	}

	/**
	 * BeforePageDisplay hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageDisplay
	 *
	 * @param OutputPage &$out
	 * @param Skin &$skin Skin object that will be used to generate the page, added in 1.13.
	 * @return bool
	 */
	public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin ) {
		$context = MobileContext::singleton();
		$config = $context->getMFConfig();
		$mfEnableXAnalyticsLogging = $config->get( 'MFEnableXAnalyticsLogging' );
		$mfAppPackageId = $config->get( 'MFAppPackageId' );
		$mfAppScheme = $config->get( 'MFAppScheme' );
		$mfNoIndexPages = $config->get( 'MFNoindexPages' );
		$mfMobileUrlTemplate = $context->getMobileUrlTemplate();

		$title = $skin->getTitle();
		$request = $context->getRequest();

		// Add deep link to a mobile app specified by $wgMFAppScheme
		if ( ( $mfAppPackageId !== false ) && ( $title->isContentPage() )
			&& ( $request->getRawQueryString() === '' )
		) {
			$fullUrl = $title->getFullURL();
			$mobileUrl = $context->getMobileUrl( $fullUrl );
			$path = preg_replace( "/^([a-z]+:)?(\/)*/", '', $mobileUrl, 1 );

			$scheme = 'http';
			if ( $mfAppScheme !== false ) {
				$scheme = $mfAppScheme;
			} else {
				$protocol = $request->getProtocol();
				if ( $protocol != '' ) {
					$scheme = $protocol;
				}
			}

			$hreflink = 'android-app://' . $mfAppPackageId . '/' . $scheme . '/' . $path;
			$out->addLink( [ 'rel' => 'alternate', 'href' => $hreflink ] );
		}

		// an canonical/alternate link is only useful, if the mobile and desktop URL are different
		// and $wgMFNoindexPages needs to be true
		if ( $mfMobileUrlTemplate && $mfNoIndexPages ) {
			$link = false;

			if ( !$context->shouldDisplayMobileView() ) {
				// add alternate link to desktop sites - bug T91183
				$desktopUrl = $title->getFullUrl();
				$link = [
					'rel' => 'alternate',
					'media' => 'only screen and (max-width: ' . self::DEVICE_WIDTH_TABLET . ')',
					'href' => $context->getMobileUrl( $desktopUrl ),
				];
			} elseif ( !$title->isSpecial( 'MobileCite' ) ) {
				// Add canonical link to mobile pages (except for Special:MobileCite),
				// instead of noindex - bug T91183.
				$link = [
					'rel' => 'canonical',
					'href' => $title->getFullUrl(),
				];
			}

			if ( $link !== false ) {
				$out->addLink( $link );
			}
		}

		// set the vary header to User-Agent, if mobile frontend auto detects, if the mobile
		// view should be delivered and the same url is used for desktop and mobile devices
		// Bug: T123189
		if (
			$config->get( 'MFVaryOnUA' ) &&
			$config->get( 'MFAutodetectMobileView' ) &&
			!$config->get( 'MobileUrlTemplate' )
		) {
			$out->addVaryHeader( 'User-Agent' );
		}

		// Set X-Analytics HTTP response header if necessary
		if ( $context->shouldDisplayMobileView() ) {
			$analyticsHeader = ( $mfEnableXAnalyticsLogging ? $context->getXAnalyticsHeader() : false );
			if ( $analyticsHeader ) {
				$resp = $out->getRequest()->response();
				$resp->header( $analyticsHeader );
			}

			// in mobile view: always add vary header
			$out->addVaryHeader( 'Cookie' );

			// set the mobile target
			if ( !$context->isBlacklistedPage() ) {
				$out->setTarget( 'mobile' );
			}

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
			$out->addModules( [ 'mobile.site', 'mobile.init' ] );
			if ( $title->isMainPage() && $config->get( 'MFMobileMainPageCss' ) ) {
				$out->addModuleStyles( [ 'mobile.mainpage.css' ] );
			}
			if ( $config->get( 'MFSiteStylesRenderBlocking' ) ) {
				$out->addModuleStyles( [ 'mobile.site.styles' ] );
			}

			// Allow modifications in mobile only mode
			Hooks::run( 'BeforePageDisplayMobile', [ &$out, &$skin ] );

			// Warning box styles are needed when reviewing old revisions
			// and inside the fallback editor styles to action=edit page
			$requestAction = $out->getRequest()->getVal( 'action' );
			if (
				$out->getRequest()->getText( 'oldid' ) ||
				$requestAction === 'edit' || $requestAction === 'submit'
			) {
				$out->addModuleStyles( [
					'mobile.messageBox.styles'
				] );
			}
		}

		return true;
	}

	/**
	 * AfterBuildFeedLinks hook handler. Remove all feed links in mobile view.
	 *
	 * @param array &$tags Added feed links
	 */
	public static function onAfterBuildFeedLinks( array &$tags ) {
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() && !$context->getMFConfig()->get( 'MFRSSFeedLink' ) ) {
			$tags = [];
		}
	}

	/**
	 * Register default preferences for MobileFrontend
	 *
	 * @param array &$wgDefaultUserOptions Reference to default options array
	 */
	public static function onUserGetDefaultOptions( &$wgDefaultUserOptions ) {
		$wgDefaultUserOptions += [
			self::MOBILE_PREFERENCES_SPECIAL_PAGES => self::ENABLE_SPECIAL_PAGE_OPTIMISATIONS,
		];
	}

	/**
	 * GetPreferences hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetPreferences
	 *
	 * @param User $user User whose preferences are being modified
	 * @param array &$preferences Preferences description array, to be fed to an HTMLForm object
	 *
	 * @return bool
	 */
	public static function onGetPreferences( $user, &$preferences ) {
		$ctx = MobileContext::singleton();
		$config = $ctx->getMFConfig();
		$defaultSkin = $config->get( 'DefaultSkin' );
		$definition = [
			'type' => 'api',
			'default' => '',
		];
		$preferences[SpecialMobileWatchlist::FILTER_OPTION_NAME] = $definition;
		$preferences[SpecialMobileWatchlist::VIEW_OPTION_NAME] = $definition;

		if ( $config->get( 'MFEnableMobilePreferences' ) ) {
			$preferences[ self::MOBILE_PREFERENCES_SPECIAL_PAGES ] = [
				'type' => 'check',
				'label-message' => 'mobile-frontend-special-pages-pref',
				'help-message' => 'mobile-frontend-special-pages-pref',
				'section' => self::MOBILE_PREFERENCES_SECTION
			];
		}

		return true;
	}

	/**
	 * Gadgets::allowLegacy hook handler
	 *
	 * @return bool
	 */
	public static function onAllowLegacyGadgets() {
		return !MobileContext::singleton()->shouldDisplayMobileView();
	}

	/**
	 * CentralAuthLoginRedirectData hook handler
	 * Saves mobile host so that the CentralAuth wiki could redirect back properly
	 *
	 * @see CentralAuthHooks::doCentralLoginRedirect in CentralAuth extension
	 * @param CentralAuthUser $centralUser
	 * @param array &$data Redirect data
	 *
	 * @return bool
	 */
	public static function onCentralAuthLoginRedirectData( $centralUser, &$data ) {
		$context = MobileContext::singleton();
		$server = $context->getConfig()->get( 'Server' );
		if ( $context->shouldDisplayMobileView() ) {
			$data['mobileServer'] = $context->getMobileUrl( $server );
		}
		return true;
	}

	/**
	 * CentralAuthSilentLoginRedirect hook handler
	 * Points redirects from CentralAuth wiki to mobile domain if user has logged in from it
	 * @see SpecialCentralLogin in CentralAuth extension
	 * @param CentralAuthUser $centralUser
	 * @param string &$url to redirect to
	 * @param array $info token information
	 *
	 * @return bool
	 */
	public static function onCentralAuthSilentLoginRedirect( $centralUser, &$url, $info ) {
		if ( isset( $info['mobileServer'] ) ) {
			$mobileUrlParsed = wfParseUrl( $info['mobileServer'] );
			$urlParsed = wfParseUrl( $url );
			$urlParsed['host'] = $mobileUrlParsed['host'];
			$url = wfAssembleUrl( $urlParsed );
		}
		return true;
	}

	/**
	 * ResourceLoaderRegisterModules hook handler.
	 *
	 * Registers:
	 *
	 * * EventLogging schema modules, if the EventLogging extension is loaded;
	 * * Modules for the Visual Editor overlay, if the VisualEditor extension is loaded; and
	 * * Modules for the notifications overlay, if the Echo extension is loaded.
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderRegisterModules
	 *
	 * @param ResourceLoader &$resourceLoader
	 * @return bool Always true
	 */
	public static function onResourceLoaderRegisterModules( ResourceLoader &$resourceLoader ) {
		$resourceBoilerplate = [
			'localBasePath' => dirname( __DIR__ ),
			'remoteExtPath' => 'MobileFrontend',
		];

		// add VisualEditor related modules only, if VisualEditor seems to be installed - T85007
		if ( ExtensionRegistry::getInstance()->isLoaded( 'VisualEditor' ) ) {
			$resourceLoader->register( [
				'mobile.editor.ve' => $resourceBoilerplate + [
					'dependencies' => [
						'ext.visualEditor.mobileArticleTarget',
						'mobile.editor.overlay',
						'mobile.startup',
					],
					'scripts' => 'resources/dist/mobile.editor.ve.js',
					'targets' => [
						'mobile',
					],
				],
			] );
		}

		// add Echo, if it's installed
		if ( ExtensionRegistry::getInstance()->isLoaded( 'Echo' ) ) {
			$resourceLoader->register( [
				'mobile.notifications.overlay' => $resourceBoilerplate + [
					'dependencies' => [
						'mediawiki.util',
						'mobile.startup',
						'oojs-ui',
						'ext.echo.ui',
						'oojs-ui.styles.icons-interactions',
					],
					'scripts' => [
						'resources/dist/mobile.notifications.overlay.js',
					],
					'styles' => [
						'resources/mobile.notifications.overlay/NotificationsOverlay.less',
						'resources/mobile.notifications.overlay/NotificationsFilterOverlay.less',
					],
					'messages' => [
						'mobile-frontend-notifications-filter-title',
						// defined in Echo
						'echo-none',
						'echo-mark-all-as-read-confirmation',
					],
					'targets' => [ 'mobile', 'desktop' ],
				],
			] );
		};

		return true;
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
	 * @param Callable $fallbackWikibaseDescriptionFunc A fallback to provide Wikibase description.
	 * Function takes wikibase_item as a first and only argument
	 * @return string
	 */
	public static function findTagline( ParserOutput $po, $fallbackWikibaseDescriptionFunc ) {
		$desc = $po->getProperty( 'wikibase-shortdesc' );
		$item = $po->getProperty( 'wikibase_item' );
		if ( $desc === false && $item && $fallbackWikibaseDescriptionFunc ) {
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
	 * @return bool
	 */
	public static function onOutputPageParserOutput( $outputPage, ParserOutput $po ) {
		$context = MobileContext::singleton();
		$featureManager = \MediaWiki\MediaWikiServices::getInstance()
			->getService( 'MobileFrontend.FeaturesManager' );
		$title = $outputPage->getTitle();
		$descriptionsEnabled = !$title->isMainPage() &&
			$title->getNamespace() === NS_MAIN &&
			$featureManager->isFeatureAvailableInContext(
				'MFEnableWikidataDescriptions', $context
			) && $context->shouldShowWikibaseDescriptions( 'tagline' );

		// Only set the tagline if the feature has been enabled and the article is in the main namespace
		if ( $context->shouldDisplayMobileView() && $descriptionsEnabled ) {
			$desc = self::findTagline( $po, function ( $item ) {
				return ExtMobileFrontend::getWikibaseDescription( $item );
			} );
			if ( $desc ) {
				self::setTagline( $outputPage, $desc );
			}
		}
		return true;
	}

	/**
	 * HTMLFileCache::useFileCache hook handler
	 * Disables file caching for mobile pageviews
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/HTMLFileCache::useFileCache
	 *
	 * @return bool
	 */
	public static function onHTMLFileCacheUseFileCache() {
		return !MobileContext::singleton()->shouldDisplayMobileView();
	}

	/**
	 * Removes the responsive image's variants from the parser output if
	 * configured to do so and the thumbnail's MIME type isn't whitelisted.
	 *
	 * See https://www.mediawiki.org/wiki/Manual:Hooks/ThumbnailBeforeProduceHTML
	 * for more detail about the `ThumbnailBeforeProduceHTML` hook.
	 *
	 * @param ThumbnailImage $thumbnail
	 * @param array &$attribs The attributes of the DOMElement being contructed
	 *  to represent the thumbnail
	 * @param array &$linkAttribs The attributes of the DOMElement being
	 *  constructed to represent the link to original file
	 */
	public static function onThumbnailBeforeProduceHTML( $thumbnail, &$attribs, &$linkAttribs ) {
		$context = MobileContext::singleton();
		$config = $context->getMFConfig();
		if ( $context->shouldStripResponsiveImages() ) {
			$file = $thumbnail->getFile();
			if ( !$file || !in_array( $file->getMimeType(),
					$config->get( 'MFResponsiveImageWhitelist' ) ) ) {
				// Remove all responsive image 'srcset' attributes, except
				// from SVG->PNG renderings which usually aren't too huge,
				// or other whitelisted types.
				// Note that in future, srcset may be used for specifying
				// small-screen-friendly image variants as well as density
				// variants, so this should be used with caution.
				unset( $attribs['srcset'] );
			}
		}
	}

	/**
	 * LoginFormValidErrorMessages hook handler to promote MF specific error message be valid.
	 *
	 * @param array &$messages Array of already added messages
	 */
	public static function onLoginFormValidErrorMessages( &$messages ) {
		$messages = array_merge( $messages,
			[
				// watchstart sign up CTA
				'mobile-frontend-watchlist-signup-action',
				// Watchlist and watchstar sign in CTA
				'mobile-frontend-watchlist-purpose',
				// Uploads link
				'mobile-frontend-donate-image-anon',
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
	 * @return bool true in all cases
	 */
	public static function onMakeGlobalVariablesScript( array &$vars, OutputPage $out ) {
		$title = $out->getTitle();
		$featureManager = \MediaWiki\MediaWikiServices::getInstance()
			->getService( 'MobileFrontend.FeaturesManager' );

		// If the device is a mobile, Remove the category entry.
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() ) {
			unset( $vars['wgCategories'] );
			$vars['wgMFMode'] = $context->isBetaGroupMember() ? 'beta' : 'stable';
			$vars['wgMFLazyLoadImages'] =
				$featureManager->isFeatureAvailableInContext( 'MFLazyLoadImages', $context );
			$vars['wgMFLazyLoadReferences'] =
				$featureManager->isFeatureAvailableInContext( 'MFLazyLoadReferences', $context );

			// mobile.init
			$vars['wgMFIsPageContentModelEditable'] = self::isPageContentModelEditable( $title );
			// Accesses getBetaGroupMember so does not belong in onResourceLoaderGetConfigVars
		}
		// Needed by mobile.startup, mobile.special.watchlist.scripts, mobile.special.nearby.scripts
		// Needs to know if in beta mode or not and needs to load for Minerva desktop as well.
		// Ideally this would be inside ResourceLoaderFileModuleWithMFConfig but
		// sessions are not allowed there.
		$vars += self::getWikibaseStaticConfigVars( $context );
		return true;
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
	public static function onTitleSquidURLs( Title $title, array &$urls ) {
		$context = MobileContext::singleton();
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
	public static function onAuthChangeFormFields(
		array $requests, array $fieldInfo, array &$formDescriptor, $action
	) {
		$context = MobileContext::singleton();
		$mfLogo = $context->getMFConfig()->get( 'MobileFrontendLogo' );

		// do nothing in desktop mode
		if (
			$context->shouldDisplayMobileView() && $mfLogo
			&& in_array( $action, [ AuthManager::ACTION_LOGIN, AuthManager::ACTION_CREATE ], true )
		) {
			$logoHtml = Html::rawElement( 'div', [ 'class' => 'watermark' ],
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
	public static function onAPIQuerySiteInfoGeneralInfo( ApiQuerySiteinfo $module, array &$result ) {
		global $wgCanonicalServer;
		$ctx = MobileContext::singleton();
		$result['mobileserver'] = $ctx->getMobileUrl( $wgCanonicalServer );
	}

	/**
	 * Use inline diff engine when on Special:MobileDiff.
	 * @param IContextSource $context
	 * @param int $old Old revision ID or 0 for current
	 * @param int $new New revision ID or 0 for current
	 * @param bool $refreshCache Refresh diff cache
	 * @param bool $unhide Show deleted revisions
	 * @param DifferenceEngine &$differenceEngine Difference engine to alter/replace
	 */
	public static function onGetDifferenceEngine(
		IContextSource $context, $old, $new, $refreshCache, $unhide, &$differenceEngine
	) {
		if ( $differenceEngine === null ) {
			// old hook behavior before 1.32
			throw new Exception( 'Incompatible MediaWiki version!' );
		}

		// FIXME hack for T201842. DifferenceEngine does both calculation and formatting of
		// diffs; the two should be separated.
		if (
			get_class( $differenceEngine ) === DifferenceEngine::class
			&& $context->getTitle()->isSpecial( 'MobileDiff' )
		) {
			if ( defined( 'MW_PHPUNIT_TEST' ) ) {
				$differenceEngine = new MockInlineDifferenceEngine();
			} else {
				$differenceEngine = new InlineDifferenceEngine( $context, $old, $new, 0,
					$refreshCache, $unhide );
			}
		}
	}
}
