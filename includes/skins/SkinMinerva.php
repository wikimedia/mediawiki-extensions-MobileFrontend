<?php

/**
 * Minerva: Born from the godhead of Jupiter with weapons!
 * A skin that works on both desktop and mobile
 * @ingroup Skins
 */
class SkinMinerva extends SkinTemplate {
	public $skinname = 'minerva';
	public $template = 'MinervaTemplate';
	public $useHeadElement = true;

	/**
	 * @var MobileContext
	 */
	protected $mobileContext;

	public function __construct() {
		$this->mobileContext = MobileContext::singleton();
	}

	/**
	 * Initializes output page and sets up skin-specific parameters
	 * @param $out OutputPage object to initialize
	 */
	public function initPage( OutputPage $out ) {
		parent::initPage( $out );

		$out->addJsConfigVars( $this->getSkinConfigVariables() );
	}

	/**
	 * Prepares the user button.
	 * @param $tpl BaseTemplate
	 */
	protected function prepareUserButton( BaseTemplate $tpl ) {
		$user = $this->getUser();
		if ( class_exists( 'MWEchoNotifUser' ) && $user->isLoggedIn() ) {
			// FIXME: cap higher counts
			$count = MWEchoNotifUser::newFromUser( $user )->getNotificationCount();

			$tpl->set( 'secondaryButton',
				Html::openElement( 'a', array(
					'title' => wfMessage( 'mobile-frontend-user-button-tooltip' ),
					'href' => SpecialPage::getTitleFor( 'Notifications' )->getLocalURL( array( 'returnto' => $this->getTitle()->getPrefixedText() ) ),
					'class' => 'user-button',
					'id'=> 'secondary-button',
				) ) .
				Html::element( 'span', array( 'class' => $count ? '' : 'zero' ), $count ) .
				Html::closeElement( 'a' )
			);
		} else {
			$tpl->set( 'secondaryButton', '' );
		}
	}

	/**
	 * Prepares urls and links used by the page
	 * @param QuickTemplate
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
			),
			'uploads' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-upload' )->escaped(),
				'href' => $this->getUser()->isLoggedIn() ? $donateTitle->getLocalUrl() :
					$this->getLoginUrl( array( 'returnto' => $donateTitle ) ),
				'class' => 'icon-uploads jsonly',
			),
			'settings' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-settings' )->escaped(),
				'href' => SpecialPage::getTitleFor( 'MobileOptions' )->
					getLocalUrl( array( 'returnto' => $returnToTitle ) ),
				'class' => 'icon-settings',
			),
			'auth' => $this->getLogInOutLink(),
		);
		$tpl->set( 'personal_urls', $items );
	}

	/**
	 * Prepares a list of links that have the purpose of discovery in the main navigation menu
	 * @param QuickTemplate
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
				'href' => SpecialPage::getTitleFor( 'Randompage' )->getLocalUrl(),
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
	 * taking into account $wgMFForceSecureLogin
	 * @param array $query
	 * @return string
	 */
	public function getLoginUrl( $query ) {
		return SpecialPage::getTitleFor( 'Userlogin' )->getFullURL( $query );
	}

	/**
	 * Creates a login or logout button
	 * @return Array: Representation of button with text and href keys
	*/
	protected function getLogInOutLink() {
		global $wgMFForceSecureLogin;
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

		if ( $this->getUser()->isLoggedIn() ) {
			if ( !empty( $returntoquery ) ) {
				$query[ 'returntoquery' ] = wfArrayToCgi( $returntoquery );
			}
			$url = SpecialPage::getTitleFor( 'UserLogout' )->getFullURL( $query );
			$url = $this->mobileContext->getMobileUrl( $url, $wgMFForceSecureLogin );
			$text = wfMessage( 'mobile-frontend-main-menu-logout' )->escaped();
		} else {
			 // note returnto is not set for mobile (per product spec)
			// note welcome=yes in return to query allows us to detect accounts created from the left nav
			$returntoquery[ 'welcome' ] = 'yes';
			$query[ 'returntoquery' ] = wfArrayToCgi( $returntoquery );
			$url = $this->getLoginUrl( $query );
			$text = wfMessage( 'mobile-frontend-main-menu-login' )->escaped();
		}
		wfProfileOut( __METHOD__ );
		return array(
			'text' => $text,
			'href' => $url,
			'class' => 'icon-loginout',
		);
	}

	public function prepareData( BaseTemplate $tpl ) {
		global $wgMFEnableSiteNotice;
		$title = $this->getTitle();
		$user = $this->getUser();
		$out = $this->getOutput();
		if ( $title->isMainPage() ) {
			$out->setPageTitle( $user->isLoggedIn() ?
				wfMessage( 'mobile-frontend-logged-in-homepage-notification', $user->getName() )->text() : '' );
		}
		$pageHeading = $out->getPageTitle();

		$htmlHeader = $out->getProperty( 'mobile.htmlHeader' );
		if ( $title->isSpecialPage() ) {
			if ( !$htmlHeader ) {
				$htmlHeader = Html::element( 'h1', array(), $pageHeading );
			}
			$tpl->set( 'specialPageHeader', $htmlHeader );
		} else {
			$preBodyText = Html::rawElement( 'h1', array( 'id' => 'section_0' ), $pageHeading );
			$tpl->set( 'prebodytext', $preBodyText );
		}

		// set defaults
		if ( !isset( $tpl->data['postbodytext'] ) ) {
			$tpl->set( 'postbodytext', '' ); // not currently set in desktop skin
		}

		$searchBox = array(
			'id' => 'searchInput',
			'class' => 'search',
			'autocomplete' => 'off',
			// The placeholder gets fed to HTML::element later which escapes all
			// attribute values, so no need to escape the string here.
			'placeholder' =>  wfMessage( 'mobile-frontend-placeholder' )->text(),
		);
		$tpl->set( 'searchBox', $searchBox );

		// menu button
		$url = SpecialPage::getTitleFor( 'MobileMenu' )->getLocalUrl() . '#mw-mf-page-left';
		$tpl->set( 'menuButton',
			Html::element( 'a', array(
			'title' => wfMessage( 'mobile-frontend-main-menu-button-tooltip' ),
			'href' => $url,
			'id'=> 'mw-mf-main-menu-button',
			) )
		);

		$banners = array();
		if ( $wgMFEnableSiteNotice ) {
			$banners[] = '<div id="siteNotice"></div>';
		}
		$tpl->set( 'banners', $banners );
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
		$tpl->set( 'page_actions', array() );
		if ( $out->getRequest()->getText( 'oldid' ) ) {
			$subtitle = $out->getSubtitle();
			$tpl->set( '_old_revision_warning',
				Html::openElement( 'div', array( 'class' => 'alert warning' ) ) . $subtitle . Html::closeElement( 'div' ) );
		}
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
		} else if ( isset( $actions['unwatch'] ) ) {
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
		$this->prepareUserButton( $tpl );

		$tpl->set( 'unstyledContent', $out->getProperty( 'unstyledContent' ) );
		$this->prepareDiscoveryTools( $tpl );
		$this->preparePersonalTools( $tpl );
	}

	/**
	 * Returns array of config variables that should be added only to this skin
	 * for use in JavaScript.
	 * @return Array
	 */
	public function getSkinConfigVariables() {
		global $wgMFLeadPhotoUploadCssSelector, $wgMFEnableCssAnimations,
			$wgMFUseCentralAuthToken,
			$wgMFDeviceWidthTablet,
			$wgMFAjaxUploadProgressSupport,
			$wgMFAnonymousEditing, $wgMFEnablePhotoUploadCTA,
			$wgMFPhotoUploadEndpoint, $wgMFPhotoUploadAppendToDesc;

		$title = $this->getTitle();
		$user = $this->getUser();
		$userCanCreatePage = !$title->exists() && $title->quickUserCan( 'create', $user );

		$vars = array(
			'wgMFUseCentralAuthToken' => $wgMFUseCentralAuthToken,
			'wgMFAjaxUploadProgressSupport' => $wgMFAjaxUploadProgressSupport,
			'wgMFAnonymousEditing' => $wgMFAnonymousEditing,
			'wgMFEnablePhotoUploadCTA' => $wgMFEnablePhotoUploadCTA,
			'wgMFPhotoUploadAppendToDesc' => $wgMFPhotoUploadAppendToDesc,
			'wgMFLeadPhotoUploadCssSelector' => $wgMFLeadPhotoUploadCssSelector,
			'wgMFEnableCssAnimations' => $wgMFEnableCssAnimations,
			'wgMFPhotoUploadEndpoint' => $wgMFPhotoUploadEndpoint ? $wgMFPhotoUploadEndpoint : '',
			'wgPreferredVariant' => $title->getPageLanguage()->getPreferredVariant(),
			'wgIsPageEditable' => $title->quickUserCan( 'edit', $user ) || $userCanCreatePage,
			'wgMFDeviceWidthTablet' => $wgMFDeviceWidthTablet,
		);
		if ( !$user->isAnon() ) {
			$vars['wgWatchedPageCache'] = array(
				$title->getPrefixedDBkey() => $user->isWatched( $title ),
			);
		}
		// mobile specific config variables
		if ( $this->mobileContext->shouldDisplayMobileView() ) {
			$vars['wgImagesDisabled'] = $this->mobileContext->imagesDisabled();
		}
		return $vars;
	}

	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		$out = $this->getOutput();

		$modules['mobile'] = array(
			'mobile.head',
			'mobile.startup',
			'mobile.site',
			// FIXME: separate mobile.stable into more meaningful groupings
			'mobile.stable',
		);

		$modules['watch'] = array();
		$modules['search'] = array();

		$title = $this->getTitle();
		// modules based on context
		$action = $this->getContext()->getRequest()->getText( 'action' );

		// specific to current context
		if ( $title->inNamespace( NS_FILE ) ) {
			$modules['file'] = array( 'mobile.file.scripts' );
		}

		if ( !$title->isSpecialPage() ) {
			$out->addModuleStyles( 'mobile.styles.page' );
		}

		$out->addModuleStyles( 'mobile.styles' );
		return $modules;
	}

	/**
	 * This will be called by OutputPage::headElement when it is creating the
	 * "<body>" tag, - adds output property bodyClassName to the existing classes
	 * @param $out OutputPage
	 * @param $bodyAttrs Array
	 */
	public function addToBodyAttributes( $out, &$bodyAttrs ) {
		// does nothing by default
		$classes = $out->getProperty( 'bodyClassName' );
		$bodyAttrs[ 'class' ] .= ' ' . $classes;
	}

	/**
	 * Add skin-specific stylesheets
	 * @param $out OutputPage
	 */
	public function setupSkinUserCss( OutputPage $out ) {
		parent::setupSkinUserCss( $out );
		// Add the ResourceLoader module to the page output
		$styles = array(
			'mobile.styles',
			'mobile.styles.page',
			'mobile.pagelist.styles',
		);
		$out->addModuleStyles( $styles );
	}

	/**
	 * Determines what the heading of the login page should be based on the context
	 * @return string
	 */
	protected function getLoginPageHeading() {
		if ( $this->getRequest()->getVal( 'type' ) == 'signup' ) {
			$key = 'mobile-frontend-sign-up-heading';
		} else {
			$key = 'mobile-frontend-sign-in-heading';
		}
		return wfMessage( $key )->plain();
	}
}
