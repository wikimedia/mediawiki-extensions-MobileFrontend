<?php
/**
 * MobileFrontend.hooks.php
 */

/**
 * Hook handlers for MobileFrontend extension
 *
 * Hook handler method names should be in the form of:
 *	on<HookName>()
 * For intance, the hook handler for the 'RequestContextCreateSkin' would be called:
 *	onRequestContextCreateSkin()
 */
class MobileFrontendHooks {

	/**
	 * LinksUpdate hook handler - saves a count of h2 elements that occur in the WikiPage
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/LinksUpdate
	 *
	 * @param LinksUpdate $lu
	 * @return bool
	 */
	public static function onLinksUpdate( LinksUpdate $lu ) {
		if ( $lu->getTitle()->isTalkPage() ) {
			$parserOutput = $lu->getParserOutput();
			$sections = $parserOutput->getSections();
			$numTopics = 0;
			foreach ( $sections as $section ) {
				if ( $section['toclevel'] == 1 ) {
					$numTopics += 1;
				}
			}
			if ( $numTopics ) {
				$lu->mProperties['page_top_level_section_count'] = $numTopics;
			}
		}

		return true;
	}

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
	 * @param IContextSource $context
	 * @param MobileContext $mobileContext
	 * @return Skin
	 */
	protected static function getDefaultMobileSkin( RequestContext $context,
		MobileContext $mobileContext
	) {
		$skinName = $mobileContext->getMFConfig()->get( 'MFDefaultSkinClass' );
		$betaSkinName = $skinName . 'Beta';
		// Force beta for test mode to sure all modules can run
		$name = $context->getTitle()->getDBkey();
		if ( $mobileContext->isBetaGroupMember() && class_exists( $betaSkinName ) ) {
			$skinName = $betaSkinName;
		}
		$skin = new $skinName( $context );
		return $skin;
	}

	/**
	 * RequestContextCreateSkin hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/RequestContextCreateSkin
	 *
	 * @param IContextSource $context
	 * @param Skin|null|string $skin
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
			// If the skin has been normalized and is different from user input use it
			if ( $normalizedSkin === $userSkin ) {
				$skin = $normalizedSkin;
				return false;
			}
		}
		$skin = self::getDefaultMobileSkin( $context, $mobileContext );

		return false;
	}

	/**
	 * MediaWikiPerformAction hook handler (enable mwui for all pages)
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/MediaWikiPerformAction
	 *
	 * @param OutputPage $output
	 * @param Article $article
	 * @param Title $title
	 * @param User $user
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
	 * @param SkinTemplate $skin
	 * @param QuickTemplate $tpl
	 * @return bool
	 */
	public static function onSkinTemplateOutputPageBeforeExec( &$skin, &$tpl ) {
		MobileFrontendSkinHooks::prepareFooter( $skin, $tpl );
		return true;
	}

	public static function onSkinAfterBottomScripts( $sk, &$html ) {
		$context = MobileContext::singleton();

		// TODO: We may want to enable the following script on Desktop Minerva...
		// ... when Minerva is widely used.
		if ( $context->shouldDisplayMobileView() && $context->isLazyLoadImagesEnabled() ) {
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
	 *
	 * @param OutputPage $out
	 * @param string $text the HTML to be wrapped inside the #mw-content-text element
	 * @return bool
	 */
	public static function onOutputPageBeforeHTML( &$out, &$text ) {
		$context = MobileContext::singleton();
		// Perform a few extra changes if we are in mobile mode
		if ( $context->shouldDisplayMobileView() ) {
			$text = ExtMobileFrontend::DOMParse( $out, $text, $context->isBetaGroupMember() );
		}
		return true;
	}

	/**
	 * BeforePageRedirect hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageRedirect
	 *
	 * Ensures URLs are handled properly for select special pages.
	 * @param OutputPage $out
	 * @param string $redirect
	 * @param string $code
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
		if ( $context->shouldDisplayMobileView()
			&& !$diff->getContext()->getTitle()->isSpecialPage()
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
	 * ResourceLoaderTestModules hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderTestModules
	 *
	 * @param array $testModules
	 * @param ResourceLoader $resourceLoader
	 * @return bool
	 */
	public static function onResourceLoaderTestModules( array &$testModules,
		ResourceLoader &$resourceLoader
	) {
		// FIXME: Global core variable don't use it.
		global $wgResourceModules;
		$testFiles = array();
		$dependencies = array();
		$localBasePath = dirname( __DIR__ );

		// find test files for every RL module
		foreach ( $wgResourceModules as $key => $module ) {
			$hasTests = false;
			if ( substr( $key, 0, 7 ) === 'mobile.' && isset( $module['scripts'] ) ) {
				foreach ( $module['scripts'] as $script ) {
					$testFile = 'tests/' . dirname( $script ) . '/test_' . basename( $script );
					// For resources folder
					$testFile = str_replace( 'tests/resources/', 'tests/qunit/', $testFile );
					// if a test file exists for a given JS file, add it
					if ( file_exists( $localBasePath . '/' . $testFile ) ) {
						$testFiles[] = $testFile;
						$hasTests = true;
					}
				}

				// if test files exist for given module, create a corresponding test module
				if ( $hasTests ) {
					$dependencies[] = $key;
				}
			}
		}

		$testModule = array(
			'dependencies' => $dependencies,
			'templates' => array(
				'section.hogan' => 'tests/qunit/tests.mobilefrontend/section.hogan',
				'issues.hogan' => 'tests/qunit/tests.mobilefrontend/issues.hogan',
				'page.html' => 'tests/qunit/tests.mobilefrontend/page.html',
				'page2.html' => 'tests/qunit/tests.mobilefrontend/page2.html',
				'pageWithStrippedRefs.html' => 'tests/qunit/tests.mobilefrontend/pageWithStrippedRefs.html',
				'references.html' => 'tests/qunit/tests.mobilefrontend/references.html',
				'refSection.html' => 'tests/qunit/tests.mobilefrontend/refSection.html',
			),
			'localBasePath' => $localBasePath,
			'remoteExtPath' => 'MobileFrontend',
			'targets' => array( 'mobile', 'desktop' ),
			'scripts' => $testFiles,
		);

		// Expose templates module
		$testModules['qunit']["tests.mobilefrontend"] = $testModule;

		return true;
	}

	/**
	 * GetCacheVaryCookies hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetCacheVaryCookies
	 *
	 * @param OutputPage $out
	 * @param array $cookies
	 * @return bool
	 */
	public static function onGetCacheVaryCookies( $out, &$cookies ) {
		$context = MobileContext::singleton();
		$mobileUrlTemplate = $context->getMobileUrlTemplate();

		// Enables mobile cookies on wikis w/o mobile domain
		$cookies[] = MobileContext::USEFORMAT_COOKIE_NAME;
		// Don't redirect to mobile if user had explicitly opted out of it
		$cookies[] = 'stopMobileRedirect';

		if ( $context->shouldDisplayMobileView() || !$mobileUrlTemplate ) {
			$cookies[] = 'optin'; // beta cookie
		}
		// Redirect people who want so from HTTP to HTTPS. Ideally, should be
		// only for HTTP but we don't vary on protocol.
		$cookies[] = 'forceHTTPS';
		return true;
	}

	/**
	 * PageRenderingHash hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/PageRenderingHash
	 *
	 * @param string &$confstr Reference to a hash key string which can be modified
	 * @param User $user User object that is requesting the page
	 * @param array &$forOptions Array of options used to generate the $confstr hash key
	 */
	public static function onPageRenderingHash( &$confstr, User $user, &$forOptions ) {
		$context = MobileContext::singleton();

		if ( !$context->shouldDisplayMobileView() ) {
			return;
		}

		if ( $context->isLazyLoadImagesEnabled() ) {
			$confstr .= '!lazyloadimages';
		}

		if ( $context->imagesDisabled() ) {
			$confstr .= '!noimg';
		}
	}

	/**
	 * SkinPreloadExistence hook handler
	 * Disables TOC in output before it grabs HTML
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SkinPreloadExistence
	 *
	 * @param Title[] $titles
	 * @param Skin $skin
	 * @return bool
	 */
	public static function onSkinPreloadExistence( array &$titles, Skin $skin ) {
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() && !$context->isBlacklistedPage() ) {
			$skin->getOutput()->setTarget( 'mobile' );
		}
		return true;
	}

	/**
	 * ResourceLoaderGetConfigVars hook handler
	 * This should be used for variables which:
	 *  - vary with the html
	 *  - variables that should work cross skin including anonymous users
	 *  - used for both, stable and beta mode (don't use
	 *    MobileContext::isBetaGroupMember in this function - T127860)
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderGetConfigVars
	 *
	 * @param array $vars
	 * @return boolean
	 */
	public static function onResourceLoaderGetConfigVars( &$vars ) {
		$context = MobileContext::singleton();
		$config = $context->getMFConfig();
		$lessVars = $config->get( 'ResourceLoaderLESSVars' );

		$pageProps = $config->get( 'MFQueryPropModules' );
		$searchParams = $config->get( 'MFSearchAPIParams' );
		// Avoid API warnings and allow integration with optional extensions.
		if ( defined( 'PAGE_IMAGES_INSTALLED' ) ) {
			$pageProps[] = 'pageimages';
			$searchParams = array_merge_recursive( $searchParams, array(
				'piprop' => 'thumbnail',
				'pithumbsize' => MobilePage::SMALL_IMAGE_WIDTH,
				'pilimit' => 50,
			) );
		}

		// We need to check that first descriptions are enabled (the server admin has installed
		// Wikidata) and then secondly that it is okay to display them prominently in the UI
		// For instance a server admin may want to make them available in the page via JS for gadgets
		// but not build them into their experience.
		$displayDescriptions = $config->get( 'MFDisplayWikibaseDescription' );
		$useDescriptions = $config->get( 'MFUseWikibaseDescription' );

		// When set turn on Wikidata descriptions
		// https://phabricator.wikimedia.org/T101719
		if ( $useDescriptions && $displayDescriptions ) {
			if ( !in_array( 'pageterms', $pageProps ) ) {
				$pageProps[] = 'pageterms';
			}
			$searchParams = array_merge_recursive( $searchParams, array(
				'wbptterms' => 'description',
			) );
		}

		// Get the licensing agreement that is displayed in the uploading interface.
		$vars += array(
			'wgMFSearchAPIParams' => $searchParams,
			'wgMFQueryPropModules' => $pageProps,
			'wgMFSearchGenerator' => $config->get( 'MFSearchGenerator' ),
			'wgMFNearbyEndpoint' => $config->get( 'MFNearbyEndpoint' ),
			'wgMFThumbnailSizes' => array(
				'tiny' =>  MobilePage::TINY_IMAGE_WIDTH,
				'small' =>  MobilePage::SMALL_IMAGE_WIDTH,
			),
			'wgMFContentNamespace' => $config->get( 'MFContentNamespace' ),
			'wgMFEditorOptions' => $config->get( 'MFEditorOptions' ),
			'wgMFLicense' => MobileFrontendSkinHooks::getLicense( 'editor' ),
			'wgMFSchemaEditSampleRate' => $config->get( 'MFSchemaEditSampleRate' ),
			'wgMFSchemaMobileWebLanguageSwitcherSampleRate' =>
				$config->get( 'MFSchemaMobileWebLanguageSwitcherSampleRate' ),
			'wgMFExperiments' => $config->get( 'MFExperiments' ),
			'wgMFIgnoreEventLoggingBucketing' => $config->get( 'MFIgnoreEventLoggingBucketing' ),
			'wgMFEnableJSConsoleRecruitment' => $config->get( 'MFEnableJSConsoleRecruitment' ),
			'wgMFPhotoUploadEndpoint' =>
				$config->get( 'MFPhotoUploadEndpoint' ) ? $config->get( 'MFPhotoUploadEndpoint' ) : '',
			'wgMFDeviceWidthTablet' => $lessVars['deviceWidthTablet'],
			'wgMFCollapseSectionsByDefault' => $config->get( 'MFCollapseSectionsByDefault' ),
		);

		if ( $context->shouldDisplayMobileView() ) {
			$vars['wgImagesDisabled'] = $context->imagesDisabled();
		}
		// add CodeMirror specific things, if it is installed (for CodeMirror editor)
		if ( class_exists( 'CodeMirrorHooks' ) ) {
			$vars += CodeMirrorHooks::getGlobalVariables( MobileContext::singleton() );
			$vars['wgMFCodeMirror'] = true;
		}

		return true;
	}

	/**
	 * Hook for SpecialPage_initList in SpecialPageFactory.
	 *
	 * @param array $list list of special page classes
	 * @return bool hook return value
	 */
	public static function onSpecialPage_initList( &$list ) {
		$ctx = MobileContext::singleton();
		// Perform substitutions of pages that are unsuitable for mobile
		// FIXME: Upstream these changes to core.
		if ( $ctx->shouldDisplayMobileView() ) {
			// Replace the standard watchlist view with our custom one
			$list['Watchlist'] = 'SpecialMobileWatchlist';
			$list['EditWatchlist'] = 'SpecialMobileEditWatchlist';
			$list['Preferences'] = 'SpecialMobilePreferences';

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
	 * @param array $tags
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
	 * @param RecentChange $rc
	 * @return bool
	 */
	public static function onRecentChange_save( RecentChange $rc ) {
		$context = MobileContext::singleton();
		$userAgent = $context->getRequest()->getHeader( "User-agent" );
		$logType = $rc->getAttribute( 'rc_log_type' );
		// Only log edits and uploads
		if ( $context->shouldDisplayMobileView() && ( $logType === 'upload' || is_null( $logType ) ) ) {
			$rcId = $rc->getAttribute( 'rc_id' );
			$revId = $rc->getAttribute( 'rc_this_oldid' );
			$logId = $rc->getAttribute( 'rc_logid' );
			ChangeTags::addTags( 'mobile edit', $rcId, $revId, $logId );
			// Tag as mobile web edit specifically, if it isn't coming from the apps
			if ( strpos( $userAgent, 'WikipediaApp/' ) !== 0 ) {
				ChangeTags::addTags( 'mobile web edit', $rcId, $revId, $logId );
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
	 * @param User $user object
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
	 * @param array $builder Array in AbuseFilter::getBuilderValues to add to.
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
	 * @param string $subpage
	 * @return bool
	 */
	public static function onSpecialPageBeforeExecute( SpecialPage $special, $subpage ) {
		$mobileContext = MobileContext::singleton();
		$isMobileView = $mobileContext->shouldDisplayMobileView();
		$context = $special->getContext();
		$out = $context->getOutput();
		$secureLogin = $context->getConfig()->get( 'SecureLogin' );
		$request = $special->getContext()->getRequest();
		$skin = $out->getSkin()->getSkinName();

		$name = $special->getName();

		// Ensure desktop version of Special:Preferences page gets mobile targeted modules
		// FIXME: Upstream to core (?)
		if ( $skin === 'minerva' ) {
			if ( $name === 'Preferences' ) {
				$out->addModules( 'skins.minerva.special.preferences.scripts' );
			}

			// Add default warning message to Special:UserLogin and Special:UserCreate
			// if no warning message set.
			if (
				$name === 'Userlogin' &&
				!$request->getVal( 'warning', null ) &&
				!$context->getUser()->isLoggedIn()
			) {
				$request->setVal( 'warning', 'mobile-frontend-generic-login-new' );
			}
		}

		if ( $isMobileView ) {
			if ( $name === 'Search' ) {
				$out->addModuleStyles( 'skins.minerva.special.search.styles' );
			} elseif ( $name === 'Userlogin' ) {
				$out->addModuleStyles( 'skins.minerva.special.userlogin.styles' );
				$out->addModules( 'mobile.special.userlogin.scripts' );
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
	 * @param User $currentUser
	 * @param string $injected_html
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
	 * Decide if the login/usercreate page should be overwritten by a mobile only
	 * special specialpage. If not, do some changes to the template.
	 * @param QuickTemplate $tpl Login or Usercreate template
	 * @param String $mode Is this function called in context of UserCreate or UserLogin?
	 */
	public static function changeUserLoginCreateForm( &$tpl ) {
		$context = MobileContext::singleton();
		// otherwise just(tm) add a logoheader, if there is any
		$mfLogo = $context->getMFConfig()
			->get( 'MobileFrontendLogo' );

		// do nothing in desktop mode
		if ( $context->shouldDisplayMobileView() && $mfLogo ) {
			$tpl->extend(
				'formheader',
				Html::openElement(
					'div',
					array( 'class' => 'watermark' )
				) .
				Html::element( 'img',
					array(
						'src' => $mfLogo,
						'alt' => '',
					)
				) .
				Html::closeElement( 'div' )
			);
		}
	}

	/**
	 * UserLoginForm hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/UserLoginForm
	 *
	 * @param QuickTemplate $template Login form template object
	 * @return bool
	 */
	public static function onUserLoginForm( &$template ) {
		self::changeUserLoginCreateForm( $template );
		return true;
	}

	/**
	 * UserCreateForm hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/UserCreateForm
	 *
	 * @param QuickTemplate $template Account creation form template object
	 * @return bool
	 */
	public static function onUserCreateForm( &$template ) {
		self::changeUserLoginCreateForm( $template );
		return true;
	}

	/**
	 * BeforePageDisplay hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageDisplay
	 *
	 * @param OutputPage $out
	 * @param Skin $sk
	 * @return bool
	 */
	public static function onBeforePageDisplay( &$out, &$sk ) {
		global $wgWPBSkinBlacklist, $wgWPBEnableDefaultBanner;
		$context = MobileContext::singleton();
		$config = $context->getMFConfig();
		$mfEnableXAnalyticsLogging = $config->get( 'MFEnableXAnalyticsLogging' );
		$mfAppPackageId = $config->get( 'MFAppPackageId' );
		$mfAppScheme = $config->get( 'MFAppScheme' );
		$mfNoIndexPages = $config->get( 'MFNoindexPages' );
		$mfMobileUrlTemplate = $context->getMobileUrlTemplate();
		$lessVars = $config->get( 'ResourceLoaderLESSVars' );
		$noJsEditing = $config->get( 'MFAllowNonJavaScriptEditing' );

		// show banners using WikidataPageBanner, if installed and all pre-conditions fulfilled
		if (
			ExtensionRegistry::getInstance()->isLoaded( 'WikidataPageBanner' ) &&
			$context->isBetaGroupMember()
		) {
			// turn default banners on
			$wgWPBEnableDefaultBanner = true;
			// Turn on the banner experiment
			$needle = array_search( 'minerva', $wgWPBSkinBlacklist );
			if ( $needle !== false ) {
				unset( $wgWPBSkinBlacklist[$needle] );
			}
		}

		$title = $sk->getTitle();
		$request = $context->getRequest();

		// Migrate prefixed disableImages cookie to unprefixed cookie.
		if ( isset( $_COOKIE[$config->get( 'CookiePrefix' ) . 'disableImages'] ) ) {
			if ( (bool)$request->getCookie( 'disableImages' ) ) {
				$context->setDisableImagesCookie( true );
			}
			$request->response()->clearCookie( 'disableImages' );
		}

		# Add deep link to a mobile app specified by $wgMFAppScheme
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
			$out->addLink( array( 'rel' => 'alternate', 'href' => $hreflink ) );
		}

		// an canonical/alternate link is only useful, if the mobile and desktop URL are different
		// and $wgMFNoindexPages needs to be true
		if ( $mfMobileUrlTemplate && $mfNoIndexPages ) {
			if ( !$context->shouldDisplayMobileView() ) {
				// add alternate link to desktop sites - bug T91183
				$desktopUrl = $title->getFullUrl();
				$link = array(
					'rel' => 'alternate',
					'media' => 'only screen and (max-width: ' . $lessVars['deviceWidthTablet'] . ')',
					'href' => $context->getMobileUrl( $desktopUrl ),
				);
			} else {
				// add canonical link to mobile pages, instead of noindex - bug T91183
				$link = array(
					'rel' => 'canonical',
					'href' => $title->getFullUrl(),
				);
			}
			$out->addLink( $link );
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

			// Allow modifications in mobile only mode
			Hooks::run( 'BeforePageDisplayMobile', array( &$out, &$sk ) );

			// add fallback editor styles to action=edit page
			$requestAction = $out->getRequest()->getVal( 'action' );
			if ( $noJsEditing && ( $requestAction === 'edit' || $requestAction === 'submit' ) ) {
				$out->addModuleStyles( array(
					'skins.minerva.fallbackeditor', 'mobile.messageBox'
				) );
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
			$tags = array();
		}
	}

	/**
	 * CustomEditor hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/CustomEditor
	 *
	 * @param Article $article
	 * @param User $user
	 * @return bool
	 */
	public static function onCustomEditor( $article, $user ) {
		$context = MobileContext::singleton();

		// redirect to Special:MobileEditor if no-JS editing disabled
		if ( !$context->getMFConfig()->get( 'MFAllowNonJavaScriptEditing' ) ) {

			// redirect to mobile editor instead of showing desktop editor
			if ( $context->shouldDisplayMobileView() && !$context->getRequest()->wasPosted() ) {
				$output = $context->getOutput();
				$data = $output->getRequest()->getValues();
				// Unset these to avoid a redirect loop but make sure we pass other
				// parameters to edit e.g. undo actions
				unset( $data['action'] );
				unset( $data['title'] );

				$output->redirect( SpecialPage::getTitleFor( 'MobileEditor', $article->getTitle() )
					->getFullURL( $data ) );
				return false;
			}
		}
		return true;
	}

	/**
	 * Check whether Minerva has been enabled as a desktop skin via the Minerva
	 * beta feature.
	 *
	 * @param User $user
	 *
	 * @return bool
	 */
	private static function hasEnabledMinervaBetaFeature( $user ) {
		$config = MobileContext::singleton()->getMFConfig();
		$mfEnableMinervaBetaFeature = $config->get( 'MFEnableMinervaBetaFeature' );
		$canEnableMinervaFeature = class_exists( 'BetaFeatures' ) && $mfEnableMinervaBetaFeature;

		return $canEnableMinervaFeature &&
			BetaFeatures::isFeatureEnabled( $user, 'betafeatures-minerva' );
	}

	/**
	 * GetPreferences hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetPreferences
	 *
	 * @param User $user
	 * @param array $preferences
	 *
	 * @return bool
	 */
	public static function onGetPreferences( $user, &$preferences ) {
		$config = MobileContext::singleton()->getMFConfig();
		$defaultSkin = $config->get( 'DefaultSkin' );
		$definition = array(
			'type' => 'api',
			'default' => '',
		);
		$preferences[SpecialMobileWatchlist::FILTER_OPTION_NAME] = $definition;
		$preferences[SpecialMobileWatchlist::VIEW_OPTION_NAME] = $definition;

		// Remove the Minerva skin from the preferences unless Minerva has been enabled in
		// BetaFeatures provided that the user has not set it as the default skin.
		if ( $defaultSkin !== 'minerva' && !self::hasEnabledMinervaBetaFeature( $user ) ) {
			// Preference key/values are backwards. The value is the name of the skin. The
			// key is the text+links to display.
			if ( !empty( $preferences['skin']['options'] ) ) {
				$key = array_search( 'minerva', $preferences['skin']['options'] );
				unset( $preferences['skin']['options'][$key] );
			}
		}

		// preference that allow a user to set the preffered mobile skin using the api
		$preferences['mobileskin'] = array(
			'type' => 'api',
			'default' => '',
		);

		return true;
	}

	/**
	 * GetBetaFeaturePreferences hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetPreferences
	 *
	 * @param User $user
	 * @param array $preferences
	 *
	 * @return bool
	 */
	public static function onGetBetaFeaturePreferences( $user, &$preferences ) {
		$context = MobileContext::singleton();
		$extensionAssetsPath = $context->getConfig()->get( 'ExtensionAssetsPath' );
		$mfEnableMinervaBetaFeature = $context->getMFConfig()->get( 'MFEnableMinervaBetaFeature' );

		if ( $mfEnableMinervaBetaFeature ) {
			// Enable the mobile skin on desktop
			$preferences['betafeatures-minerva'] = array(
				'label-message' => 'beta-feature-minerva',
				'desc-message' => 'beta-feature-minerva-description',
				'info-link' => '//www.mediawiki.org/wiki/Beta_Features/Minerva',
				'discussion-link' => '//www.mediawiki.org/wiki/Talk:Beta_Features/Minerva',
				'screenshot' => array(
					'ltr' => "$extensionAssetsPath/MobileFrontend/images/BetaFeatures/minerva-ltr.svg",
					'rtl' => "$extensionAssetsPath/MobileFrontend/images/BetaFeatures/minerva-rtl.svg",
				),
			);
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
	 * UnitTestsList hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/UnitTestsList
	 *
	 * @param array $files
	 * @return bool
	 */
	public static function onUnitTestsList( &$files ) {
		$files[] = __DIR__ . '/../tests/phpunit';

		return true;
	}

	/**
	 * CentralAuthLoginRedirectData hook handler
	 * Saves mobile host so that the CentralAuth wiki could redirect back properly
	 *
	 * @see CentralAuthHooks::doCentralLoginRedirect in CentralAuth extension
	 * @param CentralAuthUser $centralUser
	 * @param array $data
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
	 * @param string $url to redirect to
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
	 * @param ResourceLoader &$resourceLoader The ResourceLoader object
	 * @return bool Always true
	 */
	public static function onResourceLoaderRegisterModules( ResourceLoader &$resourceLoader ) {
		$resourceBoilerplate = array(
			'localBasePath' => dirname( __DIR__ ),
			'remoteExtPath' => 'MobileFrontend',
		);
		self::registerMobileLoggingSchemasModule( $resourceLoader );

		// add VisualEditor related modules only, if VisualEditor seems to be installed - T85007
		if ( class_exists( 'VisualEditorHooks' ) ) {
			$resourceLoader->register( array(
				'mobile.editor.ve' => $resourceBoilerplate + array(
					'dependencies' => array(
						'ext.visualEditor.mobileArticleTarget',
						'mobile.editor.common',
						'mobile.overlays',
					),
					'styles' => array(
						'resources/mobile.editor.ve/VisualEditorOverlay.less',
					),
					'scripts' => array(
						'resources/mobile.editor.ve/ve.init.mw.MobileFrontendArticleTarget.js',
						'resources/mobile.editor.ve/VisualEditorOverlay.js',
					),
					'templates' => array(
						'contentVE.hogan' => 'resources/mobile.editor.ve/contentVE.hogan',
						'toolbarVE.hogan' => 'resources/mobile.editor.ve/toolbarVE.hogan',
					),
					'messages' => array(
						'mobile-frontend-page-edit-summary',
						'mobile-frontend-editor-editing',
					),
					'targets' => array(
						'mobile',
					),
				),
			) );
		}

		// add Echo, if it's installed
		if ( class_exists( 'MWEchoNotifUser' ) ) {
			$resourceLoader->register( array(
				'skins.minerva.notifications' => $resourceBoilerplate + array(
					'dependencies' => array(
						'mobile.overlays',
						'skins.minerva.scripts',
						'mediawiki.ui.anchor'
					),
					'scripts' => array(
						'resources/skins.minerva.notifications/init.js',
					),
					'targets' => array( 'mobile', 'desktop' ),
				),
				'mobile.notifications.overlay' => $resourceBoilerplate + array(
					'dependencies' => array(
						'mobile.overlays',
						'ext.echo.ui',
					),
					'scripts' => array(
						'resources/mobile.notifications.overlay/NotificationsOverlay.js',
					),
					'styles' => array(
						'resources/mobile.notifications.overlay/NotificationsOverlay.less',
					),
					'messages' => array(
						// defined in Echo
						'echo-none',
						'notifications',
						'echo-overlay-link',
					),
					'targets' => array( 'mobile', 'desktop' ),
				),
			) );
		};

		return true;
	}

	/**
	 * ResourceLoaderGetLessVars hook handler
	 *
	 * Add the context-based less variables.
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderGetLessVars
	 * @param array &$lessVars Variables already added
	 */
	public static function onResourceLoaderGetLessVars( &$lessVars ) {
		$config = MobileContext::singleton()->getMFConfig();
		$lessVars = array_merge( $lessVars,
			array(
				'wgMFDeviceWidthMobileSmall' => "{$config->get( 'MFDeviceWidthMobileSmall' )}px",
				'wgMFThumbnailTiny' =>  MobilePage::TINY_IMAGE_WIDTH . 'px',
				'wgMFThumbnailSmall' =>  MobilePage::SMALL_IMAGE_WIDTH . 'px'
			)
		);
	}

	/**
	 * EventLoggingRegisterSchemas hook handler.
	 *
	 * Registers our EventLogging schemas so that they can be converted to
	 * ResourceLoaderSchemaModules by the EventLogging extension.
	 *
	 * If the module has already been registered in
	 * onResourceLoaderRegisterModules, then it is overwritten.
	 *
	 * @param array $schemas The schemas currently registered with the EventLogging
	 *  extension
	 * @return bool Always true
	 */
	public static function onEventLoggingRegisterSchemas( &$schemas ) {
		$schemas['MobileWebMainMenuClickTracking'] = 11568715;
		$schemas['MobileWebSearch'] = 12054448;
		$schemas['MobileWebLanguageSwitcher'] = 15302503;
		return true;
	}

	/**
	 * Registers the mobile.logging.* modules.
	 *
	 * If the EventLogging extension is loaded, then the modules are defined such that they
	 * depend on their associated EventLogging-created schema module.
	 *
	 * If, however, the EventLogging extension isn't loaded, then the modules are defined such
	 * that no additional assets are requested by the ResourceLoader, i.e. they are stub
	 * modules.
	 *
	 * @param ResourceLoader &$resourceLoader The ResourceLoader object
	 */
	private static function registerMobileLoggingSchemasModule( $resourceLoader ) {
		$mfResourceFileModuleBoilerplate = array(
			'localBasePath' => dirname( __DIR__ ),
			'remoteExtPath' => 'MobileFrontend',
			'targets' => array( 'mobile', 'desktop' ),
		);

		$schemaEdit = $mfResourceFileModuleBoilerplate;
		$schemaMobileWebLanguageSwitcher = $mfResourceFileModuleBoilerplate;
		$schemaMobileWebMainMenuClickTracking = $mfResourceFileModuleBoilerplate;
		$schemaMobileWebSearch = $mfResourceFileModuleBoilerplate;

		if ( class_exists( 'EventLogging' ) ) {
			// schema.Edit is provided by WikimediaEvents
			if ( $resourceLoader->isModuleRegistered( 'schema.Edit' ) ) {
				$schemaEdit += array(
					'dependencies' => array(
						'schema.Edit',
						'mobile.user'
					),
					'scripts' => array(
						'resources/mobile.loggingSchemas/schemaEdit.js',
					)
				);
			}
			$schemaMobileWebLanguageSwitcher += array(
				'dependencies' => array(
					'schema.MobileWebLanguageSwitcher',
					'mobile.context'
				),
				'scripts' => array(
					'resources/mobile.loggingSchemas/schemaMobileWebLanguageSwitcher.js',
				),
			);
			$schemaMobileWebMainMenuClickTracking += array(
				'dependencies' => array(
					'schema.MobileWebMainMenuClickTracking',
					'mobile.context',
					'mobile.user'
				),
				'scripts' => array(
					'resources/mobile.loggingSchemas/schemaMobileWebMainMenuClickTracking.js',
				)
			);
			$schemaMobileWebSearch += array(
				'dependencies' => array(
					'schema.MobileWebSearch',
					'mobile.context'
				),
				'scripts' => array(
					'resources/mobile.loggingSchemas/schemaMobileWebSearch.js',
				)
			);
		}

		$resourceLoader->register( array(
			'mobile.loggingSchemas.edit' => $schemaEdit,
			'mobile.loggingSchemas.mobileWebLanguageSwitcher' =>
				$schemaMobileWebLanguageSwitcher,
			'mobile.loggingSchemas.mobileWebMainMenuClickTracking' =>
				$schemaMobileWebMainMenuClickTracking,
			'mobile.loggingSchemas.mobileWebSearch' => $schemaMobileWebSearch,
		) );
	}

	/**
	 * OutputPageParserOutput hook handler
	 * Disables TOC in output before it grabs HTML
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/OutputPageParserOutput
	 *
	 * @param OutputPage $outputPage
	 * @param ParserOutput $po
	 * @return bool
	 */
	public static function onOutputPageParserOutput( $outputPage, ParserOutput $po ) {
		global $wgMFWikibaseImageCategory;

		$context = MobileContext::singleton();
		$isBeta = $context->isBetaGroupMember();
		$mfUseWikibaseDescription = $context->getMFConfig()->get( 'MFUseWikibaseDescription' );

		if ( $context->shouldDisplayMobileView() ) {
			$outputPage->enableTOC( false );
			$outputPage->setProperty( 'MFTOC', $po->getTOCHTML() !== '' );

			if ( $mfUseWikibaseDescription && $isBeta ) {
				$item = $po->getProperty( 'wikibase_item' );
				if ( $item ) {
					$desc = ExtMobileFrontend::getWikibaseDescription( $item );
					$category =  ExtMobileFrontend::getWikibasePropertyValue( $item, $wgMFWikibaseImageCategory );
					if ( $desc ) {
						$outputPage->setProperty( 'wgMFDescription', $desc );
					}
					if ( $category ) {
						$outputPage->setProperty( 'wgMFImagesCategory', $category );
					}
				}
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
	public static function onHTMLFileCache_useFileCache() {
		return !MobileContext::singleton()->shouldDisplayMobileView();
	}

	/**
	 * Omit srcset attributes from thumbnail image tags, to conserve bandwidth.
	 *
	 * @param ThumbnailImage $thumbnail
	 * @param array &$attribs
	 * @param array &$linkAttribs
	 */
	public static function onThumbnailBeforeProduceHTML( $thumbnail, &$attribs, &$linkAttribs ) {
		if ( MobileContext::singleton()->shouldDisplayMobileView() ) {
			unset( $attribs['srcset'] );
		}
	}

	/**
	 * LoginFormValidErrorMessages hook handler to promote MF specific error message be valid.
	 *
	 * @param array $messages Array of already added messages
	 */
	public static function onLoginFormValidErrorMessages( &$messages ) {
		$messages = array_merge( $messages,
			array(
				'mobile-frontend-watchlist-signup-action', // watchstart sign up CTA
				'mobile-frontend-watchlist-purpose', // Watchlist and watchstar sign in CTA
				'mobile-frontend-donate-image-anon', // Uploads link
				'mobile-frontend-edit-login-action', // Edit button sign in CTA
				'mobile-frontend-edit-signup-action', // Edit button sign-up CTA
				'mobile-frontend-donate-image-login-action',
				'mobile-frontend-generic-login-new', // default message
			)
		);
	}

	/**
	 * Handler for MakeGlobalVariablesScript hook.
	 * For values that depend on the current page, user or request state.
	 *
	 * @see http://www.mediawiki.org/wiki/Manual:Hooks/MakeGlobalVariablesScript
	 * @param &$vars array Variables to be added into the output
	 * @param $outputPage OutputPage instance calling the hook
	 * @return bool true in all cases
	 */
	public static function onMakeGlobalVariablesScript( array &$vars, OutputPage $out ) {
		// If the device is a mobile, Remove the category entry.
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() ){
			unset( $vars['wgCategories'] );
			$vars['wgMFMode'] = $context->isBetaGroupMember() ? 'beta' : 'stable';
			$vars['wgMFLazyLoadImages'] = $context->isLazyLoadImagesEnabled();
			$vars['wgMFLazyLoadReferences'] = $context->isLazyLoadReferencesEnabled();
		}
		$title = $out->getTitle();
		$vars['wgPreferredVariant'] = $title->getPageLanguage()->getPreferredVariant();
		return true;
	}

	/**
	 * Handler for TitleSquidURLs hook to add copies of the cache purge
	 * URLs which are transformed according to the wgMobileUrlTemplate, so
	 * that both mobile and non-mobile URL variants get purged.
	 *
	 * @see * http://www.mediawiki.org/wiki/Manual:Hooks/TitleSquidURLs
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
	 * @param AuthenticationRequest[] $requests
	 * @param array $fieldInfo Field description as given by AuthenticationRequest::mergeFieldInfo
	 * @param array $formDescriptor A form descriptor suitable for the HTMLForm constructor
	 * @param string $action One of the AuthManager::ACTION_* constants
	 */
	public static function onAuthChangeFormFields(
		array $requests, array $fieldInfo, array &$formDescriptor, $action
	) {
		$context = MobileContext::singleton();
		$mfLogo = $context->getMFConfig()->get( 'MobileFrontendLogo' );

		// do nothing in desktop mode
		if ( $context->shouldDisplayMobileView() && $mfLogo ) {
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
	 * Handler for Extension registration callback
	 */
	public static function onRegistration() {
		global $wgResourceLoaderLESSImportPaths, $wgMinervaPageActions, $wgMinervaEnableSiteNotice,
			$wgDisableAuthManager, $wgAuthManagerAutoConfig;

		// modify login/registration form
		if ( class_exists( \MediaWiki\Auth\AuthManager::class ) && !$wgDisableAuthManager ) {
			Hooks::register( 'AuthChangeFormFields', 'MobileFrontendHooks::onAuthChangeFormFields' );
		} else {
			Hooks::register( 'UserLoginForm', 'MobileFrontendHooks::onUserLoginForm' );
			Hooks::register( 'UserCreateForm', 'MobileFrontendHooks::onUserCreateForm' );
		}

		// Set LESS importpath
		$wgResourceLoaderLESSImportPaths[] = dirname( __DIR__ ) . "/minerva.less/";

		$config = MobileContext::singleton()->getConfig();

		// For backwards compatiblity update new Minerva prefixed global with old MF value
		if ( $config->has( 'MFPageActions' ) ) {
			// FIXME: Use wfDeprecated to officially deprecate in later patchset
			$wgMinervaPageActions = $config->get( 'MFPageActions' );
		}
		// For backwards compatiblity.
		if ( $config->has( 'MFEnableSiteNotice' ) ) {
			// FIXME: Use wfDeprecated to officially deprecate in later patchset
			$wgMinervaEnableSiteNotice = $config->get( 'MFEnableSiteNotice' );
		}
	}
}
