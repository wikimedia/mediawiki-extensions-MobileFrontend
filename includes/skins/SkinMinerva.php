<?php
/**
 * SkinMinerva.php
 */

/**
 * Minerva: Born from the godhead of Jupiter with weapons!
 * A skin that works on both desktop and mobile
 * @ingroup Skins
 */
class SkinMinerva extends SkinTemplate {
	/** @var boolean $isMobileMode Describes whether reader is on a mobile device */
	protected $isMobileMode = false;
	/** @var string $skinname Name of this skin */
	public $skinname = 'minerva';
	/** @var string $template Name of this used template */
	public $template = 'MinervaTemplate';
	/** @var boolean $useHeadElement Specify whether show head elements */
	public $useHeadElement = true;
	/** @var string $mode Describes 'stability' of the skin - alpha, beta, stable */
	protected $mode = 'stable';
	/** @var MobileContext $mobileContext Safes an instance of MobileContext */
	protected $mobileContext;

	/**
	 * initialize various variables and generate the template
	 * @return QuickTemplate
	 */
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
					'content' => 'initial-scale=1.0, user-scalable=yes, minimum-scale=0.25, maximum-scale=5.0',
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
		if ( $wgMFNoindexPages ) {
			$out->setRobotPolicy( 'noindex,nofollow' );
		}

		if ( $this->isMobileMode ) {
			// Customize page content for mobile view, e.g. add togglable sections, filter
			// out various elements.
			// We do this before executing parent::prepareQuickTemplate() since the parent
			// overwrites $out->mBodytext, adding an mw-content-text div which is
			// redundant to our own content div. By defining the bodytext HTML before
			// $out->mBodytext is overwritten, we avoid including the mw-content-text div.
			// FIXME: Git rid of our content div and consolidate this line with the other
			// isMobileMode lines below. This will bring us more in line with core DOM.
			$html = ExtMobileFrontend::DOMParse( $out );
		}

		// Generate skin template
		$tpl = parent::prepareQuickTemplate();

		// Set whether or not the page content should be wrapped in div.content (for
		// example, on a special page)
		$tpl->set( 'unstyledContent', $out->getProperty( 'unstyledContent' ) );

		// Construct various Minerva-specific interface elements
		$this->preparePageContent( $tpl );
		$this->prepareHeaderAndFooter( $tpl );
		$this->prepareMenuButton( $tpl );
		$this->prepareBanners( $tpl );
		$this->prepareSiteLinks( $tpl );
		$this->prepareWarnings( $tpl );
		$this->preparePageActions( $tpl );
		$this->prepareUserButton( $tpl );
		$this->prepareDiscoveryTools( $tpl );
		$this->preparePersonalTools( $tpl );
		$this->prepareLanguages( $tpl );

		// Perform a few extra changes if we are in mobile mode
		if ( $this->isMobileMode ) {
			// Set our own bodytext that has been filtered by MobileFormatter
			$tpl->set( 'bodytext', $html );
			// Construct mobile-friendly footer
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
	 * Returns true, if the pageaction is configured to be displayed.
	 * @param string $action
	 * @return boolean
	 */
	protected function isAllowedPageAction( $action ) {
		global $wgMFPageActions;
		if ( in_array( $action, $wgMFPageActions ) ) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Overrides Skin::doEditSectionLink
	 * @param Title $nt
	 * @param string $section
	 * @param string $tooltip
	 * @param string $lang
	 * @return string
	 */
	public function doEditSectionLink( Title $nt, $section, $tooltip = null, $lang = false ) {
		if ( $this->isAllowedPageAction( 'edit' ) ) {
			$lang = wfGetLangObj( $lang );
			$message = wfMessage( 'mobile-frontend-editor-edit' )->inLanguage( $lang )->text();
			return Html::element( 'a', array(
				'href' => '#editor/' . $section,
				'data-section' => $section,
				'class' => 'edit-page icon icon-32px icon-edit enabled'
			), $message );
		}
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
	 * Get the current mode of the skin [stable|beta|alpha|app] that is running
	 * @return string
	 */
	protected function getMode() {
		return $this->mode;
	}

	/**
	 * Check whether the current user is authenticated or not.
	 * @todo This helper function is only truly needed whilst SkinMobileApp does not support login
	 * @return bool
	 */
	protected function isAuthenticatedUser() {
		return !$this->getUser()->isAnon();
	}

	/**
	 * Initiate class
	 */
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
						'class' => 'user-button icon icon-32px main-header-button',
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
				'links' => array(
					array(
						'text' => wfMessage( 'mobile-frontend-main-menu-watchlist' )->escaped(),
						'href' => $this->getUser()->isLoggedIn() ?
							$watchTitle->getLocalUrl( $watchlistQuery ) :
							$this->getLoginUrl( array( 'returnto' => $watchTitle ) ),
						'class' => 'icon-watchlist icon icon-text',
					),
				),
			)
		);
		if ( $this->isMobileMode ) {
			if ( $user->isAllowed( 'mf-uploadbutton' ) ) {
				$items['uploads'] = array(
					'links' => array(
						array(
							'text' => wfMessage( 'mobile-frontend-main-menu-upload' )->escaped(),
							'href' => $this->getUser()->isLoggedIn() ? $donateTitle->getLocalUrl() :
								$this->getLoginUrl( array( 'returnto' => $donateTitle ) ),
							'class' => 'icon-uploads icon icon-text',
						),
					),
					'class' => 'jsonly',
				);
			}
			$items['settings'] = array(
				'links' => array(
					array(
						'text' => wfMessage( 'mobile-frontend-main-menu-settings' )->escaped(),
						'href' => SpecialPage::getTitleFor( 'MobileOptions' )->
							getLocalUrl( array( 'returnto' => $returnToTitle ) ),
						'class' => 'icon-settings icon icon-text',
					),
				),
			);
		} else {
			$prefUrl = SpecialPage::getTitleFor( 'Preferences' )->
				getLocalUrl( array( 'returnto' => $returnToTitle ) );
			$items['preferences'] = array(
				'links' => array(
					array(
						'text' => wfMessage( 'preferences' )->escaped(),
						'href' => $this->getUser()->isLoggedIn() ? $prefUrl :
							$this->getLoginUrl( array( 'returnto' => $prefUrl ) ),
						'class' => 'icon-settings icon icon-text',
					),
				),
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
	 * @todo Remove when Special:Languages link goes stable
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
		global $wgMFNearby, $wgMFContentNamespace;

		$items = array(
			'home' => array(
				'links' => array(
					array(
						'text' => wfMessage( 'mobile-frontend-home-button' )->escaped(),
						'href' => Title::newMainPage()->getLocalUrl(),
						'class' => 'icon-home icon icon-text',
					),
				),
			),
			'random' => array(
				'links' => array(
					array(
						'text' => wfMessage( 'mobile-frontend-random-button' )->escaped(),
						'href' => SpecialPage::getTitleFor( 'Randompage',
							MWNamespace::getCanonicalName( $wgMFContentNamespace ) )->getLocalUrl() .
								'#/random',
						'class' => 'icon-random icon icon-text',
						'id' => 'randomButton',
					),
				),
			),
			'nearby' => array(
				'links' => array(
					array(
						'text' => wfMessage( 'mobile-frontend-main-menu-nearby' )->escaped(),
						'href' => SpecialPage::getTitleFor( 'Nearby' )->getLocalURL(),
						'class' => 'icon-nearby icon icon-text',
					),
				),
				'class' => 'jsonly',
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
						'class' => 'icon icon-profile truncated-text icon-text',
					),
					array(
						'text' => wfMessage( 'mobile-frontend-main-menu-logout' )->escaped(),
						'href' => $url,
						'class' => 'icon icon-16px icon-secondary icon-secondary-logout',
					),
				),
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
				'links' => array(
					array(
						'text' => wfMessage( 'mobile-frontend-main-menu-login' )->escaped(),
						'href' => $url,
						'class' => 'icon icon-anon icon-text',
					),
				),
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
	 * @return array
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

	/**
	 * Create and prepare header and footer content
	 * @param BaseTemplate $tpl
	 */
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

	/**
	 * Prepare the button opens the main side menu
	 * @param BaseTemplate $tpl
	 */
	protected function prepareMenuButton( BaseTemplate $tpl ) {
		// menu button
		$url = SpecialPage::getTitleFor( 'MobileMenu' )->getLocalUrl();
		$tpl->set( 'menuButton',
			Html::element( 'a', array(
			'title' => wfMessage( 'mobile-frontend-main-menu-button-tooltip' ),
			'href' => $url,
			'class' => 'main-header-button icon',
			'id'=> 'mw-mf-main-menu-button',
			) )
		);
	}

	/**
	 * Load internal banner content to show in pre content in template
	 * Beware of HTML caching when using this function.
	 * Content set as "internalbanner"
	 * @param BaseTemplate $tpl
	 */
	protected function prepareBanners( BaseTemplate $tpl ) {
		global $wgMFEnableSiteNotice;

		// Make sure Zero banner are always on top
		$banners = array( '<div id="siteNotice"></div>' );
		if ( $wgMFEnableSiteNotice ) {
			$siteNotice = $this->getSiteNotice();
			if ( $siteNotice ) {
				$banners[] = $siteNotice;
			}
		}
		$tpl->set( 'banners', $banners );
		// These banners unlike 'banners' show inside the main content chrome underneath the
		// page actions.
		$tpl->set( 'internalBanner', '' );
	}

	/**
	 * Prepare site links in footer
	 * @param BaseTemplate $tpl
	 */
	protected function prepareSiteLinks( BaseTemplate $tpl ) {
		$siteLinks = array(
			array(
				'title' => 'aboutpage',
				'msg' => 'aboutsite',
			),
			array(
				'title' => 'disclaimerpage',
				'msg' => 'disclaimers',
			),
		);
		$urls = array();
		foreach ( $siteLinks as $param ) {
			$title = Title::newFromText(
				$this->msg( $param['title'] )->inContentLanguage()->text()
			);
			$msg = $this->msg( $param['msg'] );
			if ( $title && !$msg->isDisabled() ) {
				$urls[] = array(
					'href' => $title->getLocalUrl(),
					'text'=> $msg->text(),
				);
			}
		}
		$tpl->set( 'site_urls', $urls );
	}

	/**
	 * Prepare warnings for mobile output
	 * @param BaseTemplate $tpl
	 */
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

	/**
	 * Prepare configured and available page actions
	 * @param BaseTemplate $tpl
	 */
	protected function preparePageActions( BaseTemplate $tpl ) {
		$title = $this->getTitle();
		// Reuse template data variable from SkinTemplate to construct page menu
		$menu = array();
		$namespaces = $tpl->data['content_navigation']['namespaces'];
		$actions = $tpl->data['content_navigation']['actions'];

		// empty placeholder for edit and photos which both require js
		if ( $this->isAllowedPageAction( 'edit' ) ) {
			$menu['edit'] = array( 'id' => 'ca-edit', 'text' => '',
				'class' => 'icon icon-32px icon-edit' );
		}

		if ( $this->isAllowedPageAction( 'upload' )
			&& !$title->isMainPage()
			&& $this->getUser()->isAllowed( 'mf-uploadbutton' ) )
		{
			$menu['photo'] = array( 'id' => 'ca-upload', 'text' => '',
				'class' => 'icon icon-32px' );
		}

		if ( $this->isAllowedPageAction( 'talk' ) ) {
			// FIXME [core]: This seems unnecessary..
			$subjectId = $title->getNamespaceKey( '' );
			$talkId = $subjectId === 'main' ? 'talk' : "{$subjectId}_talk";
			if ( isset( $namespaces[$talkId] ) && !$title->isTalkPage() ) {
				$menu['talk'] = $namespaces[$talkId];
			}

			if ( isset( $menu['talk'] ) ) {
				$menu['talk']['class'] = 'icon icon-32px icon-talk';
				if ( isset( $tpl->data['_talkdata'] ) ) {
					$menu['talk']['text'] = $tpl->data['_talkdata']['text'];
					$menu['talk']['class'] = $tpl->data['_talkdata']['class'];
				}
			}
			// sanitize to avoid invalid HTML5 markup being produced
			unset( $menu['talk']['primary'] );
			unset( $menu['talk']['context'] );
		}

		if ( $this->isAllowedPageAction( 'watch' ) ) {
			$watchTemplate = array(
				'id' => 'ca-watch',
				'class' => 'watch-this-article icon icon-32px',
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
		}

		$tpl->set( 'page_actions', $menu );
	}

	/**
	 * Get various skin specific configuration.
	 * @return array
	 */
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
			$wgMFCollapseSectionsByDefault, $wgMFShowRedLinksAnon,
			$wgMFShowRedLinks;

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
			// FIXME: Kill variable in favour of $wgRestrictionEdit
			'wgIsPageEditable' => $title->quickUserCan( 'edit', $user ) || $userCanCreatePage,
			'wgMFDeviceWidthTablet' => $wgMFDeviceWidthTablet,
			'wgMFMode' => $this->getMode(),
			'wgMFCollapseSectionsByDefault' => $wgMFCollapseSectionsByDefault,
			'wgTOC' => $this->getOutput()->getProperty( 'MinervaTOC' ),
			'wgMFPageSections' => $this->isMobileMode
		), $this->getSkinConfigMobileVariables() );

		if ( $this->isAuthenticatedUser() ) {
			$vars['wgMFIsLoggedInUserBlocked'] = $user->isBlocked() && $user->isBlockedFrom( $title );
		}

		$vars['wgMFShowRedLinks'] = ( $this->mobileContext->isBetaGroupMember() && $wgMFShowRedLinks )
			|| ( $wgMFShowRedLinksAnon && $user->isAnon() );

		// mobile specific config variables
		if ( $this->mobileContext->shouldDisplayMobileView() ) {
			$vars['wgImagesDisabled'] = $this->mobileContext->imagesDisabled();
		}

		return $vars;
	}

	/**
	 * Returns the javascript modules to load.
	 * @return array
	 */
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
		if ( $this->isAllowedPageAction( 'watch' ) ) {
			$modules['watch'] = array();
		}
		$modules['search'] = array( 'mobile.search' );
		$modules['issues'] = array( 'mobile.issues' );
		if ( $this->isAllowedPageAction( 'edit' ) ) {
			$modules['editor'] = array( 'mobile.editor' );
		}
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

	/**
	 * Get the needed styles for this skin
	 * @return array
	 */
	protected function getSkinStyles() {
		$title = $this->getTitle();
		$styles = array(
			'skins.minerva.chrome.styles',
			'skins.minerva.buttons.styles',
			'skins.minerva.content.styles',
			'skins.minerva.drawers.styles',
			'skins.minerva.tablet.styles',
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
		parent::setupSkinUserCss( $out );
		// Add Minerva-specific ResourceLoader modules to the page output
		$out->addModuleStyles( $this->getSkinStyles() );
	}

	/**
	 * initialize various variables and generate the template
	 * @param OutputPage $out optional parameter: The OutputPage Obj.
	 */
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
	 * @return string
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
	 * Note: This is called by a hook in the WikimediaMessages extension.
	 *
	 * @param $urlMsgKey Key of i18n message containing terms of use URL (optional)
	 *
	 * @return null|string
	 */
	public function getTermsLink( $urlMsgKey = 'mobile-frontend-terms-url' ) {
		$urlMsg = $this->msg( $urlMsgKey )->inContentLanguage();
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
