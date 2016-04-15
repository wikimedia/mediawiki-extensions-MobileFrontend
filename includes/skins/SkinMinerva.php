<?php
/**
 * SkinMinerva.php
 */
use MobileFrontend\MenuBuilder;

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
	/** @var string $mode Describes 'stability' of the skin - beta, stable */
	protected $mode = 'stable';
	/** @var MobileContext $mobileContext Safes an instance of MobileContext */
	protected $mobileContext;
	/** @var bool whether the page is the user's page, i.e. User:Username */
	public $isUserPage = false;
	/**
	 * @var boolean Whether the language button should be included in the secondary
	 * actions HTML on non-main pages
	 */
	protected $shouldSecondaryActionsIncludeLanguageBtn = true;
	/** @var bool Whether the page is also available in other languages or variants */
	protected $doesPageHaveLanguages = false;

	/**
	 * Wrapper for MobileContext::getMFConfig()
	 * @see MobileContext::getMFConfig()
	 * @return Config
	 */
	public function getMFConfig() {
		return $this->mobileContext->getMFConfig();
	}

	/**
	 * initialize various variables and generate the template
	 * @return QuickTemplate
	 */
	protected function prepareQuickTemplate() {
		$appleTouchIcon = $this->getConfig()->get( 'AppleTouchIcon' );

		$out = $this->getOutput();
		// add head items
		if ( $appleTouchIcon !== false ) {
			$out->addLink( array( 'rel' => 'apple-touch-icon', 'href' => $appleTouchIcon ) );
		}
		$out->addMeta( 'viewport', 'initial-scale=1.0, user-scalable=yes, minimum-scale=0.25, ' .
				'maximum-scale=5.0, width=device-width'
		);

		// Generate skin template
		$tpl = parent::prepareQuickTemplate();

		$this->doesPageHaveLanguages = $tpl->data['content_navigation']['variants'] ||
			$tpl->data['language_urls'];

		// Set whether or not the page content should be wrapped in div.content (for
		// example, on a special page)
		$tpl->set( 'unstyledContent', $out->getProperty( 'unstyledContent' ) );

		// Set the links for the main menu
		$tpl->set( 'menu_data', $this->getMenuData() );

		// Set the links for page secondary actions
		$tpl->set( 'secondary_actions', $this->getSecondaryActions( $tpl ) );

		// Construct various Minerva-specific interface elements
		$this->preparePageContent( $tpl );
		$this->prepareHeaderAndFooter( $tpl );
		$this->prepareMenuButton( $tpl );
		$this->prepareBanners( $tpl );
		$this->prepareWarnings( $tpl );
		$this->preparePageActions( $tpl );
		$this->prepareUserButton( $tpl );
		$this->prepareLanguages( $tpl );

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
			// if it's a talk page for which we have a special message, use it
			switch ( $title->getNamespace() ) {
				case 3: // User NS
					$msg = 'mobile-frontend-talk-back-to-userpage';
					break;
				case 5: // Project NS
					$msg = 'mobile-frontend-talk-back-to-projectpage';
					break;
				case 7: // File NS
					$msg = 'mobile-frontend-talk-back-to-filepage';
					break;
				default: // generic (all other NS)
					$msg = 'mobile-frontend-talk-back-to-page';
			}
			$tpl->set( 'subject-page', Linker::link(
				$title->getSubjectPage(),
				$this->msg( $msg, $title->getText() )->escaped(),
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
		$title = $this->getTitle();
		// All actions disabled on main apge.
		if ( !$title->isMainPage() &&
			in_array( $action, $this->getMFConfig()->get( 'MinervaPageActions' ) ) ) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Overrides Skin::doEditSectionLink
	 * @param Title $nt
	 * @param string $section
	 * @param string|null $tooltip
	 * @param string|bool $lang
	 * @return string
	 */
	public function doEditSectionLink( Title $nt, $section, $tooltip = null, $lang = false ) {
		$noJsEdit = MobileContext::singleton()->getMFConfig()->get( 'MFAllowNonJavaScriptEditing' );

		if ( $this->isAllowedPageAction( 'edit' ) ) {
			$additionalClass = $noJsEdit?' nojs-edit':'';
			$lang = wfGetLangObj( $lang );
			$message = $this->msg( 'mobile-frontend-editor-edit' )->inLanguage( $lang )->text();
			$html = Html::openElement( 'span' );
			$html .= Html::element( 'a', array(
				'href' =>  $this->getTitle()->getLocalUrl( array( 'action' => 'edit', 'section' => $section ) ),
				'title' => $this->msg( 'editsectionhint', $tooltip )->inLanguage( $lang )->text(),
				'data-section' => $section,
				// Note visibility of the edit section link button is controlled by .edit-page in ui.less so
				// we default to enabled even though this may not be true.
				'class' => MobileUI::iconClass( 'edit-enabled', 'element', 'edit-page' . $additionalClass ),
			), $message );
			$html .= Html::closeElement( 'span' );
			return $html;
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

		if ( $this->isAuthenticatedUser() ) {
			$className .= ' is-authenticated';
		}
		return $className;
	}

	/**
	 * Get the current mode of the skin [stable|beta] that is running
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
		$title = $this->getTitle();
		if ( $title->inNamespace( NS_USER ) && !$title->isSubpage() ) {
			$pageUserId = User::idFromName( $title->getText() );
			if ( $pageUserId ) {
				$this->pageUser = User::newFromId( $pageUserId );
				$this->isUserPage = true;
			}
		}
	}

	/**
	 * Initializes output page and sets up skin-specific parameters
	 * @param OutputPage $out object to initialize
	 */
	public function initPage( OutputPage $out ) {
		parent::initPage( $out );
		$out->addModuleStyles( 'mobile.usermodule.styles' );
		$out->addModuleScripts( 'mobile.usermodule' );
		$out->addJsConfigVars( $this->getSkinConfigVariables() );
	}

	/**
	 * Returns, if Extension:Echo should be used.
	 * return boolean
	 */
	protected function useEcho() {
		return class_exists( 'MWEchoNotifUser' );
	}

	/**
	 * Creates element relating to secondary button
	 * @param string $title Title attribute value of secondary button
	 * @param string $url of secondary button
	 * @param string $spanLabel text of span associated with secondary button.
	 * @param string $spanClass the class of the secondary button
	 * @return string html relating to button
	 */
	protected function createSecondaryButton( $title, $url, $spanLabel, $spanClass ) {
		return Html::openElement( 'a', array(
				'title' => $title,
				'href' => $url,
				'class' => MobileUI::iconClass( 'notifications', 'element',
					'user-button main-header-button icon-32px' ),
				'id' => 'secondary-button',
			) ) .
			Html::element(
				'span',
				array( 'class' => 'label' ),
				$title
			) .
			Html::closeElement( 'a' ) .
			Html::element(
				'span',
				array( 'class' => $spanClass ),
				$spanLabel
			);
	}

	/**
	 * Prepares the user button.
	 * @param QuickTemplate $tpl
	 */
	protected function prepareUserButton( QuickTemplate $tpl ) {
		// Set user button to empty string by default
		$tpl->set( 'secondaryButton', '' );
		$notificationsTitle = '';
		$countLabel = '';
		$isZero = true;

		$user = $this->getUser();
		$newtalks = $this->getNewtalks();
		$currentTitle = $this->getTitle();
		// If Echo is available, the user is logged in, and they are not already on the
		// notifications archive, show the notifications icon in the header.
		if ( $this->useEcho() && $user->isLoggedIn() ) {
			$notificationsTitle = SpecialPage::getTitleFor( 'Notifications' );
			$notificationsMsg = $this->msg( 'mobile-frontend-user-button-tooltip' )->text();
			if ( $currentTitle->getPrefixedText() !== $notificationsTitle->getPrefixedText() ) {
				$notifUser = MWEchoNotifUser::newFromUser( $user );
				$count = $notifUser->getAlertCount() + $notifUser->getMessageCount();
				$isZero = $count === 0;
				$countLabel = EchoNotificationController::formatNotificationCount( $count );
			}
		} elseif ( !empty( $newtalks ) ) {
			$notificationsTitle = SpecialPage::getTitleFor( 'Mytalk' );
			$notificationsMsg = $this->msg( 'mobile-frontend-user-newmessages' )->text();
		}

		if ( $notificationsTitle ) {
			$spanClass = $isZero ? 'zero notification-count' : 'notification-count';

			$url = $notificationsTitle->getLocalURL(
				array( 'returnto' => $currentTitle->getPrefixedText() ) );

			$tpl->set( 'secondaryButton',
				$this->createSecondaryButton( $notificationsMsg, $url, $countLabel, $spanClass )
			);
		}
	}

	/**
	 * Return a url to a resource or to a login screen that redirects to that resource.
	 * @param Title $title
	 * @param string $warning Key of message to display on login page (optional)
	 * @param array $query representation of query string parameters (optional)
	 * @return string url
	 */
	protected function getPersonalUrl( Title $title, $warning, array $query = array() ) {
		if ( $this->getUser()->isLoggedIn() ) {
			return $title->getLocalUrl( $query );
		} else {
			$loginQueryParams['returnto'] = $title;
			if ( $query ) {
				$loginQueryParams['returntoquery'] = wfArrayToCgi( $query );
			}
			if ( $warning ) {
				$loginQueryParams['warning'] = $warning;
			}
			return $this->getLoginUrl( $loginQueryParams );
		}
	}

	/**
	 * Prepares and returns urls and links personal to the given user
	 * @return array
	 */
	protected function getPersonalTools() {
		$returnToTitle = $this->getTitle()->getPrefixedText();
		$donateTitle = SpecialPage::getTitleFor( 'Uploads' );
		$watchTitle = SpecialPage::getTitleFor( 'Watchlist' );
		$menu = new MenuBuilder();

		// Watchlist link
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

		$menu->insert( 'watchlist', $isJSOnly = true )
			->addComponent(
				$this->msg( 'mobile-frontend-main-menu-watchlist' )->escaped(),
				$this->getPersonalUrl(
					$watchTitle,
					'mobile-frontend-watchlist-purpose',
					$watchlistQuery
				),
				MobileUI::iconClass( 'watchlist', 'before' ),
				array( 'data-event-name' => 'watchlist' )
			);

		// Links specifically for mobile mode
		if ( $this->isMobileMode ) {

			// Settings link
			$menu->insert( 'settings' )
				->addComponent(
					$this->msg( 'mobile-frontend-main-menu-settings' )->escaped(),
					SpecialPage::getTitleFor( 'MobileOptions' )->
						getLocalUrl( array( 'returnto' => $returnToTitle ) ),
					MobileUI::iconClass( 'mobileoptions', 'before' ),
					array( 'data-event-name' => 'settings' )
				);

		// Links specifically for desktop mode
		} else {

			// Preferences link
			$menu->insert( 'preferences' )
				->addComponent(
					$this->msg( 'preferences' )->escaped(),
					$this->getPersonalUrl(
						SpecialPage::getTitleFor( 'Preferences' ),
						'prefsnologintext2'
					),
					MobileUI::iconClass( 'settings', 'before' ),
					array( 'data-event-name' => 'preferences' )
				);
		}

		// Login/Logout links
		$this->insertLogInOutLink( $menu );
		// Allow other extensions to add or override tools
		Hooks::run( 'MobileMenu', array( 'personal', &$menu ) );
		return $menu->getEntries();
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
	 * @return array
	 */
	protected function getDiscoveryTools() {
		$config = $this->getMFConfig();
		$menu = new MenuBuilder();

		// Home link
		$menu->insert( 'home' )
			->addComponent(
				$this->msg( 'mobile-frontend-home-button' )->escaped(),
				Title::newMainPage()->getLocalUrl(),
				MobileUI::iconClass( 'home', 'before' ),
				array( 'data-event-name' => 'home' )
			);

		// Random link
		$menu->insert( 'random' )
			->addComponent(
				$this->msg( 'mobile-frontend-random-button' )->escaped(),
				SpecialPage::getTitleFor( 'Randompage',
					MWNamespace::getCanonicalName( $config->get( 'MFContentNamespace' ) ) )->getLocalUrl() .
						'#/random',
				MobileUI::iconClass( 'random', 'before' ),
				array(
					'id' => 'randomButton',
					'data-event-name' => 'random',
				)
			);

		// Nearby link (if supported)
		if (
			$config->get( 'MFNearby' ) &&
			( $config->get( 'MFNearbyEndpoint' ) || class_exists( 'GeoData\GeoData' ) )
		) {
			$menu->insert( 'nearby', $isJSOnly = true )
				->addComponent(
					$this->msg( 'mobile-frontend-main-menu-nearby' )->escaped(),
					SpecialPage::getTitleFor( 'Nearby' )->getLocalURL(),
					MobileUI::iconClass( 'nearby', 'before', 'nearby' ),
					array( 'data-event-name' => 'nearby' )
				);
		}

		// Allow other extensions to add or override tools
		Hooks::run( 'MobileMenu', array( 'discovery', &$menu ) );
		return $menu->getEntries();
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
			$secureLogin = $this->getConfig()->get( 'SecureLogin' );

			if ( WebRequest::detectProtocol() != 'https' && $secureLogin ) {
				$loginUrl = SpecialPage::getTitleFor( 'Userlogin' )->getFullURL( $query );
				return $this->mobileContext->getMobileUrl( $loginUrl, $secureLogin );
			}
			return SpecialPage::getTitleFor( 'Userlogin' )->getLocalURL( $query );
		} else {
			return SpecialPage::getTitleFor( 'Userlogin' )->getFullURL( $query );
		}
	}

	/**
	 * Creates a login or logout button
	 *
	 * @param MenuBuilder $menu
	 */
	protected function insertLogInOutLink( MenuBuilder $menu ) {
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
			$url = $this->mobileContext->getMobileUrl( $url, $this->getConfig()->get( 'SecureLogin' ) );
			$username = $user->getName();

			$menu->insert( 'auth' )
				->addComponent(
					$username,
					Title::newFromText( $username, NS_USER )->getLocalUrl(),
					MobileUI::iconClass( 'profile', 'before', 'truncated-text primary-action' ),
					array( 'data-event-name' => 'profile' )
				)
				->addComponent(
					$this->msg( 'mobile-frontend-main-menu-logout' )->escaped(),
					$url,
					MobileUI::iconClass(
						'secondary-logout', 'element', 'secondary-action truncated-text' ),
					array( 'data-event-name' => 'logout' )
				);
		} else {
			// note returnto is not set for mobile (per product spec)
			// note welcome=yes in returnto  allows us to detect accounts created from the left nav
			$returntoquery[ 'welcome' ] = 'yes';
			// unset campaign on login link so as not to interfere with A/B tests
			unset( $returntoquery['campaign'] );
			$query[ 'returntoquery' ] = wfArrayToCgi( $returntoquery );
			$url = $this->getLoginUrl( $query );
			$menu->insert( 'auth', $isJSOnly = true )
				->addComponent(
					$this->msg( 'mobile-frontend-main-menu-login' )->escaped(),
					$url,
					MobileUI::iconClass( 'anonymous-white', 'before' ),
					array( 'data-event-name' => 'login' )
				);
		}
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
		$mp = new MobilePage( $this->getTitle(), false );
		$timestamp = $mp->getLatestTimestamp();
		// Main pages tend to include transclusions (see bug 51924)
		if ( $isMainPage ) {
			$lastModified = $this->msg( 'mobile-frontend-history' )->plain();
		} else {
			$lastModified = $this->msg(
				'mobile-frontend-last-modified-date',
				$this->getLanguage()->userDate( $timestamp, $user ),
				$this->getLanguage()->userTime( $timestamp, $user )
			)->parse();
		}
		$edit = $mp->getLatestEdit();
		$link = array(
			'data-timestamp' => $isMainPage ? '' : $edit['timestamp'],
			'href' => SpecialPage::getTitleFor( 'History', $title )->getLocalURL(),
			'text' => $lastModified,
			'data-user-name' => $edit['name'],
			'data-user-gender' => $edit['gender'],
		);
		return $link;
	}

	/**
	 * Returns the HTML representing the header.
	 * @returns {String} html for header
	 */
	protected function getHeaderHtml() {
		$html = '';
		if ( $this->isUserPage ) {
			// The heading is just the username without namespace
			$html = Html::rawElement( 'h1', array( 'id' => 'section_0' ),
				$this->pageUser->getName() );
			$fromDate = $this->pageUser->getRegistration();
			if ( is_string( $fromDate ) ) {
				$fromDateTs = new MWTimestamp( wfTimestamp( TS_UNIX, $fromDate ) );
				$html .= Html::element( 'div', array( 'class' => 'tagline', ),
					$this->msg( 'mobile-frontend-user-page-member-since',
						$fromDateTs->format( 'F, Y' ) )
				);
			}
		} else {
			$title = $this->getOutput()->getPageTitle();
			if ( $title ) {
				$html = Html::rawElement( 'h1', array( 'id' => 'section_0' ), $title );
			}
		}
		return $html;
	}
	/**
	 * Create and prepare header and footer content
	 * @param BaseTemplate $tpl
	 */
	protected function prepareHeaderAndFooter( BaseTemplate $tpl ) {
		$title = $this->getTitle();
		$user = $this->getUser();
		$out = $this->getOutput();
		if ( $this->isUserPage ) {
			$talkPage = $this->pageUser->getTalkPage();
			$data = array(
				'talkPageTitle' => $talkPage->getPrefixedURL(),
				'talkPageLink' => $talkPage->getLocalUrl(),
				'talkPageLinkTitle' => $this->msg(
					'mobile-frontend-user-page-talk' )->escaped(),
				'contributionsPageLink' => SpecialPage::getTitleFor(
					'Contributions', $this->pageUser )->getLocalURL(),
				'contributionsPageTitle' => $this->msg(
					'mobile-frontend-user-page-contributions' )->escaped(),
				'uploadsPageLink' => SpecialPage::getTitleFor(
					'Uploads', $this->pageUser )->getLocalURL(),
				'uploadsPageTitle' => $this->msg(
					'mobile-frontend-user-page-uploads' )->escaped(),
			);
			$templateParser = new TemplateParser( __DIR__ );
			$tpl->set( 'postheadinghtml',
				$templateParser->processTemplate( 'user_page_links', $data ) );
		} elseif ( $title->isMainPage() ) {
			if ( $user->isLoggedIn() ) {
				$pageTitle = $this->msg(
					'mobile-frontend-logged-in-homepage-notification', $user->getName() )->text();
			} else {
				$pageTitle = '';
			}
			$out->setPageTitle( $pageTitle );
		}

		if ( $this->canUseWikiPage() ) {
			// If it's a page that exists, add last edited timestamp
			if ( $this->getWikiPage()->exists() ) {
				$tpl->set( 'historyLink', $this->getHistoryLink( $title ) );
			}
		}
		$tpl->set( 'headinghtml', $this->getHeaderHtml() );

		// set defaults
		if ( !isset( $tpl->data['postbodytext'] ) ) {
			$tpl->set( 'postbodytext', '' ); // not currently set in desktop skin
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
				'title' => $this->msg( 'mobile-frontend-main-menu-button-tooltip' ),
				'href' => $url,
				'class' => MobileUI::iconClass( 'mainmenu', 'element', 'main-menu-button' ),
				'id'=> 'mw-mf-main-menu-button',
			), $this->msg( 'mobile-frontend-main-menu-button-tooltip' ) )
		);
	}

	/**
	 * Load internal banner content to show in pre content in template
	 * Beware of HTML caching when using this function.
	 * Content set as "internalbanner"
	 * @param BaseTemplate $tpl
	 */
	protected function prepareBanners( BaseTemplate $tpl ) {
		// Make sure Zero banner are always on top
		$banners = array( '<div id="siteNotice"></div>' );
		if ( $this->getMFConfig()->get( 'MinervaEnableSiteNotice' ) ) {
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
	 * Returns an array of sitelinks to add into the main menu footer.
	 * @return Array array of site links
	 */
	protected function getSiteLinks() {
		$menu = new MenuBuilder();

		// About link
		$title = Title::newFromText( $this->msg( 'aboutpage' )->inContentLanguage()->text() );
		$msg = $this->msg( 'aboutsite' );
		if ( $title && !$msg->isDisabled() ) {
			$menu->insert( 'about' )
				->addComponent( $msg->text(), $title->getLocalUrl() );
		}

		// Disclaimers link
		$title = Title::newFromText( $this->msg( 'disclaimerpage' )->inContentLanguage()->text() );
		$msg = $this->msg( 'disclaimers' );
		if ( $title && !$msg->isDisabled() ) {
			$menu->insert( 'disclaimers' )
				->addComponent( $msg->text(), $title->getLocalUrl() );
		}

		// Allow other extensions to add or override tools
		Hooks::run( 'MobileMenu', array( 'sitelinks', &$menu ) );
		return $menu->getEntries();
	}

	/**
	 * @return html for a message to display at top of old revisions
	 */
	protected function getOldRevisionHtml() {
		return $this->getOutput()->getSubtitle();
	}

	/**
	 * Prepare warnings for mobile output
	 * @param BaseTemplate $tpl
	 */
	protected function prepareWarnings( BaseTemplate $tpl ) {
		$out = $this->getOutput();
		if ( $out->getRequest()->getText( 'oldid' ) ) {
			$tpl->set( '_old_revision_warning',
				MobileUI::warningBox( $this->getOldRevisionHtml() ) );
		}
	}

	/**
	 * Returns an array with details for a language button.
	 * @return array
	 */
	protected function getLanguageButton() {
		$languageUrl = SpecialPage::getTitleFor(
			'MobileLanguages',
			$this->getSkin()->getTitle()
		)->getLocalURL();

		return array(
			'attributes' => array(
				'id' => 'language-switcher',
				// FIXME: remove class when cache clears
				'class' => 'languageSelector',
				'href' => $languageUrl,
			),
			'label' => $this->msg( 'mobile-frontend-language-article-heading' )->text()
		);
	}

	/**
	 * Returns an array with details for a talk button.
	 * @param Title $talkTitle Title object of the talk page
	 * @param array $talkButton Array with data of desktop talk button
	 * @return array
	 */
	protected function getTalkButton( $talkTitle, $talkButton ) {
		return array(
			'attributes' => array(
				'href' => $talkTitle->getLinkURL(),
				'data-title' => $talkTitle->getFullText(),
				'class' => MobileUI::iconClass( 'talk', 'before', 'talk' ),
			),
			'label' => $talkButton['text'],
		);
	}

	/**
	 * Returns an array of links for page secondary actions
	 * @param BaseTemplate $tpl
	 * @return string[]
	 */
	protected function getSecondaryActions( BaseTemplate $tpl ) {
		$buttons = array();

		// always add a button to link to the talk page
		// in beta it will be the entry point for the talk overlay feature,
		// in stable it will link to the wikitext talk page
		$title = $this->getTitle();
		$namespaces = $tpl->data['content_navigation']['namespaces'];
		if ( !$this->isUserPage && $this->isTalkAllowed() ) {
			// FIXME [core]: This seems unnecessary..
			$subjectId = $title->getNamespaceKey( '' );
			$talkId = $subjectId === 'main' ? 'talk' : "{$subjectId}_talk";
			if ( isset( $namespaces[$talkId] ) && !$title->isTalkPage() ) {
				$talkButton = $namespaces[$talkId];
			}

			$talkTitle = $title->getTalkPage();
			$buttons['talk'] = $this->getTalkButton( $talkTitle, $talkButton );
		}

		if ( $this->doesPageHaveLanguages &&
			( $title->isMainPage() || $this->shouldSecondaryActionsIncludeLanguageBtn ) ) {
			$buttons['language'] = $this->getLanguageButton();
		}

		return $buttons;
	}

	/**
	 * Prepare configured and available page actions
	 *
	 * When adding new page actions make sure each menu item has
	 * <code>is_js_only</code> key set to <code>true</code> or <code>false</code>.
	 * The key will be used to decide whether to display the page actions
	 * wrapper on the front end. The key will be considered false if not set.
	 *
	 * @param BaseTemplate $tpl
	 */
	protected function preparePageActions( BaseTemplate $tpl ) {
		$title = $this->getTitle();
		$noJsEdit = MobileContext::singleton()->getMFConfig()->get( 'MFAllowNonJavaScriptEditing' );
		// Reuse template data variable from SkinTemplate to construct page menu
		$menu = array();
		$actions = $tpl->data['content_navigation']['actions'];

		if ( $this->isUserPage ) {
			if ( !$this->getTitle()->exists() ) {
				$tpl->set( 'page_actions', $menu );
				return;
			}
		}

		// empty placeholder for edit and photos which both require js
		if ( $this->isAllowedPageAction( 'edit' ) ) {
			$additionalClass = $noJsEdit?' nojs-edit':'';

			$menu['edit'] = array( 'id' => 'ca-edit', 'text' => '',
				'itemtitle' => $this->msg( 'mobile-frontend-pageaction-edit-tooltip' ),
				'class' => MobileUI::iconClass( 'edit-enabled', 'element' . $additionalClass ),
				'links' => array(
						'edit' => array(
							'href' => $this->getTitle()->getLocalUrl( array( 'action' => 'edit', 'section' => 0 ) )
					)
				),
				'is_js_only' => !$noJsEdit
			);
		}

		if ( $this->isAllowedPageAction( 'watch' ) ) {
			$watchTemplate = array(
				'id' => 'ca-watch',
				// Use blank icon to reserve space for watchstar icon once JS loads
				'class' => MobileUI::iconClass( '', 'element',
					'icon-32px watch-this-article' ),
				'is_js_only' => true
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
	 * Checks to see if the current page is (probably) editable.
	 *
	 * This is the same check that sets wgIsProbablyEditable later in the page output
	 * process.
	 *
	 * @return boolean
	 */
	protected function isCurrentPageEditable() {
		$title = $this->getTitle();
		$user = $this->getUser();
		return $title->quickUserCan( 'edit', $user )
			&& ( $title->exists() || $title->quickUserCan( 'create', $user ) );
	}

	/**
	 * Returns a data representation of the main menus
	 * @return array
	 */
	protected function getMenuData() {
		$data = array(
			'discovery' => $this->getDiscoveryTools(),
			'personal' => $this->getPersonalTools(),
			'sitelinks' => $this->getSiteLinks(),
		);
		return $data;
	}
	/**
	 * Returns array of config variables that should be added only to this skin
	 * for use in JavaScript.
	 * @return array
	 */
	public function getSkinConfigVariables() {
		$title = $this->getTitle();
		$user = $this->getUser();
		$out = $this->getOutput();

		$vars = array(
			'wgMinervaMenuData' => $this->getMenuData(),
			// Expose for skins.minerva.tablet.scripts
			'wgMinervaTocEnabled' => $this->getOutput()->getProperty( 'MFTOC' )
		);

		if ( $this->isAuthenticatedUser() ) {
			$blockInfo = false;
			if ( $user->isBlockedFrom( $title, true ) ) {
				$block = $user->getBlock();
				$blockReason = $block->mReason ?
					$out->parseinline( $block->mReason ) : $this->msg( 'blockednoreason' )->text();
				$blockInfo = array(
					'blockedBy' => $block->getByName(),
					// check, if a reason for this block is saved, otherwise use "no reason given" msg
					'blockReason' => $blockReason,
				);
			}
			$vars['wgMinervaUserBlockInfo'] = $blockInfo;
		}

		return $vars;
	}

	/**
	 * Returns true, if the page can have a talk page and user is logged in.
	 * @return boolean
	 */
	protected function isTalkAllowed() {
		$title = $this->getTitle();
		return $this->isAllowedPageAction( 'talk' ) &&
			!$title->isTalkPage() &&
			$title->canTalk() &&
			$this->getUser()->isLoggedIn();
	}

	/*
	 * Returns true, if the talk page of this page is wikitext-based.
	 * @return boolean
	 */
	protected function isWikiTextTalkPage() {
		$title = $this->getTitle();
		if ( !$title->isTalkPage() ) {
			$title = $title->getTalkPage();
		}
		return $title->getContentModel() === CONTENT_MODEL_WIKITEXT;
	}

	/**
	 * Returns an array of modules related to the current context of the page.
	 * @return array
	 */
	public function getContextSpecificModules() {
		$modules = array();
		$user = $this->getUser();
		$req = $this->getRequest();
		$action = $req->getVal( 'article_action' );
		$campaign = $req->getVal( 'campaign' );
		$title = $this->getTitle();

		if ( $user->isLoggedIn() ) {
			if ( $this->useEcho() ) {
				$modules[] = 'skins.minerva.notifications';
			}

			if ( $this->isCurrentPageEditable() ) {
				if ( $action === 'signup-edit' || $campaign === 'leftNavSignup' ) {
					$modules[] = 'skins.minerva.newusers';
				}
			}
		}

		// TalkOverlay feature
		if (
			$this->isUserPage ||
			( $this->isTalkAllowed() || $title->isTalkPage() ) &&
			$this->isWikiTextTalkPage()
		) {
			$modules[] = 'skins.minerva.talk';
		}

		return $modules;
	}

	/**
	 * Returns the javascript entry modules to load. Only modules that need to
	 * be overriden or added conditionally should be placed here.
	 * @return array
	 */
	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		// flush unnecessary modules
		$modules['content'] = array();

		$modules['top'] = 'skins.minerva.scripts.top';
		// Define all the modules that should load on the mobile site and their dependencies.
		// Do not add mobules here.
		$modules['stable'] = 'skins.minerva.scripts';

		// Doing this unconditionally, prevents the desktop watchstar from ever leaking into mobile view.
		$modules['watch'] = array();
		if ( $this->isAllowedPageAction( 'watch' ) ) {
			// Explicitly add the mobile watchstar code.
			$modules['watch'] = array( 'skins.minerva.watchstar' );
		}

		if ( $this->isAllowedPageAction( 'edit' ) ) {
			$modules['editor'] = array( 'skins.minerva.editor' );
		}

		$modules['context'] = $this->getContextSpecificModules();

		if ( $this->isMobileMode ) {
			$modules['toggling'] = array( 'skins.minerva.toggling' );
		}
		$modules['site'] = 'mobile.site';

		// FIXME: Upstream?
		Hooks::run( 'SkinMinervaDefaultModules', array( $this, &$modules ) );
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
			'skins.minerva.base.reset',
			'skins.minerva.base.styles',
			'skins.minerva.content.styles',
			'skins.minerva.tablet.styles',
			'mediawiki.ui.icon',
			'mediawiki.ui.button',
			'skins.minerva.icons.images',
		);
		if ( $title->isMainPage() ) {
			$styles[] = 'skins.minerva.mainPage.styles';
		} elseif ( $this->isUserPage ) {
			$styles[] = 'skins.minerva.userpage.styles';
		} elseif ( $title->isSpecialPage() ) {
			$styles[] = 'mobile.messageBox';
			$styles['special'] = 'skins.minerva.special.styles';
		}
		if ( $this->getOutput()->getRequest()->getText( 'oldid' ) ) {
			$styles[] = 'mobile.messageBox';
		}
		return $styles;
	}

	/**
	 * Add skin-specific stylesheets
	 * @param OutputPage $out
	 */
	public function setupSkinUserCss( OutputPage $out ) {
		// Add Minerva-specific ResourceLoader modules to the page output
		$out->addModuleStyles( $this->getSkinStyles() );
	}
}
