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
	 * RequestContextCreateSkin hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/RequestContextCreateSkin
	 *
	 * @param IContextSource $context
	 * @param Skin $skin
	 * @return bool
	 */
	public static function onRequestContextCreateSkin( $context, &$skin ) {
		global $wgMFDefaultSkinClass, $wgULSPosition;

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

		$skinName = $wgMFDefaultSkinClass;
		$betaSkinName = $skinName . 'Beta';
		$alphaSkinName = $skinName . 'Alpha';
		// Force alpha for test mode to sure all modules can run
		$name = $context->getTitle()->getDBkey();
		$inTestMode =
			$name === SpecialPage::getTitleFor( 'JavaScriptTest', 'qunit' )->getDBkey();
		if ( ( $mobileContext->isAlphaGroupMember() || $inTestMode ) &&
			class_exists( $alphaSkinName ) ) {
			$skinName = $alphaSkinName;
		} elseif ( $mobileContext->isBetaGroupMember() && class_exists( $betaSkinName ) ) {
			$skinName = $betaSkinName;
		}
		$skin = new $skinName( $context );

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
		$title = $skin->getTitle();
		$context = MobileContext::singleton();

		if ( !$context->isBlacklistedPage() ) {
			$footerlinks = $tpl->data['footerlinks'];
			$args = $skin->getRequest()->getQueryValues();
			// avoid title being set twice
			unset( $args['title'] );
			unset( $args['useformat'] );
			$args['mobileaction'] = 'toggle_view_mobile';

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
			$out->addVaryHeader( 'X-Subdomain');
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
		global $wgResourceModules;

		$baseTemplateDir = 'tests/qunit/templates/';
		$testModuleBoilerplate = array(
			'localBasePath' => dirname( __DIR__ ),
			'remoteExtPath' => 'MobileFrontend',
			'targets' => array( 'mobile' ),
		);

		// find test files for every RL module
		foreach ( $wgResourceModules as $key => $module ) {
			if ( substr( $key, 0, 7 ) === 'mobile.' && isset( $module['scripts'] ) ) {
				$testFiles = array();
				$templates = array();
				foreach ( $module['scripts'] as $script ) {
					$testFile = 'tests/' . dirname( $script ) . '/test_' . basename( $script );
					$testFile = str_replace( 'tests/javascripts/', 'tests/qunit/', $testFile );
					// if a test file exists for a given JS file, add it
					if ( file_exists( $testModuleBoilerplate['localBasePath'] . '/' . $testFile ) ) {
						$testFiles[] = $testFile;
					}

					// FIXME: Rewrite/cleanup the template logic
					// save the relative name of the template directory
					$templateDir = str_replace( 'javascripts/', '', dirname( $script ) );
					// absolute filepath to the template dir (for several checks)
					$templateAbsoluteDir = dirname( __DIR__ ) . '/' . $baseTemplateDir . $templateDir;

					// check, if there is a template directory to load templates from
					if ( file_exists( $templateAbsoluteDir ) && is_dir( $templateAbsoluteDir ) ) {
						// open the template directory
						$templateHandle = opendir( $templateAbsoluteDir );
						// read and process all files in this directory
						while ( $template = readdir( $templateHandle ) ) {
							// only files can be loaded and every template should only be loaded once
							if (
								!is_file( $templateAbsoluteDir . '/' . $template ) ||
								in_array( $template, $templates )
							) {
								continue;
							}
							// add this template to the templates array
							$templates[$template] = $baseTemplateDir . $templateDir . '/' . $template;
						}
						// close the directory handle
						closedir( $templateHandle );
					}
				}

				// if test files exist for given module, create a corresponding test module
				if ( !empty( $testFiles ) ) {
					$testModules['qunit']["$key.tests"] = $testModuleBoilerplate + array(
						'dependencies' => array( $key ),
						'scripts' => $testFiles,
						'templates' => $templates,
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
	 * @param OutputPage $out
	 * @param array $cookies
	 * @return bool
	 */
	public static function onGetCacheVaryCookies( $out, &$cookies ) {
		global $wgMobileUrlTemplate;

		// Enables mobile cookies on wikis w/o mobile domain
		$cookies[] = MobileContext::USEFORMAT_COOKIE_NAME;
		// Don't redirect to mobile if user had explicitly opted out of it
		$cookies[] = 'stopMobileRedirect';

		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() || !$wgMobileUrlTemplate ) {
			$cookies[] = 'optin'; // Alpha/beta cookie
			$cookies[] = 'disableImages';
		}
		// Redirect people who want so from HTTP to HTTPS. Ideally, should be
		// only for HTTP but we don't vary on protocol.
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
		$context = MobileContext::singleton();
		$config = $context->getMFConfig();

		$vars += array(
			'wgMFNearbyEndpoint' => $config->get( 'MFNearbyEndpoint' ),
			'wgMFThumbnailSizes' => array(
				'tiny' =>  MobilePage::TINY_IMAGE_WIDTH,
				'small' =>  MobilePage::SMALL_IMAGE_WIDTH,
			),
			'wgMFContentNamespace' => $config->get( 'MFContentNamespace' ),
			'wgMFEditorOptions' => $config->get( 'MFEditorOptions' ),

			// Set the licensing agreement that is displayed in the editor.
			'wgMFLicenseLink' => SkinMinerva::getLicenseLink( 'editor' ),
			// Set the licensing agreement that is displayed in the uploading interface.
			'wgMFUploadLicenseLink' => SkinMinerva::getLicenseLink( 'upload' ),
		);

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

			if ( class_exists( 'MWEchoNotifUser' ) ) {
				$list['Notifications'] = 'SpecialMobileNotifications';
			}
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
		global $wgSecureLogin;
		$mobileContext = MobileContext::singleton();
		$isMobileView = $mobileContext->shouldDisplayMobileView();
		$out = $special->getContext()->getOutput();
		$skin = $out->getSkin()->getSkinName();

		$name = $special->getName();

		// Ensure desktop version of Special:Preferences page gets mobile targeted modules
		// FIXME: Upstream to core (?)
		if ( $name === 'Preferences' && $skin === 'minerva' ) {
			$out->addModules( 'skins.minerva.special.preferences.scripts' );
		}

		if ( $isMobileView ) {
			if ( $name === 'Search' ) {
				$out->addModuleStyles( 'skins.minerva.special.search.styles' );
			} elseif ( $name === 'Userlogin' ) {
				$out->addModuleStyles( 'skins.minerva.special.userlogin.styles' );
				$out->addModules( 'mobile.special.userlogin.scripts' );
				// make sure we're on https if we're supposed to be and currently aren't.
				// most of this is lifted from https redirect code in SpecialUserlogin::execute()
				// also, checking for 'https' in $wgServer is a little funky, but this is what
				// is done on the WMF cluster (see config in CommonSettings.php)
				if ( $wgSecureLogin && WebRequest::detectProtocol() != 'https' ) {
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
	 * UserLoginForm hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/UserLoginForm
	 *
	 * @param QuickTemplate $template Login form template object
	 * @return bool
	 */
	public static function onUserLoginForm( &$template ) {
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() && !$context->isAlphaGroupMember() ) {
			$template = new UserLoginMobileTemplate( $template );
		}

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
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() && !$context->isAlphaGroupMember() ) {
			$template = new UserAccountCreateMobileTemplate( $template );
		}

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
		global $wgMFEnableXAnalyticsLogging, $wgMFAppPackageId, $wgMFAppScheme;

		$context = MobileContext::singleton();

		$title = $sk->getTitle();
		$request = $context->getRequest();
		# Add deep link to a mobile app specified by $wgMFAppScheme
		if ( ( $wgMFAppPackageId !== false ) && ( $title->isContentPage() )
			&& ( $request->getRawQueryString() === '' )
		) {
			$fullUrl = $title->getFullURL();
			$mobileUrl = $context->getMobileUrl( $fullUrl );
			$path = preg_replace( "/^([a-z]+:)?(\/)*/", '', $mobileUrl, 1 );

			$scheme = 'http';
			if ( $wgMFAppScheme !== false ) {
				$scheme = $wgMFAppScheme;
			} else {
				$protocol = $request->getProtocol();
				if ( $protocol != '' ) {
					$scheme = $protocol;
				}
			}

			$hreflink = 'android-app://' . $wgMFAppPackageId . '/' . $scheme . '/' . $path;
			$out->addLink( array( 'rel' => 'alternate', 'href' => $hreflink ) );
		}

		$config = $context->getMFConfig();
		$mfNoIndexPages = $config->get( 'MFNoindexPages' );
		$mfMobileUrlTemplate = $config->get( 'MobileUrlTemplate' );
		$tabletSize = $config->get( 'MFDeviceWidthTablet' );
		// an alternate link is only useful, if the mobile and desktop URL are different
		// and $wgMFNoindexPages needs to be true
		// add alternate link to desktop sites - bug T91183
		if ( $mfMobileUrlTemplate && $mfNoIndexPages ) {
			$desktopUrl = $title->getFullUrl();
			$out->addHeadItem(
				'mobilelink',
				Html::element(
					'link',
					array(
						'rel' => 'alternate',
						'media' => 'only screen and (max-width: ' . $tabletSize . 'px)',
						'href' => $context->getMobileUrl( $desktopUrl ),
					)
				)
			);
		}
		if ( !$context->shouldDisplayMobileView() ) {
			return true;
		}
		// an canonical link is only useful, if the mobile and desktop URL are different
		// and $wgMFNoindexPages needs to be true
		// add canonical link to mobile pages, instead of noindex - bug T91183
		if ( $mfMobileUrlTemplate && $mfNoIndexPages ) {
			$out->addHeadItem(
				'desktoplink',
				Html::element(
					'link',
					array(
						'rel' => 'canonical',
						'href' => $title->getFullUrl(),
					)
				)
			);
		}

		// Set X-Analytics HTTP response header if necessary
		if ( $wgMFEnableXAnalyticsLogging ) {
			$analyticsHeader = $context->getXAnalyticsHeader();
			if ( $analyticsHeader ) {
				$resp = $out->getRequest()->response();
				$resp->header( $analyticsHeader );
			}
		}

		$out->addVaryHeader( 'Cookie' );

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
			// Unset these to avoid a redirect loop but make sure we pass other
			// parameters to edit e.g. undo actions
			unset( $data['action'] );
			unset( $data['title'] );

			$output->redirect( SpecialPage::getTitleFor( 'MobileEditor', $article->getTitle() )
				->getFullURL( $data ) );
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
		global $wgMFEnableMinervaBetaFeature;
		$definition = array(
			'type' => 'api',
			'default' => '',
		);
		$preferences[SpecialMobileWatchlist::FILTER_OPTION_NAME] = $definition;
		$preferences[SpecialMobileWatchlist::VIEW_OPTION_NAME] = $definition;

		// Remove the Minerva skin from the preferences unless Minerva has been enabled in
		// BetaFeatures.
		if ( !class_exists( 'BetaFeatures' )
			|| !BetaFeatures::isFeatureEnabled( $user, 'betafeatures-minerva' )
			|| !$wgMFEnableMinervaBetaFeature
		) {
			// Preference key/values are backwards. The value is the name of the skin. The
			// key is the text+links to display.
			if ( !empty( $preferences['skin']['options'] ) ) {
				$key = array_search( 'minerva', $preferences['skin']['options'] );
				unset( $preferences['skin']['options'][$key] );
			}
		}

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
		global $wgExtensionAssetsPath, $wgMFEnableMinervaBetaFeature;

		if ( $wgMFEnableMinervaBetaFeature ) {
			// Enable the mobile skin on desktop
			$preferences['betafeatures-minerva'] = array(
				'label-message' => 'beta-feature-minerva',
				'desc-message' => 'beta-feature-minerva-description',
				'info-link' => '//www.mediawiki.org/wiki/Beta_Features/Minerva',
				'discussion-link' => '//www.mediawiki.org/wiki/Talk:Beta_Features/Minerva',
				'screenshot' => array(
					'ltr' => "$wgExtensionAssetsPath/MobileFrontend/images/BetaFeatures/minerva-ltr.svg",
					'rtl' => "$wgExtensionAssetsPath/MobileFrontend/images/BetaFeatures/minerva-rtl.svg",
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
	 * ResourceLoaderRegisterModules hook handler
	 *
	 * Registers the mobile.loggingSchemas module without a dependency on the
	 * ext.EventLogging module so that calls to the various log functions are
	 * effectively NOPs.
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderRegisterModules
	 *
	 * @param ResourceLoader &$resourceLoader The ResourceLoader object
	 * @return bool Always true
	 */
	public static function onResourceLoaderRegisterModules( ResourceLoader &$resourceLoader ) {
		self::registerMobileLoggingSchemasModule();
		$config = MobileContext::singleton()->getMFConfig();

		// add VisualEditor related modules only, if VisualEditor seems to be installed - T85007
		if ( class_exists( 'VisualEditorHooks' ) ) {
			$resourceLoader->register( $config->get( 'MobileVEModules' ) );
		}

		if ( class_exists( 'CodeMirrorHooks' ) ) {
			$resourceLoader->register( $config->get( 'MobileCodeMirrorModules' ) );
		}

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
				'wgMFDeviceWidthTablet' => "{$config->get( 'MFDeviceWidthTablet' )}px",
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
	 * ResourceLoaderSchemaModules by the EventLogging extension as the
	 * mobile.loggingSchemas module.
	 *
	 * If the module has already been registered in
	 * onResourceLoaderRegisterModules, then it is overwritten.
	 *
	 * @param array $schemas The schemas currently registered with the EventLogging
	 *  extension
	 * @return bool Always true
	 */
	public static function onEventLoggingRegisterSchemas( &$schemas ) {
		$mobileEventLoggingSchemas = array(
			'MobileWebUploads'       => 8209043,
			'MobileWebEditing'       => 8599025,
			'MobileWebWatchlistClickTracking' => 10720361,
			'MobileWebDiffClickTracking' => 10720373,
			'MobileWebMainMenuClickTracking' => 11568715,
			'MobileWebUIClickTracking' => 10742159,
		);

		$schemas += $mobileEventLoggingSchemas;

		$additionalDependencies = array_map(
			function ( $schema ) {
				return "schema.{$schema}";
			},
			array_keys( $mobileEventLoggingSchemas )
		);
		self::registerMobileLoggingSchemasModule( $additionalDependencies, true );

		return true;
	}

	/**
	 * Registers the mobile.loggingSchemas module with any additional
	 * dependencies.
	 *
	 * @param array $additionalDependencies Additional dependencies that the module
	 *  depends on. Defaults to empty array
	 * @param boolean $overwrite Whether or not to re-register the module if it has
	 *  already been registered. Defaults to false
	 */
	private static function registerMobileLoggingSchemasModule(
		$additionalDependencies = array(),
		$overwrite = false
	) {
		global $wgResourceModules, $wgMFResourceFileModuleBoilerplate;

		if ( isset( $wgResourceModules['mobile.loggingSchemas'] ) && !$overwrite ) {
			return;
		}

		$scripts = array(
			'javascripts/loggingSchemas/SchemaMobileWebUploads.js',
			'javascripts/loggingSchemas/SchemaMobileWebClickTracking.js',
			'javascripts/loggingSchemas/SchemaMobileWebEditing.js',
		);

		$wgResourceModules['mobile.loggingSchemas'] = $wgMFResourceFileModuleBoilerplate + array(
			'dependencies' => array_merge( $additionalDependencies, array(
				'mobile.startup',
				'mobile.settings',
			) ),
			'scripts' => $scripts,
		);

		$wgResourceModules['skins.minerva.scripts']['scripts'][] = 'javascripts/loggingSchemas/init.js';
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
		global $wgMFUseWikibaseDescription;

		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() ) {
			$outputPage->enableTOC( false );
			$outputPage->setProperty( 'MinervaTOC', $po->getTOCHTML() !== '' );

			if ( $wgMFUseWikibaseDescription && $context->isAlphaGroupMember() ) {
				$item = $po->getProperty( 'wikibase_item' );
				if ( $item ) {
					$desc = ExtMobileFrontend::getWikibaseDescription( $item );
					if ( $desc ) {
						$outputPage->setProperty( 'wgMFDescription', $desc );
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
	 * LoginFormValidErrorMessages hook handler to promote MF specific error message be valid.
	 *
	 * @param array $messages Array of already added messages
	 */
	public static function onLoginFormValidErrorMessages( &$messages ) {
		$messages[] = 'mobile-frontend-donate-image-anon';
	}
}
