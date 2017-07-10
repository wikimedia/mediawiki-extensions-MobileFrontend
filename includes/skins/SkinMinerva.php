<?php
/**
 * SkinMinerva.php
 */
use MediaWiki\Minerva\MenuBuilder;
use MediaWiki\MediaWikiServices;
use MediaWiki\Minerva\SkinUserPageHelper;

/**
 * Minerva: Born from the godhead of Jupiter with weapons!
 * A skin that works on both desktop and mobile
 * @ingroup Skins
 */
class SkinMinerva extends SkinTemplate implements ICustomizableSkin {
	/** Set of keys for available skin options. See $skinOptions. */
	const OPTION_MOBILE_OPTIONS = 'mobileOptionsLink';
	const OPTION_CATEGORIES = 'categories';
	const OPTION_FONT_CHANGER = 'fontChanger';
	const OPTION_BACK_TO_TOP = 'backToTop';
	const OPTION_TOGGLING = 'toggling';
	const OPTIONS_MOBILE_BETA = 'beta';

	/** @var string $skinname Name of this skin */
	public $skinname = 'minerva';
	/** @var string $template Name of this used template */
	public $template = 'MinervaTemplate';
	/** @var boolean $useHeadElement Specify whether show head elements */
	public $useHeadElement = true;
	/** @var ContentHandler Content handler of page; only access through getContentHandler */
	protected $contentHandler = null;
	/** @var bool Whether the page is also available in other languages or variants */
	protected $doesPageHaveLanguages = false;
	/** @var SkinUserPageHelper Helper class for UserPage handling */
	protected $userPageHelper;

	/**
	 * Returns the site name for the footer, either as a text or <img> tag
	 * @return string
	 */
	public function getSitename() {
		$config = $this->getConfig();
		$customLogos = $config->get( 'MinervaCustomLogos' );

		$footerSitename = $this->msg( 'mobile-frontend-footer-sitename' )->text();

		// If there's a custom site logo, use that instead of text
		if ( isset( $customLogos['copyright'] ) ) {
			$attributes =  [
				'src' => $customLogos['copyright'],
				'alt' => $footerSitename,
			];
			if ( isset( $customLogos['copyright-height'] ) ) {
				$attributes['height'] = $customLogos['copyright-height'];
			}
			if ( isset( $customLogos['copyright-width'] ) ) {
				$attributes['width'] = $customLogos['copyright-width'];
			}
			$sitename = Html::element( 'img', $attributes );
		} else {
			$sitename = $footerSitename;
		}

		return $sitename;
	}

	/** @var array skin specific options */
	protected $skinOptions = [
		self::OPTIONS_MOBILE_BETA => false,
		/**
		 * Whether the main menu should include a link to
		 * Special:Preferences of Special:MobileOptions
		 */
		self::OPTION_MOBILE_OPTIONS => false,
		/** Whether a categories button should appear at the bottom of the skin. */
		self::OPTION_CATEGORIES => false,
		/** Whether an option to change font size appears in Special:MobileOptions */
		self::OPTION_FONT_CHANGER => false,
		/** Whether a back to top button appears at the bottom of the view page */
		self::OPTION_BACK_TO_TOP => false,
		/** Whether sections can be collapsed (requires MobileFrontend and MobileFormatter) */
		self::OPTION_TOGGLING => false,
	];

	/**
	 * override an existing option or options with new values
	 * @param array $options
	 */
	public function setSkinOptions( $options ) {
		$this->skinOptions = array_merge( $this->skinOptions, $options );
	}

	/**
	 * Return whether a skin option is truthy
	 * @param string $key
	 * @return boolean
	 */
	public function getSkinOption( $key ) {
		return $this->skinOptions[$key];
	}

	/**
	 * initialize various variables and generate the template
	 * @return QuickTemplate
	 */
	protected function prepareQuickTemplate() {
		$out = $this->getOutput();
		// add head items
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
				case NS_USER_TALK:
					$msg = 'mobile-frontend-talk-back-to-userpage';
					break;
				case NS_PROJECT_TALK:
					$msg = 'mobile-frontend-talk-back-to-projectpage';
					break;
				case NS_FILE_TALK:
					$msg = 'mobile-frontend-talk-back-to-filepage';
					break;
				default: // generic (all other NS)
					$msg = 'mobile-frontend-talk-back-to-page';
			}
			$tpl->set( 'subject-page', MediaWikiServices::getInstance()->getLinkRenderer()->makeLink(
				$title->getSubjectPage(),
				$this->msg( $msg, $title->getText() )->text(),
				[ 'class' => 'return-link' ]
			) );
		}
	}

	/**
	 * Gets whether or not the page action is allowed.
	 *
	 * Page actions isn't allowed when:
	 * <ul>
	 *   <li>
	 *     the action is disabled (by removing it from the <code>MinervaPageActions</code>
	 *     configuration variable; or
	 *   </li>
	 *   <li>the user is on the main page</li>
	 * </ul>
	 *
	 * The "edit" page action is not allowed if editing is not possible on the page
	 * see @method: isCurrentPageContentModelEditable
	 *
	 * The "switch-language" is allowed if there are interlanguage links on the page,
	 * or <code>$wgMinervaAlwaysShowLanguageButton</code>
	 * is truthy.
	 *
	 * @param string $action
	 * @return boolean
	 */
	protected function isAllowedPageAction( $action ) {
		$title = $this->getTitle();
		$config = $this->getConfig();

		if (
			! in_array( $action, $config->get( 'MinervaPageActions' ) )
			|| $title->isMainPage()
			|| ( $this->getUserPageHelper()->isUserPage() && !$title->exists() )
		) {
			return false;
		}

		if ( $action === 'edit' ) {
			return $this->isCurrentPageContentModelEditable();
		}

		if ( $action === 'switch-language' ) {
			return $this->doesPageHaveLanguages || $config->get( 'MinervaAlwaysShowLanguageButton' );
		}

		return true;
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
		$noJsEdit = $this->getConfig()->get( 'MFAllowNonJavaScriptEditing' );

		if ( $this->isAllowedPageAction( 'edit' ) ) {
			$additionalClass = $noJsEdit ? ' nojs-edit': '';
			$lang = wfGetLangObj( $lang );
			$message = $this->msg( 'mobile-frontend-editor-edit' )->inLanguage( $lang )->text();
			$html = Html::openElement( 'span' );
			$html .= Html::element( 'a', [
				'href' =>  $this->getTitle()->getLocalUrl( [ 'action' => 'edit', 'section' => $section ] ),
				'title' => $this->msg( 'editsectionhint', $tooltip )->inLanguage( $lang )->text(),
				'data-section' => $section,
				// Note visibility of the edit section link button is controlled by .edit-page in ui.less so
				// we default to enabled even though this may not be true.
				'class' => MobileUI::iconClass( 'edit-enabled', 'element', 'edit-page' . $additionalClass ),
			], $message );
			$html .= Html::closeElement( 'span' );
			return $html;
		}
	}

	/**
	 * Gets content handler of current title
	 *
	 * @return ContentHandler
	 */
	protected function getContentHandler() {
		if ( $this->contentHandler === null ) {
			$this->contentHandler = ContentHandler::getForTitle( $this->getTitle() );
		}

		return $this->contentHandler;
	}

	/**
	 * Takes a title and returns classes to apply to the body tag
	 * @param Title $title
	 * @return string
	 */
	public function getPageClasses( $title ) {
		$className = parent::getPageClasses( $title );
		$className .= ' ' . ( $this->getSkinOption( self::OPTIONS_MOBILE_BETA ) ? 'beta' : 'stable' );

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
	 * Check whether the current user is authenticated or not.
	 * @todo This helper function is only truly needed whilst SkinMobileApp does not support login
	 * @return bool
	 */
	protected function isAuthenticatedUser() {
		return !$this->getUser()->isAnon();
	}

	/**
	 * Whether the output page contains category links and the category feature is enabled.
	 * @return bool
	 */
	private function hasCategoryLinks() {
		if ( !$this->getSkinOption( self::OPTION_CATEGORIES ) ) {
			return false;
		}
		$categoryLinks = $this->getOutput()->getCategoryLinks();

		if ( !count( $categoryLinks ) ) {
			return false;
		}
		return !empty( $categoryLinks['normal'] ) || !empty( $categoryLinks['hidden'] );
	}

	/**
	 * @return SkinUserPageHelper
	 */
	public function getUserPageHelper() {
		if ( $this->userPageHelper === null ) {
			$this->userPageHelper = new SkinUserPageHelper( $this->getContext() );
		}
		return $this->userPageHelper;
	}

	/**
	 * Initializes output page and sets up skin-specific parameters
	 * @param OutputPage $out object to initialize
	 */
	public function initPage( OutputPage $out ) {
		parent::initPage( $out );
		$styles = [];
		// FIXME: Merge this module with skins.minerva.base.styles
		$styles[] = 'skins.minerva.print.styles';

		$out->addModuleStyles( $styles );
		$out->addJsConfigVars( $this->getSkinConfigVariables() );
	}

	/**
	 * Returns, if Extension:Echo should be used.
	 * @return bool
	 */
	protected function useEcho() {
		return class_exists( 'MWEchoNotifUser' );
	}

	/**
	 * Get Echo notification target user
	 * @param User $user
	 * @return MWEchoNotifUser
	 */
	protected function getEchoNotifUser( User $user ) {
		return MWEchoNotifUser::newFromUser( $user );
	}

	/**
	 * Get the last time user has seen Echo notifications
	 * @param User $user
	 * @return string|bool Timestamp in TS_ISO_8601 format, or false if no stored time
	 */
	protected function getEchoSeenTime( User $user ) {
		return EchoSeenTime::newFromUser( $user )->getTime( 'all', /*flags*/ 0, TS_ISO_8601 );
	}

	/**
	 * Get formatted Echo notification count
	 * @param int $count
	 * @return string
	 */
	protected function getFormattedEchoNotificationCount( $count ) {
		return EchoNotificationController::formatNotificationCount( $count );
	}

	/**
	 * Prepares the user button.
	 * @param QuickTemplate $tpl
	 */
	protected function prepareUserButton( QuickTemplate $tpl ) {
		// Set user button to empty string by default
		$tpl->set( 'secondaryButtonData', '' );
		$notificationsTitle = '';
		$countLabel = '';
		$isZero = true;
		$hasUnseen = false;

		$user = $this->getUser();
		$newtalks = $this->getNewtalks();
		$currentTitle = $this->getTitle();

		// If Echo is available, the user is logged in, and they are not already on the
		// notifications archive, show the notifications icon in the header.
		if ( $this->useEcho() && $user->isLoggedIn() ) {
			$notificationsTitle = SpecialPage::getTitleFor( 'Notifications' );
			if ( $currentTitle->equals( $notificationsTitle ) ) {
				// Don't show the secondary button at all
				$notificationsTitle = null;
			} else {
				$notifUser = $this->getEchoNotifUser( $user );
				$echoSeenTime = $this->getEchoSeenTime( $user );

				$notificationsMsg = $this->msg( 'mobile-frontend-user-button-tooltip' )->text();
				$notifLastUnreadTime = $notifUser->getLastUnreadNotificationTime();
				$count = $notifUser->getNotificationCount();

				$isZero = $count === 0;
				$hasUnseen = (
					$count > 0 &&
					$echoSeenTime !== false &&
					$notifLastUnreadTime !== false &&
					$echoSeenTime < $notifLastUnreadTime->getTimestamp( TS_ISO_8601 )
				);

				$countLabel = $this->getFormattedEchoNotificationCount( $count );
			}
		} elseif ( !empty( $newtalks ) ) {
			$notificationsTitle = SpecialPage::getTitleFor( 'Mytalk' );
			$notificationsMsg = $this->msg( 'mobile-frontend-user-newmessages' )->text();
		}

		if ( $notificationsTitle ) {
			$url = $notificationsTitle->getLocalURL(
				[ 'returnto' => $currentTitle->getPrefixedText() ] );

			$tpl->set( 'secondaryButtonData', [
				'notificationIconClass' => MobileUI::iconClass( 'notifications' ),
				'title' => $notificationsMsg,
				'url' => $url,
				'notificationCount' => $countLabel,
				'isNotificationCountZero' => $isZero,
				'hasNotifications' => $hasUnseen,
				'hasUnseenNotifications' => $hasUnseen
			] );
		}
	}

	/**
	 * Return a url to a resource or to a login screen that redirects to that resource.
	 * @param Title $title
	 * @param string $warning Key of message to display on login page (optional)
	 * @param array $query representation of query string parameters (optional)
	 * @return string url
	 */
	protected function getPersonalUrl( Title $title, $warning, array $query = [] ) {
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
	 * Inserts the Contributions menu item into the menu.
	 *
	 * @param MenuBuilder $menu
	 * @param User $user The user to whom the contributions belong
	 */
	private function insertContributionsMenuItem( MenuBuilder $menu, User $user ) {
		$menu->insert( 'contribs' )
			->addComponent(
				$this->msg( 'mobile-frontend-main-menu-contributions' )->escaped(),
				SpecialPage::getTitleFor( 'Contributions', $user->getName() )->getLocalUrl(),
				MobileUI::iconClass( 'mf-contributions', 'before' ),
				[ 'data-event-name' => 'contributions' ]
			);
	}

	/**
	 * Inserts the Watchlist menu item into the menu.
	 *
	 * @param MenuBuilder $menu
	 */
	protected function insertWatchlistMenuItem( MenuBuilder $menu ) {
		$watchTitle = SpecialPage::getTitleFor( 'Watchlist' );

		// Watchlist link
		$watchlistQuery = [];
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
				MobileUI::iconClass( 'mf-watchlist', 'before' ),
				[ 'data-event-name' => 'watchlist' ]
			);
	}

	/**
	 * If the user is using a mobile device (or the UA presents itself as a mobile device), then the
	 * Settings menu item is inserted into the menu; otherwise the Preferences menu item is inserted.
	 *
	 * @param MenuBuilder $menu
	 */
	protected function insertSettingsMenuItem( MenuBuilder $menu ) {
		$returnToTitle = $this->getTitle()->getPrefixedText();

		// Links specifically for mobile mode
		if ( $this->getSkinOption( self::OPTION_MOBILE_OPTIONS ) ) {
			// Settings link
			$menu->insert( 'settings' )
				->addComponent(
					$this->msg( 'mobile-frontend-main-menu-settings' )->escaped(),
					SpecialPage::getTitleFor( 'MobileOptions' )->
						getLocalUrl( [ 'returnto' => $returnToTitle ] ),
					MobileUI::iconClass( 'mf-settings', 'before' ),
					[ 'data-event-name' => 'settings' ]
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
					MobileUI::iconClass( 'mf-settings', 'before' ),
					[ 'data-event-name' => 'preferences' ]
				);
		}
	}

	/**
	 * Builds the personal tools menu item group.
	 *
	 * ... by adding the Watchlist, Settings, and Log{in,out} menu items in the given order.
	 *
	 * @param MenuBuilder $menu
	 */
	protected function buildPersonalTools( MenuBuilder $menu ) {
		$this->insertLogInOutMenuItem( $menu );

		$user = $this->getUser();

		if ( $user->isLoggedIn() ) {
			$this->insertWatchlistMenuItem( $menu );
			$this->insertContributionsMenuItem( $menu, $user );
		}
	}

	/**
	 * Prepares and returns urls and links personal to the given user
	 * @return array
	 */
	protected function getPersonalTools() {
		$menu = new MenuBuilder();

		$this->buildPersonalTools( $menu );

		// Allow other extensions to add or override tools
		Hooks::run( 'MobileMenu', [ 'personal', &$menu ] );
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
	 * Like <code>SkinMinerva#getDiscoveryTools</code> and <code>#getPersonalTools</code>, create
	 * a group of configuration-related menu items. Currently, only the Settings menu item is in the
	 * group.
	 *
	 * @return array
	 */
	private function getConfigurationTools() {
		$menu = new MenuBuilder();

		$this->insertSettingsMenuItem( $menu );

		return $menu->getEntries();
	}

	/**
	 * Prepares a list of links that have the purpose of discovery in the main navigation menu
	 * @return array
	 */
	protected function getDiscoveryTools() {
		$config = $this->getConfig();
		$menu = new MenuBuilder();

		// Home link
		$menu->insert( 'home' )
			->addComponent(
				$this->msg( 'mobile-frontend-home-button' )->escaped(),
				Title::newMainPage()->getLocalUrl(),
				MobileUI::iconClass( 'mf-home', 'before' ),
				[ 'data-event-name' => 'home' ]
			);

		// Random link
		$menu->insert( 'random' )
			->addComponent(
				$this->msg( 'mobile-frontend-random-button' )->escaped(),
				SpecialPage::getTitleFor( 'Randompage' )->getLocalUrl() . '#/random',
				MobileUI::iconClass( 'mf-random', 'before' ),
				[
					'id' => 'randomButton',
					'data-event-name' => 'random',
				]
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
					MobileUI::iconClass( 'mf-nearby', 'before', 'nearby' ),
					[ 'data-event-name' => 'nearby' ]
				);
		}

		// Allow other extensions to add or override tools
		Hooks::run( 'MobileMenu', [ 'discovery', &$menu ] );
		return $menu->getEntries();
	}

	/**
	 * Prepares a url to the Special:UserLogin with query parameters
	 * @param array $query
	 * @return string
	 */
	public function getLoginUrl( $query ) {
		return SpecialPage::getTitleFor( 'Userlogin' )->getLocalURL( $query );
	}

	/**
	 * Creates a login or logout button
	 *
	 * @param MenuBuilder $menu
	 */
	protected function insertLogInOutMenuItem( MenuBuilder $menu ) {
		$query = [];
		$canEdit = $this->getConfig()->get( 'MFAllowNonJavaScriptEditing' );
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
			$url = SpecialPage::getTitleFor( 'Userlogout' )->getLocalURL( $query );
			$username = $user->getName();

			$menu->insert( 'auth', $isJSOnly = !$canEdit )
				->addComponent(
					$username,
					Title::newFromText( $username, NS_USER )->getLocalUrl(),
					MobileUI::iconClass( 'mf-profile', 'before', 'truncated-text primary-action' ),
					[ 'data-event-name' => 'profile' ]
				)
				->addComponent(
					$this->msg( 'mobile-frontend-main-menu-logout' )->escaped(),
					$url,
					MobileUI::iconClass(
						'mf-logout', 'element', 'secondary-action truncated-text' ),
					[ 'data-event-name' => 'logout' ]
				);
		} else {
			// note returnto is not set for mobile (per product spec)
			// note welcome=yes in returnto  allows us to detect accounts created from the left nav
			$returntoquery[ 'welcome' ] = 'yes';
			// unset campaign on login link so as not to interfere with A/B tests
			unset( $returntoquery['campaign'] );
			$query[ 'returntoquery' ] = wfArrayToCgi( $returntoquery );
			$url = $this->getLoginUrl( $query );
			$menu->insert( 'auth', $isJSOnly = !$canEdit )
				->addComponent(
					$this->msg( 'mobile-frontend-main-menu-login' )->escaped(),
					$url,
					MobileUI::iconClass( 'mf-anonymous', 'before' ),
					[ 'data-event-name' => 'login' ]
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
		// Get rev_timestamp of current revision (preloaded by MediaWiki core)
		$timestamp = $this->getOutput()->getRevisionTimestamp();
		$mp = new MobilePage( $this->getTitle(), false );
		$mp->setLatestTimestamp( $timestamp );
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
		$link = [
			// Use $edit['timestamp'] (Unix format) instead of $timestamp (MW format)
			'data-timestamp' => $isMainPage ? '' : $edit['timestamp'],
			'href' => SpecialPage::getTitleFor( 'History', $title )->getLocalURL(),
			'text' => $lastModified,
			'data-user-name' => $edit['name'],
			'data-user-gender' => $edit['gender'],
		];
		return $link;
	}
	/**
	 * Returns the HTML representing the tagline
	 * @return string HTML for tagline
	 */
	protected function getTaglineHtml() {
		$tagline = false;

		if ( $this->getUserPageHelper()->isUserPage() ) {
			$pageUser = $this->getUserPageHelper()->getPageUser();
			$fromDate = $pageUser->getRegistration();
			if ( is_string( $fromDate ) ) {
				$fromDateTs = wfTimestamp( TS_UNIX, $fromDate );

				// This is shown when js is disabled. js enhancement made due to caching
				$tagline = $this->msg( 'mobile-frontend-user-page-member-since',
						$this->getLanguage()->userDate( new MWTimestamp( $fromDateTs ), $this->getUser() ),
						$pageUser );

				// Define html attributes for usage with js enhancement (unix timestamp, gender)
				$attrs = [ 'id' => 'tagline-userpage',
					'data-userpage-registration-date' => $fromDateTs,
					'data-userpage-gender' => $pageUser->getOption( 'gender' ) ];
			}
		} else {
			$title = $this->getTitle();
			if ( $title ) {
				if ( !$title->isMainPage() && $title->inNamespace( NS_MAIN ) ) {
					$vars = $this->getSkinConfigVariables();
					$tagline = $vars['wgMFDescription'];
				}
			}
		}

		$attrs[ 'class' ] = 'tagline';
		return $tagline ?
			Html::element( 'div', $attrs, $tagline ) : '';
	}
	/**
	 * Returns the HTML representing the heading.
	 * @return string HTML for header
	 */
	protected function getHeadingHtml() {
		$heading = '';
		if ( $this->getUserPageHelper()->isUserPage() ) {
			// The heading is just the username without namespace
			$heading = $this->getUserPageHelper()->getPageUser()->getName();
		} else {
			$pageTitle = $this->getOutput()->getPageTitle();
			if ( $pageTitle ) {
				$heading = $pageTitle;
			}
		}
		return Html::rawElement( 'h1', [ 'id' => 'section_0' ], $heading );
	}
	/**
	 * Create and prepare header and footer content
	 * @param BaseTemplate $tpl
	 */
	protected function prepareHeaderAndFooter( BaseTemplate $tpl ) {
		$title = $this->getTitle();
		$user = $this->getUser();
		$out = $this->getOutput();
		$postHeadingHtml = $this->getTaglineHtml();
		if ( $this->getUserPageHelper()->isUserPage() ) {
			$pageUser = $this->getUserPageHelper()->getPageUser();
			$talkPage = $pageUser->getTalkPage();
			$data = [
				'talkPageTitle' => $talkPage->getPrefixedURL(),
				'talkPageLink' => $talkPage->getLocalUrl(),
				'talkPageLinkTitle' => $this->msg(
					'mobile-frontend-user-page-talk' )->escaped(),
				'contributionsPageLink' => SpecialPage::getTitleFor(
					'Contributions', $pageUser )->getLocalURL(),
				'contributionsPageTitle' => $this->msg(
					'mobile-frontend-user-page-contributions' )->escaped(),
				'uploadsPageLink' => SpecialPage::getTitleFor(
					'Uploads', $pageUser )->getLocalURL(),
				'uploadsPageTitle' => $this->msg(
					'mobile-frontend-user-page-uploads' )->escaped(),
			];
			$templateParser = new TemplateParser( __DIR__ );
			$postHeadingHtml .=
				$templateParser->processTemplate( 'user_page_links', $data );
		} elseif ( $title->isMainPage() ) {
			if ( $user->isLoggedIn() ) {
				$pageTitle = $this->msg(
					'mobile-frontend-logged-in-homepage-notification', $user->getName() )->text();
			} else {
				$pageTitle = '';
			}
			$out->setPageTitle( $pageTitle );
		}
		$tpl->set( 'postheadinghtml', $postHeadingHtml );

		if ( $this->canUseWikiPage() ) {
			// If it's a page that exists, add last edited timestamp
			if ( $this->getWikiPage()->exists() ) {
				$tpl->set( 'historyLink', $this->getHistoryLink( $title ) );
			}
		}
		$tpl->set( 'headinghtml', $this->getHeadingHtml() );
		$tpl->set( 'footer-site-heading-html', $this->getSitename() );
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
			Html::element( 'a', [
				'title' => $this->msg( 'mobile-frontend-main-menu-button-tooltip' ),
				'href' => $url,
				'class' => MobileUI::iconClass( 'mainmenu', 'element', 'main-menu-button' ),
				'id'=> 'mw-mf-main-menu-button',
			], $this->msg( 'mobile-frontend-main-menu-button-tooltip' ) )
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
		$banners = [ '<div id="siteNotice"></div>' ];
		if ( $this->getConfig()->get( 'MinervaEnableSiteNotice' ) ) {
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
		Hooks::run( 'MobileMenu', [ 'sitelinks', &$menu ] );
		return $menu->getEntries();
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

		return [
			'attributes' => [
				'class' => 'language-selector',
				'href' => $languageUrl,
			],
			'label' => $this->msg( 'mobile-frontend-language-article-heading' )->text()
		];
	}

	/**
	 * Returns an array with details for a talk button.
	 * @param Title $talkTitle Title object of the talk page
	 * @param array $talkButton Array with data of desktop talk button
	 * @return array
	 */
	protected function getTalkButton( $talkTitle, $talkButton ) {
		return [
			'attributes' => [
				'href' => $talkTitle->getLinkURL(),
				'data-title' => $talkTitle->getFullText(),
				'class' => 'talk',
			],
			'label' => $talkButton['text'],
		];
	}

	/**
	 * Returns an array with details for a categories button.
	 * @return array
	 */
	protected function getCategoryButton() {
		return [
			'attributes' => [
				'href' => '#/categories',
				// add hidden class (the overlay works only, when JS is enabled (class will
				// be removed in categories/init.js)
				'class' => 'category-button hidden',
			],
			'label' => $this->msg( 'categories' )->text()
		];
	}

	/**
	 * Returns an array of links for page secondary actions
	 * @param BaseTemplate $tpl
	 * @return string[]
	 */
	protected function getSecondaryActions( BaseTemplate $tpl ) {
		$buttons = [];

		// always add a button to link to the talk page
		// in beta it will be the entry point for the talk overlay feature,
		// in stable it will link to the wikitext talk page
		$title = $this->getTitle();
		$namespaces = $tpl->data['content_navigation']['namespaces'];
		if ( !$this->getUserPageHelper()->isUserPage() && $this->isTalkAllowed() ) {
			// FIXME [core]: This seems unnecessary..
			$subjectId = $title->getNamespaceKey( '' );
			$talkId = $subjectId === 'main' ? 'talk' : "{$subjectId}_talk";
			if ( isset( $namespaces[$talkId] ) && !$title->isTalkPage() ) {
				$talkButton = $namespaces[$talkId];
				$talkTitle = $title->getTalkPage();
				$buttons['talk'] = $this->getTalkButton( $talkTitle, $talkButton );
			}
		}

		if ( $this->doesPageHaveLanguages && $title->isMainPage() ) {
			$buttons['language'] = $this->getLanguageButton();
		}

		if ( $this->hasCategoryLinks() ) {
			$buttons['categories'] = $this->getCategoryButton();
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
		$menu = [];

		if ( $this->isAllowedPageAction( 'edit' ) ) {
			$menu['edit'] = $this->createEditPageAction();
		}

		if ( $this->isAllowedPageAction( 'watch' ) ) {
			// SkinTemplate#buildContentNavigationUrls creates distinct "watch" and "unwatch" actions.
			// Pass these actions in as context for #createWatchPageAction.
			$actions = $tpl->data['content_navigation']['actions'];

			$menu['watch'] = $this->createWatchPageAction( $actions );
		}

		if ( $this->isAllowedPageAction( 'switch-language' ) ) {
			$menu['switch-language'] = $this->createSwitchLanguageAction();
		}

		$tpl->set( 'page_actions', $menu );
	}

	/**
	 * Creates the "edit" page action: the well-known pencil icon that, when tapped, will open an
	 * editor with the lead section loaded.
	 *
	 * @return array A map compatible with BaseTemplate#makeListItem
	 */
	protected function createEditPageAction() {
		$noJsEdit = $this->getConfig()->get( 'MFAllowNonJavaScriptEditing' );
		$additionalClass = $noJsEdit ? ' nojs-edit' : '';

		return [
			'id' => 'ca-edit',
			'text' => '',
			'itemtitle' => $this->msg( 'mobile-frontend-pageaction-edit-tooltip' ),
			'class' => MobileUI::iconClass( 'edit-enabled', 'element' . $additionalClass ),
			'links' => [
				'edit' => [
					'href' => $this->getTitle()->getLocalURL( [ 'action' => 'edit', 'section' => 0 ] )
				],
			],
			'is_js_only' => !$noJsEdit
		];
	}

	/**
	 * Creates the "watch" or "unwatch" action: the well-known star icon that, when tapped, will
	 * add the page to or remove the page from the user's watchlist; or, if the user is logged out,
	 * will direct the user's UA to Special:Login.
	 *
	 * @param array $actions
	 * @return array A map compatible with BaseTemplate#makeListItem
	 */
	protected function createWatchPageAction( $actions ) {
		$baseResult = [
			'id' => 'ca-watch',
			// Use blank icon to reserve space for watchstar icon once JS loads
			'class' => MobileUI::iconClass( '', 'element', 'watch-this-article' ),
			'is_js_only' => true
		];
		$title = $this->getTitle();

		if ( isset( $actions['watch'] ) ) {
			$result = array_merge( $actions['watch'], $baseResult );
		} elseif ( isset( $actions['unwatch'] ) ) {
			$result = array_merge( $actions['unwatch'], $baseResult );
			$result['class'] .= ' watched';
		} else {
			// placeholder for not logged in
			$result = array_merge( $baseResult, [
				// FIXME: makeLink (used by makeListItem) when no text is present defaults to use the key
				'text' => '',
				'href' => $this->getLoginUrl( [ 'returnto' => $title ] ),
			] );
		}

		return $result;
	}

	/**
	 * Creates the the "switch-language" action: the icon that, when tapped, opens the language
	 * switcher.
	 *
	 * @return array A map compatible with BaseTemplate#makeListItem
	 */
	protected function createSwitchLanguageAction() {
		$languageSwitcherLinks = [];
		$languageSwitcherClasses = 'language-selector';

		if ( $this->doesPageHaveLanguages ) {
			$languageSwitcherLinks['mobile-frontend-language-article-heading'] = [
				'href' => SpecialPage::getTitleFor( 'MobileLanguages', $this->getTitle() )->getLocalURL()
			];
		} else {
			$languageSwitcherClasses .= ' disabled';
		}

		return [
			'text' => '',
			'itemtitle' => $this->msg( 'mobile-frontend-language-article-heading' ),
			'class' => MobileUI::iconClass( 'language-switcher', 'element', $languageSwitcherClasses ),
			'links' => $languageSwitcherLinks,
			'is_js_only' => false
		];
	}

	/**
	 * Checks to see if the current page is (probably) editable by the current user
	 *
	 * This is mostly the same check that sets wgIsProbablyEditable later in the page output
	 * process.
	 *
	 * @return boolean
	 */
	protected function isCurrentPageEditableByUser() {
		$title = $this->getTitle();
		$user = $this->getUser();
		return $title->quickUserCan( 'edit', $user )
			&& ( $title->exists() || $title->quickUserCan( 'create', $user ) );
	}

	/**
	 * Checks whether the editor can handle the existing content handler type.
	 *
	 * This is mostly the same check that sets wgIsProbablyEditable later in the page output
	 * process.
	 *
	 * @return boolean
	 */
	protected function isCurrentPageContentModelEditable() {
		$contentHandler = $this->getContentHandler();

		return $contentHandler->supportsDirectEditing()
			&& $contentHandler->supportsDirectApiEditing();
	}

	/**
	 * Returns a data representation of the main menus
	 * @return array
	 */
	protected function getMenuData() {
		$data = [
			'groups' => [
				$this->getDiscoveryTools(),
				$this->getPersonalTools(),
				$this->getConfigurationTools(),
			],
			'sitelinks' => $this->getSiteLinks(),
		];

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

		$vars = [
			'wgMinervaMenuData' => $this->getMenuData(),
			// Expose for skins.minerva.tablet.scripts
			'wgMinervaTocEnabled' => $out->getProperty( 'MFTOC' ),
			'wgMFDescription' => $out->getProperty( 'wgMFDescription' ),
		];

		if ( $this->isAuthenticatedUser() ) {
			$blockInfo = false;
			if ( $user->isBlockedFrom( $title, true ) ) {
				$block = $user->getBlock();
				$blockReason = $block->mReason ?
					$out->parseinline( $block->mReason ) : $this->msg( 'blockednoreason' )->text();
				$blockInfo = [
					'blockedBy' => $block->getByName(),
					// check, if a reason for this block is saved, otherwise use "no reason given" msg
					'blockReason' => $blockReason,
				];
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
		$modules = [];
		$user = $this->getUser();
		$req = $this->getRequest();
		$action = $req->getVal( 'article_action' );
		$campaign = $req->getVal( 'campaign' );
		$title = $this->getTitle();

		if ( !$title->isSpecialPage() ) {
			if ( $this->isAllowedPageAction( 'watch' ) ) {
				// Explicitly add the mobile watchstar code.
				$modules[] = 'skins.minerva.watchstar';
			}
			if ( $this->isCurrentPageContentModelEditable() ) {
				$modules[] = 'skins.minerva.editor';
			}
		}

		if ( $user->isLoggedIn() ) {
			if ( $this->useEcho() ) {
				$modules[] = 'skins.minerva.notifications';
			}

			if ( $this->isCurrentPageEditableByUser() ) {
				if ( $action === 'signup-edit' || $campaign === 'leftNavSignup' ) {
					$modules[] = 'skins.minerva.newusers';
				}
			}
		}

		// TalkOverlay feature
		if (
			$this->getUserPageHelper()->isUserPage() ||
			( $this->isTalkAllowed() || $title->isTalkPage() ) &&
			$this->isWikiTextTalkPage()
		) {
			$modules[] = 'skins.minerva.talk';
		}

		if ( $this->hasCategoryLinks() ) {
			$modules[] = 'skins.minerva.categories';
		}

		if ( $this->getSkinOption( self::OPTION_FONT_CHANGER ) ) {
			$modules[] = 'skins.minerva.fontchanger';
		}

		if ( $this->getSkinOption( self::OPTION_BACK_TO_TOP ) ) {
			$modules[] = 'skins.minerva.backtotop';
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
		// dequeue default content modules (toc, sortable, collapsible, etc.)
		$modules['content'] = [];
		// dequeue default watch module (not needed, no watchstar in this skin)
		$modules['watch'] = [];
		// disable default skin search modules
		$modules['search'] = [];

		$modules['minerva'] = array_merge(
			$this->getContextSpecificModules(),
			[
				'skins.minerva.scripts.top',
				'skins.minerva.scripts',
				'mobile.site',
			]
		);

		if ( $this->getSkinOption( self::OPTION_TOGGLING ) ) {
			// Extension can unload "toggling" modules via the hook
			$modules['toggling'] = [ 'skins.minerva.toggling' ];
		}

		Hooks::run( 'SkinMinervaDefaultModules', [ $this, &$modules ] );

		return $modules;
	}

	/**
	 * Modifies the `<body>` element's attributes.
	 *
	 * By default, the `class` attribute is set to the output's "bodyClassName"
	 * property.
	 *
	 * @param OutputPage $out
	 * @param array $bodyAttrs
	 */
	public function addToBodyAttributes( $out, &$bodyAttrs ) {
		$classes = $out->getProperty( 'bodyClassName' );

		$bodyAttrs[ 'class' ] .= ' ' . $classes;
	}

	/**
	 * Get the needed styles for this skin
	 * @return array
	 */
	protected function getSkinStyles() {
		$title = $this->getTitle();
		$styles = [
			'skins.minerva.base.reset',
			'skins.minerva.base.styles',
			'skins.minerva.content.styles',
			'skins.minerva.tablet.styles',
			'mediawiki.ui.icon',
			'mediawiki.ui.button',
			'skins.minerva.icons.images',
		];
		if ( $title->isMainPage() ) {
			$styles[] = 'skins.minerva.mainPage.styles';
		} elseif ( $this->getUserPageHelper()->isUserPage() ) {
			$styles[] = 'skins.minerva.userpage.styles';
			$styles[] = 'skins.minerva.userpage.icons';
		} elseif ( $title->isSpecialPage() ) {
			$styles[] = 'mobile.messageBox.styles';
			$styles['special'] = 'skins.minerva.special.styles';
		}
		if ( $this->getOutput()->getRequest()->getText( 'oldid' ) ) {
			$styles[] = 'mobile.messageBox.styles';
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
