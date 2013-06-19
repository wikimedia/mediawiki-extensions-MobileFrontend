<?php

class SkinMobile extends SkinMinerva {
	public $template = 'MobileTemplate';

	/**
	 * @var ExtMobileFrontend
	 */
	protected $extMobileFrontend;
	protected $hookOptions;

	/** @var array of classes that should be present on the body tag */
	private $pageClassNames = array();

	public function __construct( ExtMobileFrontend $extMobileFrontend ) {
		$this->setContext( $extMobileFrontend );
		$this->extMobileFrontend = $extMobileFrontend;
		$ctx = MobileContext::singleton();
		$this->addPageClass( 'mobile' );
		if ( $ctx->isAlphaGroupMember() ) {
			$this->addPageClass( 'alpha' );
		} else if ( $ctx->isBetaGroupMember() ) {
			$this->addPageClass( 'beta' );
		} else {
			$this->addPageClass( 'stable' );
		}
	}

	public function outputPage( OutputPage $out = null ) {
		global $wgMFNoindexPages;
		wfProfileIn( __METHOD__ );
		if ( !$out ) {
			$out = $this->getOutput();
		}
		if ( $wgMFNoindexPages ) {
			$out->setRobotPolicy( 'noindex,nofollow' );
		}

		$options = null;
		if ( wfRunHooks( 'BeforePageDisplayMobile', array( &$out, &$options ) ) ) {
			if ( is_array( $options ) ) {
				$this->hookOptions = $options;
			}
		}
		$html = $this->extMobileFrontend->DOMParse( $out );

		wfProfileIn( __METHOD__  . '-tpl' );
		$tpl = $this->prepareTemplate();
		$tpl->set( 'headelement', $out->headElement( $this ) );
		$tpl->set( 'bodytext', $html );
		$notice = '';
		wfRunHooks( 'GetMobileNotice', array( $this, &$notice ) );
		$tpl->set( 'notice', $notice );
		$tpl->set( 'reporttime', wfReportTime() );
		$tpl->execute();
		wfProfileOut( __METHOD__  . '-tpl' );

		wfProfileOut( __METHOD__ );
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
	 * @param string $className: valid class name
	 */
	private function addPageClass( $className ) {
		$this->pageClassNames[ $className ] = true;
	}

	/**
	 * Takes a title and returns classes to apply to the body tag
	 * @param $title Title
	 * @return String
	 */
	public function getPageClasses( $title ) {
		if ( $title->isMainPage() ) {
			$className = 'page-Main_Page ';
		} else if ( $title->isSpecialPage() ) {
			$className = 'mw-mf-special ';
		} else {
			$className = '';
		}
		return $className . implode( ' ', array_keys( $this->pageClassNames ) );
	}

	public function initPage( OutputPage $out ) {
		parent::initPage( $out );
		$ctx = MobileContext::singleton();
		if ( $ctx->isBetaGroupMember() ) {
			$out->addModuleStyles( 'mobile.styles.beta' );
		}
	}

	public function prepareData( BaseTemplate $tpl ) {
		parent::prepareData( $tpl );
		$context = MobileContext::singleton();
		$inBeta = $context->isBetaGroupMember();
		$menuHeaders = true;
		$search = $tpl->data['searchBox'];
		if ( $context->isAlphaGroupMember() ) {
			$search['placeholder'] = wfMessage( 'mobile-frontend-placeholder-alpha' )->escaped();
		} else if ( $inBeta ) {
			$search['placeholder'] = wfMessage( 'mobile-frontend-placeholder-beta' )->escaped();
		} else { // stable mode
			$menuHeaders = false;
		}
		$tpl->set( '_show_menu_headers', $menuHeaders );
		$tpl->set( 'searchBox', $search );

		if ( $inBeta ) {
			$this->prepareDataBeta( $tpl );
		}
	}

	/**
	 * Prepares data required by the mobile beta skin only. This runs after prepareData
	 * @param $tpl BaseTemplate
	 */
	protected function prepareDataBeta( BaseTemplate $tpl ) {
		$tpl->set( 'site_urls', array(
			array(
				'href' => Title::newFromText( 'About', NS_PROJECT )->getLocalUrl(),
				'text'=> $this->msg( 'mobile-frontend-main-menu-about' )->escaped(),
			),
			array(
				'href' => Title::newFromText( 'General_disclaimer', NS_PROJECT )->getLocalUrl(),
				'text'=> $this->msg( 'mobile-frontend-main-menu-disclaimer' )->escaped(),
			),
		) );

		// Reuse template data variable from SkinTemplate to construct page menu
		$menu = array();
		$actions = $tpl->data['content_navigation']['actions'];
		$namespaces = $tpl->data['content_navigation']['namespaces'];

		// empty placeholder for edit photos which both require js
		$menu['edit'] = array( 'id' => 'ca-edit', 'text' => '' );
		$menu['photo'] = array( 'id' => 'ca-upload', 'text' => '' );

		if ( isset( $namespaces['talk'] ) ) {
			$menu['talk'] = $namespaces['talk'];
			if ( isset( $tpl->data['_talkdata'] ) ) {
				$menu['talk']['text'] = $tpl->data['_talkdata']['text'];
				$menu['talk']['class'] = $tpl->data['_talkdata']['class'];
			}
		}

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
			$menu['watch']['class'] = 'cta';
		}

		$tpl->set( 'page_actions', $menu );

		$this->prepareUserButton( $tpl );
	}

	/**
	 * Prepares the user button.
	 * @param $tpl BaseTemplate
	 */
	protected function prepareUserButton( $tpl ) {
		if ( class_exists( 'MWEchoNotifUser' ) ) {
			$user = $this->getUser();
			// FIXME: cap higher counts
			$count = $user->isLoggedIn() ? MWEchoNotifUser::newFromUser( $user )->getNotificationCount() : 0;

			$tpl->set( 'userButton',
				Html::openElement( 'a', array(
					'title' => wfMessage( 'mobile-frontend-user-button-tooltip' ),
					'href' => SpecialPage::getTitleFor( 'Notifications' )->getLocalURL(),
					'id'=> 'user-button',
				) ) .
				Html::element( 'span', array( 'class' => $count ? '' : 'zero' ), $count ) .
				Html::closeElement( 'a' )
			);
		}
	}

	public function getSkinConfigVariables() {
		global $wgCookiePath;
		$ctx = MobileContext::singleton();
		$wgUseFormatCookie = array(
			'name' => $ctx->getUseFormatCookieName(),
			'duration' => -1, // in days
			'path' => $wgCookiePath,
			'domain' => $this->getRequest()->getHeader( 'Host' ),
		);
		$vars = parent::getSkinConfigVariables();
		$vars['wgUseFormatCookie'] = $wgUseFormatCookie;
		return $vars;
	}

	// FIXME: move addModuleStyles calls to initPage get should not have side effects
	public function getDefaultModules() {
		global $wgMFVaryResources;

		$ctx = MobileContext::singleton();
		$out = $this->getOutput();
		$inAlpha = $ctx->isAlphaGroupMember();
		$device = $ctx->getDevice();

		// add device specific css file - add separately to avoid cache fragmentation
		if ( $wgMFVaryResources ) {
			$out->addModuleStyles( 'mobile.xdevice.detect' );
		} elseif ( $device->moduleName() ) {
			$out->addModuleStyles( $device->moduleName() );
		}

		$modules = parent::getDefaultModules();
		$mode = 'stable';
		if ( $ctx->isBetaGroupMember() ) {
			$modules['beta'] = array( 'mobile.beta' );
			$mode = 'beta';
		}
		if ( $inAlpha ) {
			$modules['alpha'] = array( 'mobile.alpha' );
			$mode = 'alpha';
		}

		// main page special casing
		if ( $this->getTitle()->isMainPage() ) {
			if ( $inAlpha ) {
				$out->addModuleStyles( 'mobile.mainpage.styles' );
			} else {
				$modules['mainpage'] = array( 'mobile.mainpage.scripts' );
			}
		}

		// flush unnecessary modules
		$modules['content'] = array();
		$modules['legacy'] = array();

		wfRunHooks( 'EnableMobileModules', array( $out, $mode ) );
		return $modules;
	}

	protected function prepareTemplate() {
		global $wgAppleTouchIcon;

		wfProfileIn( __METHOD__ );
		$tpl = $this->setupTemplate( $this->template );
		$out = $this->getOutput();

		$tpl->setRef( 'skin', $this );
		$tpl->set( 'wgScript', wfScript() );

		$this->initPage( $this->getOutput() );
		$tpl->set( 'searchField', $this->getRequest()->getText( 'search', '' ) );
		$this->loggedin = $this->getUser()->isLoggedIn();
		$content_navigation = $this->buildContentNavigationUrls();
		$tpl->setRef( 'content_navigation', $content_navigation );
		$tpl->set( 'language_urls', $this->mobilizeUrls( $this->getLanguages() ) );

		// add head items
		if ( $wgAppleTouchIcon !== false ) {
			$out->addHeadItem( 'touchicon',
				Html::element( 'link', array( 'rel' => 'apple-touch-icon', 'href' => $wgAppleTouchIcon ) )
			);
		}
		$out->addHeadItem( 'canonical',
			Html::element( 'link', array( 'href' => $this->getTitle()->getCanonicalURL(), 'rel' => 'canonical' ) )
		);
		$out->addHeadItem( 'viewport',
			Html::element( 'meta', array( 'name' => 'viewport', 'content' => 'initial-scale=1.0, user-scalable=yes, minimum-scale=0.25, maximum-scale=1.6' ) )
		);
		// hide chrome on bookmarked sites
		$out->addHeadItem( 'apple-mobile-web-app-capable',
			Html::element( 'meta', array( 'name' => 'apple-mobile-web-app-capable', 'content' => 'yes' ) )
		);
		$out->addHeadItem( 'loadingscript', Html::inlineScript(
			"document.documentElement.className += ' page-loading';"
		) );

		$tpl->set( 'pagetitle', $out->getHTMLTitle() );

		$this->prepareTemplatePageContent( $tpl );
		$this->prepareDiscoveryTools( $tpl );
		$this->preparePersonalTools( $tpl );
		$this->prepareFooterLinks( $tpl );

		$out->setTarget( 'mobile' );

		$bottomScripts = Html::inlineScript(
			"document.documentElement.className = document.documentElement.className.replace( 'page-loading', '' );"
		);
		$bottomScripts .= $out->getBottomScripts();
		$tpl->set( 'bottomscripts', $bottomScripts );

		wfProfileOut( __METHOD__ );
		return $tpl;
	}

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
	 * Prepares urls and links used by the page
	 * @param QuickTemplate
	 */
	protected function preparePersonalTools( QuickTemplate $tpl ) {
		$returnToTitle = $this->getTitle()->getPrefixedText();
		$donateTitle = SpecialPage::getTitleFor( 'Uploads' );

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
				'href' => SpecialPage::getTitleFor( 'Watchlist' )->getLocalUrl( $watchlistQuery ),
				'class' => 'icon-watchlist jsonly',
			),
			'uploads' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-upload' )->escaped(),
				'href' => $this->getUser()->isLoggedIn() ? $donateTitle->getLocalUrl() :
					static::getLoginUrl( array( 'returnto' => $donateTitle ) ),
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
	 * Prepares links used in the footer
	 * @param QuickTemplate $tpl
	 */
	protected function prepareFooterLinks( $tpl ) {
		$req = $this->getRequest();

		$url = MobileContext::singleton()->getDesktopUrl( wfExpandUrl(
			$req->appendQuery( 'mobileaction=toggle_view_desktop' )
		) );
		if ( is_array( $this->hookOptions ) && isset( $this->hookOptions['toggle_view_desktop'] ) ) {
			$hookQuery = $this->hookOptions['toggle_view_desktop'];
			$url = $req->appendQuery( $hookQuery ) . urlencode( $url );
		}
		$url = htmlspecialchars( $url );

		$desktop = wfMessage( 'mobile-frontend-view-desktop' )->escaped();
		$mobile = wfMessage( 'mobile-frontend-view-mobile' )->escaped();

		$switcherHtml = <<<HTML
<h2>{$this->getSitename()}</h2>
<ul>
	<li>{$mobile}</li><li><a id="mw-mf-display-toggle" href="{$url}">{$desktop}</a></li>
</ul>
HTML;

		$licenseText = wfMessage( 'mobile-frontend-footer-license' )->parse();

		$tpl->set( 'mobile-switcher', $switcherHtml );
		$tpl->set( 'mobile-license', $licenseText );
		$tpl->set( 'privacy', $this->footerLink( 'mobile-frontend-privacy-link-text', 'privacypage' ) );
		$tpl->set( 'terms-use', wfMessage( 'mobile-frontend-terms-use-text' )->parse() );
	}

	/**
	 * Prepares a url to the Special:UserLogin with query parameters,
	 * taking into account $wgMFForceSecureLogin
	 * @param array $query
	 * @return string
	 */
	public static function getLoginUrl( $query ) {
		global $wgMFForceSecureLogin;

		if ( WebRequest::detectProtocol() != 'https' && $wgMFForceSecureLogin ) {
			$ctx = MobileContext::singleton();
			$loginUrl = SpecialPage::getTitleFor( 'Userlogin' )->getFullURL( $query );
			return $ctx->getMobileUrl( $loginUrl, $wgMFForceSecureLogin );
		}
		return SpecialPage::getTitleFor( 'Userlogin' )->getLocalURL( $query );
	}

	/**
	 * Prepares the header and the content of a page
	 * Stores in QuickTemplate prebodytext, postbodytext keys
	 * @param QuickTemplate
	 */
	function prepareTemplatePageContent( QuickTemplate $tpl ) {
		$title = $this->getTitle();
		$isSpecialPage = $title->isSpecialPage();
		$user = $this->getUser();
		$ctx = MobileContext::singleton();
		$inAlpha = $ctx->isAlphaGroupMember();

		$postBodyText = '';
		if ( !$isSpecialPage ) {

			// talk page link for logged in alpha users
			if ( $inAlpha && $user->isLoggedIn() && !$title->isTalkPage() ) {
				$talkTitle = $title->getTalkPage();
				if ( $talkTitle->getArticleID() ) {
					$dbr = wfGetDB( DB_SLAVE );
					$numTopics = $dbr->selectField( 'page_props', 'pp_value',
						array( 'pp_page' => $talkTitle->getArticleID(), 'pp_propname' => 'page_top_level_section_count' ),
						__METHOD__
					);
				} else {
					$numTopics = 0;
				}
				if ( $numTopics ) {
					$talkLabel = $this->getLanguage()->formatNum( $numTopics );
					$class = 'count';
				} else {
					$talkLabel = wfMessage( 'mobile-frontend-talk-overlay-header' );
					$class = '';
				}
				$tpl->set( '_talkdata', array( 'text' => $talkLabel, 'class' => $class ) );
			}

			// add last modified timestamp
			$revId = $this->getRevisionId();
			$timestamp = Revision::getTimestampFromId( $this->getTitle(), $revId );
			$lastModified = wfMessage( 'mobile-frontend-last-modified-date',
				$this->getLanguage()->userDate( $timestamp, $user ),
				$this->getLanguage()->userTime( $timestamp, $user )
			)->parse();
			$timestamp = wfTimestamp( TS_UNIX, $timestamp );
			$historyUrl = $inAlpha ? SpecialPage::getTitleFor( 'MobileDiff', $revId )->getLocalUrl() :
				$ctx->getMobileUrl( $title->getFullURL( 'action=history' ) );
			$postBodyText = Html::element( 'a', array(
				'id' => 'mw-mf-last-modified',
				'data-timestamp' => $timestamp,
				'href' => $historyUrl
			), $lastModified );
		}

		$tpl->set( 'postbodytext', $postBodyText );
	}

	/**
	 * Creates a login or logout button
	 * @return Array: Representation of button with text and href keys
	*/
	private function getLogInOutLink() {
		global $wgMFForceSecureLogin;
		wfProfileIn( __METHOD__ );
		$context = MobileContext::singleton();
		$query = array();
		if ( !$this->getRequest()->wasPosted() ) {
			$returntoquery = $this->getRequest()->getValues();
			unset( $returntoquery['title'] );
			unset( $returntoquery['returnto'] );
			unset( $returntoquery['returntoquery'] );
		}
		$query[ 'returnto' ] = $this->getTitle()->getPrefixedText();
		if ( $this->getUser()->isLoggedIn() ) {
			if ( !empty( $returntoquery ) ) {
				$query[ 'returntoquery' ] = wfArrayToCgi( $returntoquery );
			}
			$url = SpecialPage::getTitleFor( 'UserLogout' )->getFullURL( $query );
			$url = $context->getMobileUrl( $url, $wgMFForceSecureLogin );
			$text = wfMessage( 'mobile-frontend-main-menu-logout' )->escaped();
		} else {
			 // note returnto is not set for mobile (per product spec)
			$returntoquery[ 'welcome' ] = 'yes';
			$query[ 'returntoquery' ] = wfArrayToCgi( $returntoquery );
			$url = SpecialPage::getTitleFor( 'Userlogin' )->getFullURL( $query );
			$url = $context->getMobileUrl( $url, $wgMFForceSecureLogin );
			$text = wfMessage( 'mobile-frontend-main-menu-login' )->escaped();
		}
		wfProfileOut( __METHOD__ );
		return array(
			'text' => $text,
			'href' => $url,
			'class' => 'icon-loginout jsonly',
		);
	}

	/**
	 * Takes an array of link elements and applies mobile urls to any urls contained in them
	 * @param $urls Array
	 * @return Array
	 */
	public function mobilizeUrls( $urls ) {
		return array_map( function( $url ) {
				$ctx = MobileContext::singleton();
				$url['href'] = $ctx->getMobileUrl( $url['href'] );
				return $url;
			},
			$urls );
	}
}
