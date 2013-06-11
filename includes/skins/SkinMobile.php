<?php

class SkinMobile extends SkinMobileBase {
	public $template = 'MobileTemplate';

	public function initPage( OutputPage $out ) {
		parent::initPage( $out );
		$ctx = MobileContext::singleton();
		if ( $ctx->isBetaGroupMember() ) {
			$out->addModuleStyles( 'mobile.styles.beta' );
		}
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
		$tpl = parent::prepareTemplate();
		$out = $this->getOutput();

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

		if ( is_array( $wgMFCustomLogos ) && isset( $wgMFCustomLogos['copyright'] ) ) {
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
	 * @param QuickTemplate
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
		$isMainPage = $title->isMainPage();
		$user = $this->getUser();
		$out = $this->getOutput();
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
}
