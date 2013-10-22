<?php
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
			foreach( $sections as $section ) {
				if ( $section['toclevel'] == 1 ) {
					$numTopics += 1;
				}
			}
			$lu->mProperties['page_top_level_section_count'] = $numTopics;
		}

		return true;
	}

	/**
	 * RequestContextCreateSkin hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/RequestContextCreateSkin
	 *
	 * @param $context IContextSource
	 * @param $skin Skin
	 * @return bool
	 */
	public static function onRequestContextCreateSkin( $context, &$skin ) {
		global $wgMFEnableDesktopResources, $wgMFDefaultSkinClass;

		// check whether or not the user has requested to toggle their view
		$mobileContext = MobileContext::singleton();
		$mobileContext->checkToggleView();

		if ( !$mobileContext->shouldDisplayMobileView()
			|| $mobileContext->isBlacklistedPage() )
		{
			// add any necessary resources for desktop view, if enabled
			if ( $wgMFEnableDesktopResources ) {
				$out = $context->getOutput();
				$out->addModules( 'mobile.desktop' );
			}
			return true;
		}

		// Handle any X-Analytics header values in the request by adding them
		// as log items. X-Analytics header values are serialized key=value
		// pairs, separated by ';', used for analytics purposes.
		if ( $xanalytics = $mobileContext->getRequest()->getHeader( 'X-Analytics' ) ) {
			$xanalytics_arr = explode( ';', $xanalytics );
			if ( count( $xanalytics_arr ) > 1 ) {
				foreach ( $xanalytics_arr as $xanalytics_item ) {
					$mobileContext->addAnalyticsLogItemFromXAnalytics( $xanalytics_item );
				}
			} else {
				$mobileContext->addAnalyticsLogItemFromXAnalytics( $xanalytics );
			}
		}

		// log whether user is using alpha/beta/stable
		$mobileContext->logMobileMode();

		if ( $mobileContext->getContentFormat() == 'WML' ) {
			# Grab the skin class and initialise it.
			$skin = new SkinMobileWML( $context );
		} else {
			$skinName = $wgMFDefaultSkinClass;
			$betaSkinName = $skinName . 'Beta';
			$alphaSkinName = $skinName . 'Alpha';
			// Force alpha for test mode to sure all modules can run
			$inTestMode = $context->getTitle()->getDBkey() === 'JavaScriptTest/qunit';
			if ( ( $mobileContext->isAlphaGroupMember() || $inTestMode ) && class_exists( $alphaSkinName ) ) {
				$skinName = $alphaSkinName;
			} else if ( $mobileContext->isBetaGroupMember() && class_exists( $betaSkinName ) ) {
				$skinName = $betaSkinName;
			}
			$skin = new $skinName( $context );
		}

		return false;
	}

	/**
	 * SkinTemplateOutputPageBeforeExec hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SkinTemplateOutputPageBeforeExec
	 *
	 * Adds a link to view the current page in 'mobile view' to the desktop footer.
	 *
	 * @param $obj Article
	 * @param $tpl QuickTemplate
	 * @return bool
	 */
	public static function onSkinTemplateOutputPageBeforeExec( &$obj, &$tpl ) {
		global $wgMobileUrlTemplate;
		wfProfileIn( __METHOD__ );

		$title = $obj->getTitle();
		$isSpecial = $title->isSpecialPage();

		if ( ! $isSpecial ) {
			$footerlinks = $tpl->data['footerlinks'];
			$args = $tpl->getSkin()->getRequest()->getValues();
			/**
			 * Adds query string to force mobile view if we're not using $wgMobileUrlTemplate
			 * This is to preserve pretty/canonical links for a happy cache where possible (eg WMF cluster)
			 */
			if ( !strlen( $wgMobileUrlTemplate ) ) {
				// avoid title being set twice
				unset( $args['title'] );
				$args['mobileaction'] = 'toggle_view_mobile';
			}
			$mobileViewUrl = $title->getFullURL( $args );
			$mobileViewUrl = MobileContext::singleton()->getMobileUrl( $mobileViewUrl );

			$link = Html::element( 'a',
				array( 'href' => $mobileViewUrl, 'class' => 'noprint stopMobileRedirectToggle' ),
				wfMessage( 'mobile-frontend-view' )->text()
			);
			$tpl->set( 'mobileview', $link );
			$footerlinks['places'][] = 'mobileview';
			$tpl->set( 'footerlinks', $footerlinks );
		}
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * BeforePageRedirect hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageRedirect
	 *
	 * Ensures URLs are handled properly for select special pages.
	 * @param $out OutputPage
	 * @param $redirect
	 * @param $code
	 * @return bool
	 */
	public static function onBeforePageRedirect( $out, &$redirect, &$code ) {
		wfProfileIn( __METHOD__ );

		$context = MobileContext::singleton();
		$shouldDisplayMobileView = $context->shouldDisplayMobileView();
		if ( !$shouldDisplayMobileView ) {
			wfProfileOut( __METHOD__ );
			return true;
		}

		// Bug 43123: force mobile URLs only for local redirects
		if ( MobileContext::isLocalUrl( $redirect ) ) {
			$out->addVaryHeader( 'X-Subdomain');
			$out->addVaryHeader( 'X-CS' );
			$redirect = $context->getMobileUrl( $redirect );
		}

		wfProfileOut( __METHOD__ );
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
	public static function onResourceLoaderTestModules( array &$testModules, ResourceLoader &$resourceLoader ) {
		global $wgResourceModules;

		$testModuleBoilerplate = array(
			'localBasePath' => dirname( __DIR__ ),
			'remoteExtPath' => 'MobileFrontend',
			'targets' => array( 'mobile' ),
		);

		// additional frameworks and fixtures we use in tests
		$testModules['qunit']['mobile.tests.base'] = $testModuleBoilerplate + array(
			'scripts' => array(
				'tests/externals/sinon.js',
				'tests/javascripts/fixtures.js',
			),
		);

		// find test files for every RL module
		foreach ( $wgResourceModules as $key => $module ) {
			if ( substr( $key, 0, 7 ) === 'mobile.' && isset( $module['scripts'] ) ) {
				$testFiles = array();
				foreach ( $module['scripts'] as $script ) {
					$testFile = 'tests/' . dirname( $script ) . '/test_' . basename( $script );
					// if a test file exists for a given JS file, add it
					if ( file_exists( $testModuleBoilerplate['localBasePath'] . '/' . $testFile ) ) {
						$testFiles[] = $testFile;
					}
				}
				// if test files exist for given module, create a corresponding test module
				if ( !empty( $testFiles ) ) {
					$testModules['qunit']["$key.tests"] = $testModuleBoilerplate + array(
						'dependencies' => array( 'mobile.tests.base', $key ),
						'scripts' => $testFiles,
					);
				}
			}
		}

		return true;
	}

	/**
	 * GetCacheVaryCookies hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetCacheVaryCookies
	 *
	 * @param $out OutputPage
	 * @param $cookies array
	 * @return bool
	 */
	public static function onGetCacheVaryCookies( $out, &$cookies ) {
		global $wgMobileUrlTemplate;

		$cookies[] = MobileContext::USEFORMAT_COOKIE_NAME; // Enables mobile cookies on wikis w/o mobile domain
		$cookies[] = 'stopMobileRedirect'; // Don't redirect to mobile if user had explicitly opted out of it
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() || !$wgMobileUrlTemplate ) {
			$cookies[] = 'optin'; // Alpha/beta cookie
			$cookies[] = 'disableImages';
		}
		// Redirect people who want so from HTTP to HTTPS. Ideally, should be only for HTTP but we don't vary on protocol
		$cookies[] = 'forceHTTPS';
		return true;
	}

	/**
	 * ResourceLoaderGetConfigVars hook handler
	 * This should be used for variables which vary with the html
	 * and for variables this should work cross skin
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderGetConfigVars
	 *
	 * @param array $vars
	 * @return boolean
	 */
	public static function onResourceLoaderGetConfigVars( &$vars ) {
		global $wgCookiePath, $wgMFNearbyEndpoint, $wgMFNearbyNamespace;
		$ctx = MobileContext::singleton();
		$wgStopMobileRedirectCookie = array(
			'name' => 'stopMobileRedirect',
			'duration' => $ctx->getUseFormatCookieDuration() / ( 24 * 60 * 60 ), // in days
			'domain' => $ctx->getStopMobileRedirectCookieDomain(),
			'path' => $wgCookiePath,
		);
		$vars['wgStopMobileRedirectCookie'] = $wgStopMobileRedirectCookie;
		$vars['wgMFNearbyEndpoint'] = $wgMFNearbyEndpoint;
		$vars['wgMFNearbyNamespace'] = $wgMFNearbyNamespace;
		return true;
	}

	/**
	 * Hook for SpecialPage_initList in SpecialPageFactory.
	 *
	 * @param array &$list: list of special page classes
	 * @return boolean hook return value
	 */
	public static function onSpecialPage_initList( &$list ) {
		$ctx = MobileContext::singleton();
		if ( $ctx->shouldDisplayMobileView() ) {
			// Replace the standard watchlist view with our custom one
			$list['Watchlist'] = 'SpecialMobileWatchlist';
			// FIXME: Make uploads work on desktop
			$list['Uploads'] = 'SpecialUploads';
			$list['Userlogin'] = 'SpecialMobileUserlogin';

			if ( class_exists( 'MWEchoNotifUser' ) ) {
				$list['Notifications'] = 'SpecialMobileNotifications';
			}

			$list['UserProfile'] = 'SpecialUserProfile';
		}
		return true;
	}

	/**
	 * ListDefinedTags hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ListDefinedTags
	 * @param $tags
	 *
	 * @return bool
	 */
	public static function onListDefinedTags( &$tags ) {
		$tags[] = 'mobile edit';
		return true;
	}

	/**
	 * RecentChange_save hook handler that tags mobile changes
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/RecentChange_save
	 * @param RecentChange $rc
	 *
	 * @return bool
	 */
	public static function onRecentChange_save( RecentChange $rc ) {
		$context = MobileContext::singleton();
		$logType = $rc->getAttribute( 'rc_log_type' );
		// Only log edits and uploads
		if ( $context->shouldDisplayMobileView() && ( $logType === 'upload' || is_null( $logType ) ) ) {
			$rcId = $rc->getAttribute( 'rc_id' );
			$revId = $rc->getAttribute( 'rc_this_oldid' );
			$logId = $rc->getAttribute( 'rc_logid' );
			ChangeTags::addTags( 'mobile edit', $rcId, $revId, $logId );
		}
		return true;
	}

	/**
	 * AbuseFilter-getUserVars hook handler that adds a user_mobile variable.
	 *
	 * @param $vars AbuseFilterVariableHolder object to add vars to
	 * @param $user User object
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
	 * @param &$builder array Array in AbuseFilter::getBuilderValues to add to.
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
	 * $wgMFForceSecureLogin == true - but only when using the
	 * mobile site.
	 *
	 * @param $special SpecialPage
	 * @param $subpage string
	 * @return bool
	 */
	public static function onSpecialPageBeforeExecute( SpecialPage $special, $subpage ) {
		global $wgMFForceSecureLogin;
		$mobileContext = MobileContext::singleton();
		$isMobileView = $mobileContext->shouldDisplayMobileView();
		if ( $special->getName() != 'Userlogin' || !$isMobileView ) {
			// no further processing necessary
			return true;
		}

		$out = $special->getContext()->getOutput();
		if ( $special->getName() === 'Search' ) {
			$out->addModuleStyles( 'mobile.search.styles' );
		}

		// go no further if we're not dealing with the login page
		if ( $special->getName() != 'Userlogin' ) {
			return true;
		}

		$out->addModuleStyles( 'mobile.userlogin.styles' );

		// make sure we're on https if we're supposed to be and currently aren't.
		// most of this is lifted from https redirect code in SpecialUserlogin::execute()
		// also, checking for 'https' in $wgServer is a little funky, but this is what
		// is done on the WMF cluster (see config in CommonSettings.php)
		if ( $wgMFForceSecureLogin && WebRequest::detectProtocol() != 'https' ) {
			// get the https url and redirect
			$query = $special->getContext()->getRequest()->getQueryValues();
			if ( isset( $query['title'] ) )  {
				unset( $query['title'] );
			}
			$url = $mobileContext->getMobileUrl(
				$special->getFullTitle()->getFullURL( $query ),
				true
			);
			$special->getContext()->getOutput()->redirect( $url );
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

	/*
	 * UserLoginForm hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/UserLoginForm
	 *
	 * @param QuickTemplate $template Login form template object
	 * @return bool
	 */
	public static function onUserLoginForm( &$template ) {
		wfProfileIn( __METHOD__ );
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() ) {
			$template = new UserLoginMobileTemplate( $template );
		}
		wfProfileOut( __METHOD__ );
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
		wfProfileIn( __METHOD__ );
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() ) {
			$template = new UserAccountCreateMobileTemplate( $template );
		}
		wfProfileOut( __METHOD__ );
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
		global $wgMFEnableXAnalyticsLogging;
		wfProfileIn( __METHOD__ );

		$context = MobileContext::singleton();
		if ( !$context->shouldDisplayMobileView() ) {
			wfProfileOut( __METHOD__);
			return true;
		}

		// Set X-Analytics HTTP response header if necessary
		if ( $wgMFEnableXAnalyticsLogging ) {
			$analyticsHeader = $context->getXAnalyticsHeader();
			if ( $analyticsHeader ) {
				$resp = $out->getRequest()->response();
				$resp->header( $analyticsHeader );
			}
		}

		$request = $context->getRequest();
		$xWap = $request->getHeader( 'X-WAP' );
		if ( $xWap ) {
			$out->addVaryHeader( 'X-WAP' );
			$request->response()->header( "X-WAP: $xWap" );
		}
		$out->addVaryHeader( 'Cookie' );

		wfProfileOut( __METHOD__ );
		return true;
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

		// redirect to mobile editor instead of showing desktop editor
		if ( $context->shouldDisplayMobileView() ) {
			$output = $context->getOutput();
			$data = $output->getRequest()->getValues();
			// Unset these to avoid a redirect loop but make sure we pass other parameters to edit e.g. undo actions
			unset( $data['action'] );
			unset( $data['title'] );
			$articleUrl = $context->getMobileUrl( $article->getTitle()->getFullURL( $data ) );
			$section = (int)$output->getRequest()->getVal( 'section', 0 );
			$output->redirect( $articleUrl . '#editor/' . $section );
			return false;
		}

		return true;
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
		$definition = array(
			'type' => 'api',
			'default' => '',
		);
		$preferences[SpecialMobileWatchlist::FILTER_OPTION_NAME] = $definition;
		$preferences[SpecialMobileWatchlist::VIEW_OPTION_NAME] = $definition;

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
	 * @param $files array
	 * @return bool
	 */
	public static function onUnitTestsList( &$files ) {
		$dir = dirname( dirname( __FILE__ ) ) . '/tests';

		$files[] = "$dir/ApiParseExtenderTest.php";
		$files[] = "$dir/DeviceDetectionTest.php";
		$files[] = "$dir/ExtractFormatterTest.php";
		$files[] = "$dir/MobileContextTest.php";
		$files[] = "$dir/MobileFormatterTest.php";
		$files[] = "$dir/MobileFrontendHooksTest.php";
		$files[] = "$dir/modules/MFResourceLoaderModuleTest.php";

		// special page tests
		$files[] = "$dir/specials/SpecialMobileDiffTest.php";
		return true;
	}

	/**
	 * CentralAuthLoginRedirectData hook handler
	 * Saves mobile host so that the CentralAuth wiki could redirect back properly
	 *
	 * @param $centralUser
	 * @param $data
	 *
	 * @return bool
	 */
	public static function onCentralAuthLoginRedirectData( $centralUser, &$data ) {
		global $wgServer;
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() ) {
			$data['mobileServer'] = $context->getMobileUrl( $wgServer );
		}
		return true;
	}

	/**
	 * CentralAuthSilentLoginRedirect hook handler
	 * Points redirects from CentralAuth wiki to mobile domain if user has logged in from it
	 *
	 * @param $centralUser
	 * @param $url
	 * @param $info
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
	 * UserRequiresHTTPS hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/UserRequiresHTTPS
	 *
	 * @param User $user
	 * @param bool $https
	 *
	 * @return bool
	 */
	public static function onUserRequiresHTTPS( $user, &$https ) {
		// WAP phones allegedly can't handle HTTPS, don't redirect them there
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() && $context->getDevice()->format() === 'wml' ) {
			$https = false;
			return false; // Stop further hook processing
		}
		return true;
	}
}
