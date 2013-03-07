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
	 * MakeGlobalVariablesScript hook handler
	 * @see http://www.mediawiki.org/wiki/Manual:Hooks/MakeGlobalVariablesScript
	 * Adds various mobile specific config variables
	 *
	 * @param array &$vars
	 * @param OutputPage $out
	 * @return boolean
	 */
	public static function onMakeGlobalVariablesScript( &$vars, $out ) {
		global $wgMFPhotoUploadEndpoint, $wgCookiePath, $wgPhotoUploadAppendToDesc;

		$context = MobileContext::singleton();
		$title = $out->getTitle();
		$user = $out->getUser();
		if ( !$user->isAnon() ) {
			$vars[ 'wgWatchedPageCache' ] = array(
				$title->getText() => $user->isWatched( $title ),
			);
		}
		$vars[ 'wgMFPhotoUploadEndpoint' ] = $wgMFPhotoUploadEndpoint ? $wgMFPhotoUploadEndpoint : '';
		// cookie specific
		$vars[ 'wgUseFormatCookie' ] = array(
			'name' => $context->getUseFormatCookieName(),
			'duration' => -1, // in days
			'path' => $wgCookiePath,
			'domain' => $_SERVER['HTTP_HOST'],
		);
		$vars[ 'wgStopMobileRedirectCookie' ] = array(
			'name' => 'stopMobileRedirect',
			'duration' => $context->getUseFormatCookieDuration() / ( 24 * 60 * 60 ), // in days
			'domain' => $context->getStopMobileRedirectCookieDomain(),
			'path' => $wgCookiePath,
		);
		$vars[ 'wgPhotoUploadAppendToDesc' ] = $wgPhotoUploadAppendToDesc;
		$vars[ 'wgImagesDisabled' ] = $context->imagesDisabled();

		if ( $context->isAlphaGroupMember() ) {
			$env = 'alpha';
		} else if ( $context->isBetaGroupMember() ) {
			$env = 'beta';
		} else {
			$env = 'stable';
		}
		$vars[ 'wgMFMode' ] = $env;
		$vars[ 'wgIsPageEditable' ] = $user->isAllowed( 'edit' ) && $title->getNamespace() == NS_MAIN;
		$vars[ 'wgPreferredVariant' ] = $title->getPageLanguage()->getPreferredVariant();
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
		global $wgMFEnableDesktopResources, $wgExtMobileFrontend;

		// check whether or not the user has requested to toggle their view
		$mobileContext = MobileContext::singleton();
		$mobileContext->checkToggleView();

		if ( !$mobileContext->shouldDisplayMobileView() ) {
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

		$skin = SkinMobile::factory( $wgExtMobileFrontend );
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
			/**
			 * Adds query string to force mobile view if we're not using $wgMobileUrlTemplate
			 * This is to preserve pretty/canonical links for a happy cache where possible (eg WMF cluster)
			 */
			$queryString =  strlen( $wgMobileUrlTemplate ) ? '' : 'mobileaction=toggle_view_mobile';
			$mobileViewUrl = $title->getFullURL( $queryString );

			$mobileViewUrl = MobileContext::singleton()->getMobileUrl( wfExpandUrl( $mobileViewUrl ) );
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
		$testModules['qunit']['ext.mobilefrontend.tests'] = array(
			'messages' => array(
				'mobile-frontend-search-noresults',
			),
			'scripts' => array(
				'tests/externals/sinon.js',
				'javascripts/externals/hogan.js',
				'javascripts/common/modules.js',
				'javascripts/common/eventemitter.js', 'tests/js/test_eventemitter.js',
				'tests/js/fixtures.js', 'javascripts/common/mf-application.js',
				'tests/js/fixtures-templates.js',
				'javascripts/common/mf-history.js', 'tests/js/test_mf-history.js',
				'tests/js/test_application.js',
				'javascripts/common/mf-oop.js', 'tests/js/test_mf-oop.js',
				'javascripts/common/mf-api.js', 'tests/js/test_mf-api.js',
				'javascripts/common/mf-view.js', 'tests/js/test_mf-view.js',
				'javascripts/widgets/progress-bar.js', 'tests/js/widgets/test_progress-bar.js',
				'javascripts/modules/mf-search.js', 'tests/js/test_beta_opensearch.js',
				'javascripts/common/mf-settings.js', 'tests/js/test_settings.js',
				'javascripts/modules/mf-banner.js', 'tests/js/test_banner.js',
				'javascripts/modules/mf-toggle.js', 'tests/js/test_toggle.js',
				'javascripts/modules/mf-toggle-dynamic.js',
				'javascripts/actions/mf-edit.js', 'tests/js/test_mf-edit.js',
				'javascripts/common/mf-navigation.js',
				'javascripts/common/mf-notification.js',
				'javascripts/modules/mf-photo.js', 'tests/js/test_mf-photo.js',
				'javascripts/modules/mf-references.js', 'tests/js/test_references.js',
				'javascripts/modules/mf-watchstar.js', 'tests/js/test_mf-watchstar.js',
				'javascripts/modules/mf-last-modified.js', 'tests/js/test_mf-last-modified.js',

				'javascripts/specials/donateimage.js', 'tests/js/specials/donateimage.js',
				),
				'dependencies' => array( ),
				'localBasePath' => dirname( dirname( __FILE__ ) ),
				'remoteExtPath' => 'MobileFrontend',
		);
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
		$cookies[] = 'mf_useformat';
		return true;
	}

	/**
	 * ResourceLoaderRegisterModules hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderRegisterModules
	 *
	 * @param ResourceLoader $resourceLoader
	 * @return bool
	 */
	public static function onResourceLoaderRegisterModules( ResourceLoader &$resourceLoader ) {
		global $wgAutoloadClasses, $wgMFLogEvents, $wgResourceModules;

		$detector = DeviceDetection::factory();
		foreach ( $detector->getCssFiles() as $file ) {
			$resourceLoader->register( "mobile.device.$file",
				array(
					'styles' => array( "stylesheets/devices/{$file}.css" ),
					'localBasePath' => dirname( __DIR__ ),
					'remoteExtPath' => 'MobileFrontend',
				)
			);
		}

		// disable event logging module on mobile
		if ( !$wgMFLogEvents && isset( $wgResourceModules['ext.eventLogging'] ) ) {
			$wgResourceModules['ext.eventLogging']['targets'] = array( 'desktop' );
		}

		return true;
	}

	/**
	 * ResourceLoaderGetConfigVars hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderGetConfigVars
	 *
	 * @param array $vars
	 * @return boolean
	 */
	public static function onResourceLoaderGetConfigVars( &$vars ) {
		global $wgCookiePath;
		$vars['wgCookiePath'] = $wgCookiePath;
		$vars['wgMFStopRedirectCookieHost'] = MobileContext::singleton()->getStopMobileRedirectCookieDomain();
		return true;
	}

	/**
	 * Hook for SpecialPage_initList in SpecialPageFactory.
	 *
	 * @param array &$list: list of special page classes
	 * @return boolean hook return value
	 */
	public static function onSpecialPage_initList( &$list ) {
		if ( MobileContext::singleton()->shouldDisplayMobileView() ) {
			// Replace the standard watchlist view with our custom one
			$list['Watchlist'] = 'SpecialMobileWatchlist';
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
		if ( $special->getName() != 'Userlogin' || !$mobileContext->shouldDisplayMobileView() ) {
			// no further processing necessary
			return true;
		}

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
			if ( !is_null( $title ) ) {
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

			if ( !$wgMFEnableXAnalyticsLogging ) {
				return true;
			}

			// Set X-Analytics HTTP response header if necessary
			$context = MobileContext::singleton();
			$analyticsHeader = $context->getXAnalyticsHeader();
			if ( $analyticsHeader ) {
				$resp = $out->getRequest()->response();
				$resp->header( $analyticsHeader );
			}

			wfProfileOut( __METHOD__ );
			return true;
	}
}
