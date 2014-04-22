<?php

/**
 * Minerva: Born from the godhead of Jupiter with weapons!
 * A skin that works on both desktop and mobile
 * @ingroup Skins
 */
class SkinMinerva extends SkinTemplate {
	/**
	 * Describes whether reader is on a mobile device
	 * @var bool $isMobileMode
	 */
	protected $isMobileMode = false;
	public $skinname = 'minerva';
	public $template = 'MinervaTemplate';
	public $useHeadElement = true;
	/**
	 * Describes 'stability' of the skin - alpha, beta, stable
	 * @var string $mode
	 */
	protected $mode = 'stable';

	protected function prepareQuickTemplate() {
		global $wgAppleTouchIcon, $wgMFNoindexPages;
		wfProfileIn( __METHOD__ );
		$out = $this->getOutput();
		// add head items
		if ( $wgAppleTouchIcon !== false ) {
			$out->addHeadItem( 'touchicon',
				Html::element( 'link', array( 'rel' => 'apple-touch-icon', 'href' => $wgAppleTouchIcon ) )
			);
		}
		$out->addHeadItem( 'viewport',
			Html::element(
				'meta', array(
					'name' => 'viewport',
					'content' => 'initial-scale=1.0, user-scalable=yes, minimum-scale=0.25, maximum-scale=1.6',
				)
			)
		);
		// hide chrome on bookmarked sites
		$out->addHeadItem( 'apple-mobile-web-app-capable',
			Html::element( 'meta', array( 'name' => 'apple-mobile-web-app-capable', 'content' => 'yes' ) )
		);
		$out->addHeadItem( 'apple-mobile-web-app-status-bar-style',
			Html::element(
				'meta', array(
					'name' => 'apple-mobile-web-app-status-bar-style',
					'content' => 'black',
				)
			)
		);
		$out->addHeadItem( 'loadingscript', Html::inlineScript(
			"document.documentElement.className += ' page-loading';"
		) );
		if ( $wgMFNoindexPages ) {
			$out->setRobotPolicy( 'noindex,nofollow' );
		}

		if ( $this->isMobileMode ) {
			// @FIXME: This needs to occur before prepareQuickTemplate which wraps the body text in an
			// element with id mw-content-text
			// Otherwise we end up with an unnecessary div.
			$html = ExtMobileFrontend::DOMParse( $out );
		}
		// Generate template after doing the above...
		$tpl = parent::prepareQuickTemplate();
		$tpl->set( 'unstyledContent', $out->getProperty( 'unstyledContent' ) );

		$this->preparePageContent( $tpl );
		$this->prepareHeaderAndFooter( $tpl );
		$this->prepareSearch( $tpl );
		$this->prepareMenuButton( $tpl );
		$this->prepareBanners( $tpl );
		$this->prepareSiteLinks( $tpl );
		$this->prepareWarnings( $tpl );
		$this->preparePageActions( $tpl );
		$this->prepareUserButton( $tpl );
		$this->prepareDiscoveryTools( $tpl );
		$this->preparePersonalTools( $tpl );
		$this->prepareLanguages( $tpl );
		// FIXME: Remove need for a page-loading class
		$bottomScripts = Html::inlineScript(
			"document.documentElement.className = " .
				"document.documentElement.className.replace( 'page-loading', '' );"
		);
		$bottomScripts .= $this->bottomScripts();
		$tpl->set( 'bottomscripts', $bottomScripts );
		if ( $this->isMobileMode ) {
			$tpl->set( 'bodytext', $html );
			$this->prepareMobileFooterLinks( $tpl );
		}
		wfProfileOut( __METHOD__ );
		return $tpl;
	}

	/**
	 * Prepares the header and the content of a page
	 * Stores in QuickTemplate prebodytext, postbodytext keys
	 * @param QuickTemplate $tpl
	 */
	protected function preparePageContent( QuickTemplate $tpl ) {
		$title = $this->getTitle();

		// If it's a talk page, add a link to the main namespace page
		if ( $title->isTalkPage() ) {
			$tpl->set( 'subject-page', Linker::link(
				$title->getSubjectPage(),
				wfMessage( 'mobile-frontend-talk-back-to-page', $title->getText() ),
				array( 'class' => 'return-link' )
			) );
		}
	}

	/**
	 * Overrides Skin::doEditSectionLink
	 */
	public function doEditSectionLink( Title $nt, $section, $tooltip = null, $lang = false ) {
		$lang = wfGetLangObj( $lang );
		$message = wfMessage( 'mobile-frontend-editor-edit' )->inLanguage( $lang )->text();
		return Html::element( 'a', array(
			'href' => '#editor/' . $section,
			'data-section' => $section,
			'class' => 'edit-page'
		), $message );
	}

	/**
	 * Takes a title and returns classes to apply to the body tag
	 * @param Title $title
	 * @return string
	 */
	public function getPageClasses( $title ) {
		$className = $this->getMode();
		if ( $title->isMainPage() ) {
			$className .= ' page-Main_Page ';
		} elseif ( $title->isSpecialPage() ) {
			$className .= ' mw-mf-special ';
		}

		if ( $this->isMobileMode ) {
			$className .= ' mw-mobile-mode';
		} else {
			$className .= ' mw-desktop-mode';
		}
		if ( $this->isAuthenticatedUser() ) {
			$className .= ' is-authenticated';
		}
		return $className;
	}

	/**
	 * @return string The current mode of the skin [stable|beta|alpha|app] that is running
	 */
	protected function getMode() {
		return $this->mode;
	}

	/**
	 * @var MobileContext
	 */
	protected $mobileContext;

	/**
	 * FIXME: This helper function is only truly needed whilst SkinMobileApp does not support login
	 * @return bool Whether the current user is authenticated or not.
	 */
	protected function isAuthenticatedUser() {
		return !$this->getUser()->isAnon();
	}

	public function __construct() {
		$this->mobileContext = MobileContext::singleton();
		$this->isMobileMode = $this->mobileContext->shouldDisplayMobileView();
	}

	/**
	 * Initializes output page and sets up skin-specific parameters
	 * @param OutputPage $out object to initialize
	 */
	public function initPage( OutputPage $out ) {
		parent::initPage( $out );
		$out->addJsConfigVars( $this->getSkinConfigVariables() );
	}

	/**
	 * Prepares the user button.
	 * @param QuickTemplate $tpl
	 */
	protected function prepareUserButton( QuickTemplate $tpl ) {
		// Set user button to empty string by default
		$tpl->set( 'secondaryButton', '' );

		$user = $this->getUser();
		// If Echo is available, the user is logged in, and they are not already on the
		// notifications archive, show the notifications icon in the header.
		if ( class_exists( 'MWEchoNotifUser' ) && $user->isLoggedIn() ) {
			$currentTitle = $this->getTitle();
			$notificationsTitle = SpecialPage::getTitleFor( 'Notifications' );
			if ( $currentTitle->getPrefixedText() !== $notificationsTitle->getPrefixedText() ) {
				// FIXME: cap higher counts
				$count = MWEchoNotifUser::newFromUser( $user )->getNotificationCount();

				$tpl->set( 'secondaryButton',
					Html::openElement( 'a', array(
						'title' => wfMessage( 'mobile-frontend-user-button-tooltip' ),
						'href' => $notificationsTitle->getLocalURL(
							array( 'returnto' => $currentTitle->getPrefixedText() ) ),
						'class' => 'user-button main-header-button',
						'id'=> 'secondary-button',
					) ) .
					Html::element(
						'span',
						array( 'class' => $count ? '' : 'zero' ),
						$this->getLanguage()->formatNum( $count ) ) .
					Html::closeElement( 'a' )
				);
			}
		}
	}

	/**
	 * Prepares urls and links used by the page
	 * @param QuickTemplate $tpl
	 */
	protected function preparePersonalTools( QuickTemplate $tpl ) {
		$returnToTitle = $this->getTitle()->getPrefixedText();
		$donateTitle = SpecialPage::getTitleFor( 'Uploads' );
		$watchTitle = SpecialPage::getTitleFor( 'Watchlist' );

		// watchlist link
		$watchlistQuery = array();
		$user = $this->getUser();
		if ( $user ) {
			$view = $user->getOption( SpecialMobileWatchlist::VIEW_OPTION_NAME, false );
			$filter = $user->getOption( SpecialMobileWatchlist::FILTER_OPTION_NAME, false );
			if ( $view ) {
				$watchlistQuery['watchlistview'] = $view;
			}
			if ( $filter && $view === 'feed' ) {
				$watchlistQuery['filter'] = $filter;
			}
		}

		$items = array(
			'watchlist' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-watchlist' )->escaped(),
				'href' => $this->getUser()->isLoggedIn() ?
					$watchTitle->getLocalUrl( $watchlistQuery ) :
					$this->getLoginUrl( array( 'returnto' => $watchTitle ) ),
				'class' => 'icon-watchlist',
			)
		);
		if ( $this->isMobileMode ) {
			$items['uploads'] = array(
				'text' => wfMessage( 'mobile-frontend-main-menu-upload' )->escaped(),
				'href' => $this->getUser()->isLoggedIn() ? $donateTitle->getLocalUrl() :
					$this->getLoginUrl( array( 'returnto' => $donateTitle ) ),
				'class' => 'icon-uploads jsonly',
			);
			$items['settings'] = array(
				'text' => wfMessage( 'mobile-frontend-main-menu-settings' )->escaped(),
				'href' => SpecialPage::getTitleFor( 'MobileOptions' )->
					getLocalUrl( array( 'returnto' => $returnToTitle ) ),
				'class' => 'icon-settings',
			);
		} else {
			$prefUrl = SpecialPage::getTitleFor( 'Preferences' )->
				getLocalUrl( array( 'returnto' => $returnToTitle ) );
			$items['preferences'] = array(
				'text' => wfMessage( 'preferences' )->escaped(),
				'href' => $this->getUser()->isLoggedIn() ? $prefUrl :
					$this->getLoginUrl( array( 'returnto' => $prefUrl ) ),
				'class' => 'icon-settings',
			);
		}
		$items['auth'] = $this->getLogInOutLink();

		$tpl->set( 'personal_urls', $items );
	}

	/**
	 * Rewrites the language list so that it cannot be contaminated by other extensions with things
	 * other than languages
	 * See bug 57094.
	 *
	 * FIXME: Remove when Special:Languages link goes stable
	 *
	 * @param QuickTemplate $tpl
	 */
	protected function prepareLanguages( $tpl ) {
		$lang = $this->getTitle()->getPageViewLanguage();
		$tpl->set( 'pageLang', $lang->getHtmlCode() );
		$tpl->set( 'pageDir', $lang->getDir() );
		$language_urls = $this->getLanguages();
		if ( count( $language_urls ) ) {
			$tpl->setRef( 'language_urls', $language_urls );
		} else {
			$tpl->set( 'language_urls', false );
		}
	}

	/**
	 * Prepares a list of links that have the purpose of discovery in the main navigation menu
	 * @param QuickTemplate $tpl
	 */
	protected function prepareDiscoveryTools( QuickTemplate $tpl ) {
		global $wgMFNearby;

		$items = array(
			'home' => array(
				'text' => wfMessage( 'mobile-frontend-home-button' )->escaped(),
				'href' => Title::newMainPage()->getLocalUrl(),
				'class' => 'icon-home',
			),
			'random' => array(
				'text' => wfMessage( 'mobile-frontend-random-button' )->escaped(),
				'href' => SpecialPage::getTitleFor( 'Randompage' )->getLocalUrl(
					array( 'campaign' => 'random' ) ),
				'class' => 'icon-random',
				'id' => 'randomButton',
			),
			'nearby' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-nearby' )->escaped(),
				'href' => SpecialPage::getTitleFor( 'Nearby' )->getLocalURL(),
				'class' => 'icon-nearby jsonly',
			),
		);
		if ( !$wgMFNearby ) {
			unset( $items['nearby'] );
		}
		$tpl->set( 'discovery_urls', $items );
	}

	/**
	 * Prepares a url to the Special:UserLogin with query parameters,
	 * taking into account $wgSecureLogin
	 * @param array $query
	 * @return string
	 */
	public function getLoginUrl( $query ) {
		if ( $this->isMobileMode ) {
			// FIXME: Does mobile really need special casing here?
			global $wgSecureLogin;

			if ( WebRequest::detectProtocol() != 'https' && $wgSecureLogin ) {
				$loginUrl = SpecialPage::getTitleFor( 'Userlogin' )->getFullURL( $query );
				return $this->mobileContext->getMobileUrl( $loginUrl, $wgSecureLogin );
			}
			return SpecialPage::getTitleFor( 'Userlogin' )->getLocalURL( $query );
		} else {
			return SpecialPage::getTitleFor( 'Userlogin' )->getFullURL( $query );
		}
	}

	/**
	 * Creates a login or logout button
	 * @return array Representation of button with text and href keys
	*/
	protected function getLogInOutLink() {
		global $wgSecureLogin;
		wfProfileIn( __METHOD__ );
		$query = array();
		if ( !$this->getRequest()->wasPosted() ) {
			$returntoquery = $this->getRequest()->getValues();
			unset( $returntoquery['title'] );
			unset( $returntoquery['returnto'] );
			unset( $returntoquery['returntoquery'] );
		}
		$title = $this->getTitle();
		// Don't ever redirect back to the login page (bug 55379)
		if ( !$title->isSpecial( 'Userlogin' ) ) {
			$query[ 'returnto' ] = $title->getPrefixedText();
		}

		$user = $this->getUser();
		if ( $user->isLoggedIn() ) {
			if ( !empty( $returntoquery ) ) {
				$query[ 'returntoquery' ] = wfArrayToCgi( $returntoquery );
			}
			$url = SpecialPage::getTitleFor( 'Userlogout' )->getFullURL( $query );
			$url = $this->mobileContext->getMobileUrl( $url, $wgSecureLogin );
			$username = $user->getName();

			$loginLogoutLink = array(
				'links' => array(
					array(
						'text' => $username,
						'href' => SpecialPage::getTitleFor( 'UserProfile', $username )->getLocalUrl(),
						'class' => 'icon-profile truncated-text',
					),
					array(
						'text' => wfMessage( 'mobile-frontend-main-menu-logout' )->escaped(),
						'href' => $url,
						'class' => 'icon-secondary icon-secondary-logout',
					),
				),
				'class' => 'icon-user',
			);
		} else {
			// note returnto is not set for mobile (per product spec)
			// note welcome=yes in returnto  allows us to detect accounts created from the left nav
			$returntoquery[ 'welcome' ] = 'yes';
			// unset campaign on login link so as not to interfere with A/B tests
			unset( $returntoquery['campaign'] );
			$query[ 'returntoquery' ] = wfArrayToCgi( $returntoquery );
			$url = $this->getLoginUrl( $query );
			$loginLogoutLink = array(
				'text' => wfMessage( 'mobile-frontend-main-menu-login' )->escaped(),
				'href' => $url,
				'class' => 'icon-anon',
			);
		}

		wfProfileOut( __METHOD__ );
		return $loginLogoutLink;
	}

	/**
	 * Prepare the content for the 'last edited' message, e.g. 'Last edited on 30 August
	 * 2013, at 23:31'. This message is different for the main page since main page
	 * content is typically transcuded rather than edited directly.
	 * @param Title $title The Title object of the page being viewed
	 */
	protected function getHistoryLink( Title $title ) {
		$user = $this->getUser();
		$isMainPage = $title->isMainPage();
		// add last modified timestamp
		$revId = $this->getRevisionId();
		$timestamp = Revision::getTimestampFromId( $this->getTitle(), $revId );
		// Main pages tend to include transclusions (see bug 51924)
		if ( $isMainPage ) {
			$lastModified = wfMessage( 'mobile-frontend-history' )->plain();
		} else {
			$lastModified = wfMessage(
				'mobile-frontend-last-modified-date',
				$this->getLanguage()->userDate( $timestamp, $user ),
				$this->getLanguage()->userTime( $timestamp, $user )
			)->parse();
		}
		$unixTimestamp = wfTimestamp( TS_UNIX, $timestamp );
		$historyUrl = $this->mobileContext->getMobileUrl( $title->getFullURL( 'action=history' ) );
		$link = array(
			'id' => 'mw-mf-last-modified',
			'data-timestamp' => $isMainPage ? '' : $unixTimestamp,
			'href' => $historyUrl,
			'text' => $lastModified,
		);
		$rev = Revision::newFromId( $this->getRevisionId() );
		if ( $rev ) {
			$userId = $rev->getUser();
			if ( $userId ) {
				$revUser = User::newFromId( $userId );
				$link += array(
					'data-user-name' => $revUser->getName(),
					'data-user-gender' => $revUser->getOption( 'gender' ),
				);
			} else {
				$link['data-user-gender'] = 'unknown';
			}
		}
		if ( !$title->isMainPage() ) {
			$link['class'] = 'top-bar truncated-text';
		}
		$link['href'] = SpecialPage::getTitleFor( 'History', $title )->getLocalURL();
		return $link;
	}

	protected function getSearchPlaceHolderText() {
		return wfMessage( 'mobile-frontend-placeholder' )->text();
	}

	protected function prepareHeaderAndFooter( BaseTemplate $tpl ) {
		$title = $this->getTitle();
		$user = $this->getUser();
		$out = $this->getOutput();
		if ( $title->isMainPage() ) {
			if ( $user->isLoggedIn() ) {
				$pageTitle = wfMessage(
					'mobile-frontend-logged-in-homepage-notification', $user->getName() )->text();
			} else {
				$pageTitle = '';
			}
			$out->setPageTitle( $pageTitle );
		}

		if ( !$title->isSpecialPage() ) {
			// If it's a page that exists, add last edited timestamp
			if ( $this->getWikiPage()->exists() ) {
				$tpl->set( 'historyLink', $this->getHistoryLink( $title ) );
			}
		}
		$preBodyText = Html::rawElement( 'h1', array( 'id' => 'section_0' ),
			$this->getOutput()->getPageTitle() );
		$tpl->set( 'prebodytext', $preBodyText );

		// set defaults
		if ( !isset( $tpl->data['postbodytext'] ) ) {
			$tpl->set( 'postbodytext', '' ); // not currently set in desktop skin
		}

		// Prepare the mobile version of the footer
		if ( $this->isMobileMode ) {
			$tpl->set( 'footerlinks', array(
				'info' => array(
					'mobile-switcher',
					'mobile-license',
				),
				'places' => array(
					'terms-use',
					'privacy',
				),
			) );
		}
	}

	protected function prepareSearch( BaseTemplate $tpl ) {
		$searchBox = array(
			'id' => 'searchInput',
			'class' => 'search',
			'autocomplete' => 'off',
			// The placeholder gets fed to HTML::element later which escapes all
			// attribute values, so no need to escape the string here.
			'placeholder' =>  $this->getSearchPlaceHolderText(),
		);
		$tpl->set( 'searchBox', $searchBox );
	}

	protected function prepareMenuButton( BaseTemplate $tpl ) {
		// menu button
		$url = SpecialPage::getTitleFor( 'MobileMenu' )->getLocalUrl();
		$tpl->set( 'menuButton',
			Html::element( 'a', array(
			'title' => wfMessage( 'mobile-frontend-main-menu-button-tooltip' ),
			'href' => $url,
			'class' => 'main-header-button',
			'id'=> 'mw-mf-main-menu-button',
			) )
		);
	}

	// Beware of HTML caching when using this function.
	protected function prepareBanners( BaseTemplate $tpl ) {
		// Make sure Zero banner are always on top
		$banners = array( '<div id="siteNotice"></div>' );
		$siteNotice = $this->getSiteNotice();
		if ( $siteNotice ) {
			$banners[] = $siteNotice;
		}
		$tpl->set( 'banners', $banners );
		// These banners unlike 'banners' show inside the main content chrome underneath the
		// page actions.
		$tpl->set( 'internalBanner', '' );
	}

	protected function prepareSiteLinks( BaseTemplate $tpl ) {
		$aboutPageTitleText = $this->msg( 'aboutpage' )->inContentLanguage()->text();
		$disclaimerPageTitleText = $this->msg( 'disclaimerpage' )->inContentLanguage()->text();
		$urls = array();
		$t = Title::newFromText( $aboutPageTitleText );
		if ( $t ) {
			$urls[] = array(
				'href' => $t->getLocalUrl(),
				'text'=> $this->msg( 'aboutsite' )->text(),
			);
		}
		$t = Title::newFromText( $disclaimerPageTitleText );
		if ( $t ) {
			$urls[] = array(
				'href' => $t->getLocalUrl(),
				'text'=> $this->msg( 'disclaimers' )->text(),
			);
		}
		$tpl->set( 'site_urls', $urls );
	}

	protected function prepareWarnings( BaseTemplate $tpl ) {
		$out = $this->getOutput();
		if ( $out->getRequest()->getText( 'oldid' ) ) {
			$subtitle = $out->getSubtitle();
			$tpl->set(
				'_old_revision_warning',
				Html::openElement( 'div', array( 'class' => 'alert warning' ) ) .
					$subtitle . Html::closeElement( 'div' ) );
		}
	}

	protected function preparePageActions( BaseTemplate $tpl ) {
		$title = $this->getTitle();
		// Reuse template data variable from SkinTemplate to construct page menu
		$menu = array();
		$namespaces = $tpl->data['content_navigation']['namespaces'];
		$actions = $tpl->data['content_navigation']['actions'];

		// empty placeholder for edit and photos which both require js
		$menu['edit'] = array( 'id' => 'ca-edit', 'text' => '' );
		$menu['photo'] = array( 'id' => 'ca-upload', 'text' => '' );

		// FIXME [core]: This seems unnecessary..
		$subjectId = $title->getNamespaceKey( '' );
		$talkId = $subjectId === 'main' ? 'talk' : "{$subjectId}_talk";
		if ( isset( $namespaces[$talkId] ) ) {
			$menu['talk'] = $namespaces[$talkId];
		}

		if ( isset( $menu['talk'] ) ) {
			if ( isset( $tpl->data['_talkdata'] ) ) {
				$menu['talk']['text'] = $tpl->data['_talkdata']['text'];
				$menu['talk']['class'] = $tpl->data['_talkdata']['class'];
			}
		}
		// sanitize to avoid invalid HTML5 markup being produced
		unset( $menu['talk']['primary'] );
		unset( $menu['talk']['context'] );

		$watchTemplate = array(
			'id' => 'ca-watch',
			'class' => 'watch-this-article',
		);
		// standardise watch article into one menu item
		if ( isset( $actions['watch'] ) ) {
			$menu['watch'] = array_merge( $actions['watch'], $watchTemplate );
		} elseif ( isset( $actions['unwatch'] ) ) {
			$menu['watch'] = array_merge( $actions['unwatch'], $watchTemplate );
			$menu['watch']['class'] .= ' watched';
		} else {
			// placeholder for not logged in
			$menu['watch'] = $watchTemplate;
			// FIXME: makeLink (used by makeListItem) when no text is present defaults to use the key
			$menu['watch']['text'] = '';
			$menu['watch']['href'] = $this->getLoginUrl( array( 'returnto' => $title ) );
		}

		$tpl->set( 'page_actions', $menu );
	}

	private function getSkinConfigMobileVariables() {
		$vars = array();
		if ( $this->isMobileMode ) {
			global $wgCookiePath;
			$wgUseFormatCookie = array(
				'name' => MobileContext::USEFORMAT_COOKIE_NAME,
				'duration' => -1, // in days
				'path' => $wgCookiePath,
				'domain' => $this->getRequest()->getHeader( 'Host' ),
			);
			$vars['wgUseFormatCookie'] = $wgUseFormatCookie;
		}
		return $vars;
	}

	/**
	 * Returns array of config variables that should be added only to this skin
	 * for use in JavaScript.
	 * @return array
	 */
	public function getSkinConfigVariables() {
		global $wgMFLeadPhotoUploadCssSelector, $wgMFEnableCssAnimations,
			$wgMFUseCentralAuthToken,
			$wgMFDeviceWidthTablet,
			$wgMFAjaxUploadProgressSupport,
			$wgMFAnonymousEditing,
			$wgMFPhotoUploadEndpoint, $wgMFPhotoUploadAppendToDesc,
			$wgMFCollapseSectionsByDefault;

		$title = $this->getTitle();
		$user = $this->getUser();
		$userCanCreatePage = !$title->exists() && $title->quickUserCan( 'create', $user );

		$vars = array_merge( array(
			'wgMFUseCentralAuthToken' => $wgMFUseCentralAuthToken,
			'wgMFAjaxUploadProgressSupport' => $wgMFAjaxUploadProgressSupport,
			'wgMFAnonymousEditing' => $wgMFAnonymousEditing,
			'wgMFPhotoUploadAppendToDesc' => $wgMFPhotoUploadAppendToDesc,
			'wgMFLeadPhotoUploadCssSelector' => $wgMFLeadPhotoUploadCssSelector,
			'wgMFEnableCssAnimations' => $wgMFEnableCssAnimations,
			'wgMFPhotoUploadEndpoint' => $wgMFPhotoUploadEndpoint ? $wgMFPhotoUploadEndpoint : '',
			'wgPreferredVariant' => $title->getPageLanguage()->getPreferredVariant(),
			'wgIsPageEditable' => $title->quickUserCan( 'edit', $user ) || $userCanCreatePage,
			'wgMFDeviceWidthTablet' => $wgMFDeviceWidthTablet,
			'wgMFMode' => $this->getMode(),
			'wgMFCollapseSectionsByDefault' => $wgMFCollapseSectionsByDefault,
		), $this->getSkinConfigMobileVariables() );

		if ( $this->isAuthenticatedUser() ) {
			$vars['wgWatchedPageCache'] = array(
				$title->getPrefixedDBkey() => $user->isWatched( $title ),
			);
			$vars['wgMFIsLoggedInUserBlocked'] = $user->isBlocked();
		}
		// mobile specific config variables
		if ( $this->mobileContext->shouldDisplayMobileView() ) {
			$vars['wgImagesDisabled'] = $this->mobileContext->imagesDisabled();
		}
		return $vars;
	}

	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		// flush unnecessary modules
		$modules['content'] = array();
		$modules['legacy'] = array();

		$modules['mobile'] = array(
			'mobile.head',
			'mobile.startup',
			'mobile.site',
			// FIXME: separate mobile.stable into more meaningful groupings
			'mobile.stable',
		);

		$modules['notifications'] = array( 'mobile.notifications' );
		$modules['watch'] = array();
		$modules['search'] = array( 'mobile.search' );
		$modules['stableonly'] = array();
		$modules['issues'] = array( 'mobile.issues' );
		$modules['editor'] = array( 'mobile.editor' );
		$modules['languages'] = array( 'mobile.languages' );
		$modules['newusers'] = array( 'mobile.newusers' );

		$title = $this->getTitle();

		// specific to current context
		if ( $title->inNamespace( NS_FILE ) ) {
			$modules['file'] = array( 'mobile.file.scripts' );
		}

		if ( $this->isMobileMode ) {
			$modules['toggling'] = array( 'mobile.toggling' );
			$modules['eventlogging'] = array( 'mobile.loggingSchemas' );
		}
		// FIXME: Upstream?
		wfRunHooks( 'SkinMinervaDefaultModules', array( $this, &$modules ) );
		return $modules;
	}

	/**
	 * This will be called by OutputPage::headElement when it is creating the
	 * "<body>" tag, - adds output property bodyClassName to the existing classes
	 * @param OutputPage $out
	 * @param array $bodyAttrs
	 */
	public function addToBodyAttributes( $out, &$bodyAttrs ) {
		// does nothing by default - used by Special:MobileMenu
		$classes = $out->getProperty( 'bodyClassName' );
		$bodyAttrs[ 'class' ] .= ' ' . $classes;
	}

	protected function getSkinStyles() {
		$title = $this->getTitle();
		$styles = array(
			'skins.minerva.chrome.styles',
			'skins.minerva.buttons.styles',
			'skins.minerva.content.styles',
			'skins.minerva.drawers.styles',
			// FIXME: Rename to use skins.minerva prefix - don't break cache in process
			'mobile.styles.page',
			'mobile.pagelist.styles',
		);
		if ( $title->isSpecialPage() ) {
			$styles['special'] = 'skins.minerva.special.styles';
		}
		return $styles;
	}

	/**
	 * Add skin-specific stylesheets
	 * @param OutputPage $out
	 */
	public function setupSkinUserCss( OutputPage $out ) {
		// Add common CSS ResourceLoader modules to the page output
		// FIXME: Once we start using mediawiki.ui.button more widely on mobile, change
		// this to just parent::setupSkinUserCss( $out ).
		$out->addModuleStyles( array( 'mediawiki.legacy.shared', 'mediawiki.legacy.commonPrint' ) );
		// Add Minerva-specific ResourceLoader modules to the page output
		$out->addModuleStyles( $this->getSkinStyles() );
	}

	public function outputPage( OutputPage $out = null ) {
		wfProfileIn( __METHOD__ );

		// This might seem weird but now the meaning of 'mobile' is morphing to mean 'minerva skin'
		// FIXME: Explore disabling this via a user preference and see what explodes
		// Important: This must run before outputPage which generates script and style tags
		// If run later incompatible desktop code will leak into Minerva.
		$out = $this->getOutput();
		$out->setTarget( 'mobile' );
		if ( $this->isMobileMode ) {
			// FIXME: Merge these hooks?
			wfRunHooks( 'EnableMobileModules', array( $out, $this->getMode() ) );
			wfRunHooks( 'BeforePageDisplayMobile', array( &$out ) );
		}
		parent::outputPage( $out );
		wfProfileOut( __METHOD__ );
	}

	//
	//
	// Mobile specific functions
	// FIXME: Try to kill any of the functions that follow
	//

	/**
	 * Returns the site name for the footer, either as a text or <img> tag
	 */
	protected function getSitename() {
		global $wgMFCustomLogos, $wgMFTrademarkSitename;

		$footerSitename = $this->msg( 'mobile-frontend-footer-sitename' )->text();

		if ( isset( $wgMFCustomLogos['copyright'] ) ) {
			$suffix = $wgMFTrademarkSitename ? ' ®' : '';
			$sitename = Html::element( 'img', array(
				'src' => $wgMFCustomLogos['copyright'],
				'alt' => $footerSitename . $suffix
			) );
		} else {
			$suffix = $wgMFTrademarkSitename ? ' ™' : '';
			$sitename = $footerSitename . $suffix;
		}

		return $sitename;
	}

	/**
	 * Prepares links used in the mobile footer
	 * @param QuickTemplate $tpl
	 */
	protected function prepareMobileFooterLinks( $tpl ) {
		$req = $this->getRequest();

		$url = $this->getOutput()->getProperty( 'desktopUrl' );
		if ( $url ) {
			$url = wfAppendQuery( $url, 'mobileaction=toggle_view_desktop' );
		} else {
			$url = $req->appendQuery( 'mobileaction=toggle_view_desktop' );
		}
		$url = htmlspecialchars( $this->mobileContext->getDesktopUrl( wfExpandUrl( $url ) ) );

		$desktop = wfMessage( 'mobile-frontend-view-desktop' )->escaped();
		$mobile = wfMessage( 'mobile-frontend-view-mobile' )->escaped();

		// &zwnj; is needed for correct ligatures in some scripts (e.g. Arabic)
		$switcherHtml = <<<HTML
<h2>{$this->getSitename()}</h2>
<ul>
	<li>{$mobile}&zwnj;</li><li><a id="mw-mf-display-toggle" href="{$url}">{$desktop}</a></li>
</ul>
HTML;

		// Generate the licensing text displayed in the footer of each page
		$link = self::getLicenseLink( 'footer' );
		// The license message is displayed in the content language rather than the user
		// language. See Skin::getCopyright.
		if ( $link ) {
			$licenseText = $this->msg( 'mobile-frontend-copyright' )->rawParams(
				$link )->inContentLanguage()->text();
		} else {
			$licenseText = '';
		}

		$tpl->set( 'mobile-switcher', $switcherHtml );
		$tpl->set( 'mobile-license', $licenseText );
		$tpl->set( 'privacy', $this->footerLink( 'mobile-frontend-privacy-link-text', 'privacypage' ) );
		$tpl->set( 'terms-use', $this->getTermsLink() );
	}

	/**
	 * Returns HTML of license link or empty string
	 * For example:
	 *   "<a title="Wikipedia:Copyright" href="/index.php/Wikipedia:Copyright">CC BY</a>"
	 *
	 * @param string $context The context in which the license link appears, e.g. footer,
	 *   editor, talk, or upload.
	 * @param array $attribs An associative array of extra HTML attributes to add to the link
	 * @return string
	 */
	public static function getLicenseLink( $context, $attribs = array() ) {
		global $wgRightsPage, $wgRightsUrl, $wgRightsText;

		// Construct the link to the licensing terms
		if ( $wgRightsText ) {
			// Switch to a local variable so we don't overwrite the global
			$rightsText = $wgRightsText;
			// Use shorter text for some common licensing strings. See Installer.i18n.php
			// for the currently offered strings. Unfortunately, there is no good way to
			// comprehensively support localized licensing strings since the license (as
			// stored in LocalSetttings.php) is just freeform text, not an i18n key.
			$commonLicenses = array(
				'Creative Commons Attribution-Share Alike 3.0' => 'CC BY-SA 3.0',
				'Creative Commons Attribution Share Alike' => 'CC BY-SA',
				'Creative Commons Attribution 3.0' => 'CC BY 3.0',
				'Creative Commons Attribution 2.5' => 'CC BY 2.5', // Wikinews
				'Creative Commons Attribution' => 'CC BY',
				'Creative Commons Attribution Non-Commercial Share Alike' => 'CC BY-NC-SA',
				'Creative Commons Zero (Public Domain)' => 'CC0 (Public Domain)',
				'GNU Free Documentation License 1.3 or later' => 'GFDL 1.3 or later',
			);
			if ( isset( $commonLicenses[$rightsText] ) ) {
				$rightsText = $commonLicenses[$rightsText];
			}
			if ( $wgRightsPage ) {
				$title = Title::newFromText( $wgRightsPage );
				$link = Linker::linkKnown( $title, $rightsText, $attribs );
			} elseif ( $wgRightsUrl ) {
				$link = Linker::makeExternalLink( $wgRightsUrl, $rightsText, true, '', $attribs );
			} else {
				$link = $rightsText;
			}
		} else {
			$link = '';
		}

		// Allow other extensions (for example, WikimediaMessages) to override
		wfRunHooks( 'MobileLicenseLink', array( &$link, $context, $attribs ) );

		return $link;
	}

	/**
	 * Returns HTML of terms of use link or null if it shouldn't be displayed
	 *
	 * @return null|string
	 */
	public function getTermsLink() {
		$urlMsg = $this->msg( 'mobile-frontend-terms-url' )->inContentLanguage();
		if ( $urlMsg->isDisabled() ) {
			return null;
		}
		$url = $urlMsg->plain();
		// Support both page titles and URLs
		if ( preg_match( '#^(https?:)?//#', $url ) === 0 ) {
			$title = Title::newFromText( $url );
			if ( !$title ) {
				return null;
			}
			$url = $title->getLocalURL();
		}
		return Html::element(
			'a',
			array( 'href' => $url ),
			$this->msg( 'mobile-frontend-terms-text' )->text()
		);
	}

	/**
	 * Takes an array of link elements and applies mobile urls to any urls contained in them
	 * @param array $urls
	 * @return array
	 */
	public function mobilizeUrls( $urls ) {
		$ctx = $this->mobileContext; // $this in closures is allowed only in PHP 5.4
		return array_map( function( $url ) use ( $ctx ) {
			$url['href'] = $ctx->getMobileUrl( $url['href'] );
			return $url;
		},
		$urls );
	}
}
