<?php

class SkinMobile extends SkinMobileBase {
	public $template = 'SkinMobileTemplate';

	protected function prepareTemplate() {
		global $wgAppleTouchIcon;

		wfProfileIn( __METHOD__ );
		$tpl = parent::prepareTemplate();
		$out = $this->getOutput();
		$title = $this->getTitle();
		$user = $this->getUser();
		$tpl->set( 'title', $title );
		$tpl->set( 'user', $user );
		$context = MobileContext::singleton();
		$inBeta = $context->isBetaGroupMember();
		$inAlpha = $context->isAlphaGroupMember();

		$device = $context->getDevice();

		$tpl->set( 'action', $context->getRequest()->getText( 'action' ) );
		$tpl->set( 'isAlphaGroupMember', $inAlpha );
		$tpl->set( 'isBetaGroupMember', $inBeta );

		// add head items
		if ( $wgAppleTouchIcon !== false ) {
			$out->addHeadItem( 'touchicon',
				Html::element( 'link', array( 'rel' => 'apple-touch-icon', 'href' => $wgAppleTouchIcon ) )
			);
		}
		$out->addHeadItem( 'canonical',
			Html::element( 'link', array( 'href' => $title->getCanonicalURL(), 'rel' => 'canonical' ) )
		);
		$out->addHeadItem( 'viewport',
			Html::element( 'meta', array( 'name' => 'viewport', 'content' => 'initial-scale=1.0, user-scalable=yes' ) )
		);
		$out->addHeadItem( 'loadingscript', Html::inlineScript(
			"document.documentElement.className += ' page-loading';"
		) );

		$tpl->set( 'pagetitle', $out->getHTMLTitle() );

		$this->prepareTemplatePageContent( $tpl );
		$this->prepareTemplateLinks( $tpl );
		$this->prepareFooterLinks( $tpl );

		$tpl->set( 'isMainPage', $title->isMainPage() );

		wfProfileIn( __METHOD__ . '-modules' );

		wfProfileOut( __METHOD__ . '-modules' );

		// setup destinations for styles/scripts at top and at bottom
		$tpl = $this->attachResources( $title, $tpl, $device );

		$tpl->set( 'isSpecialPage', $title->isSpecialPage() );

		wfProfileOut( __METHOD__ );
		return $tpl;
	}


	/**
	 * Prepares urls and links used by the page
	 * @param QuickTemplate
	 */
	public function prepareTemplateLinks( QuickTemplate $tpl ) {
		$title = $this->getTitle();
		$returnToTitle = $title->getPrefixedText();

		$donateTitle = SpecialPage::getTitleFor( 'Uploads' );
		if ( $this->getUser()->isLoggedIn() ) {
			$donateUrl = $donateTitle->getLocalUrl();
		} else {
			$donateUrl = static::getLoginUrl( array( 'returnto' => $donateTitle ) );
		}

		$nearbyUrl = SpecialPage::getTitleFor( 'Nearby' )->getLocalURL();
		$settingsUrl = SpecialPage::getTitleFor( 'MobileOptions' )->
			getLocalUrl( array( 'returnto' => $returnToTitle ) );
		$link = $this->getLogInOutLink();

		// set urls
		$tpl->set( 'donateImageUrl', $donateUrl );
		$tpl->set( 'nearbyURL', $nearbyUrl );
		$tpl->set( 'settingsUrl', $settingsUrl );
		$tpl->set( 'loginLogoutText', $link['text'] );
		$tpl->set( 'loginLogoutUrl', $link['href'] );
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
			$loginUrl = SpecialPage::getTitleFor( 'UserLogin' )->getFullURL( $query );
			return $ctx->getMobileUrl( $loginUrl, $wgMFForceSecureLogin );
		}
		return SpecialPage::getTitleFor( 'UserLogin' )->getLocalURL( $query );
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
		$userLogin = $title->isSpecial( 'Userlogin' );
		$out = $this->getOutput();
		$ctx = MobileContext::singleton();
		$inAlpha = $ctx->isAlphaGroupMember();

		if ( $userLogin ) {
			$pageHeading = $this->getLoginPageHeading();
		} else {
			$pageHeading = $out->getPageTitle();
		}

		$preBodyText = '';
		$postBodyText = '';
		if ( !$isSpecialPage ) {
			$headingOptions = array();
			if ( $isMainPage ) {
				$pageHeading = $user->isLoggedIn() ?
					wfMessage( 'mobile-frontend-logged-in-homepage-notification', $user->getName() )->text() : '';
			} else {
				$headingOptions = array( 'id' => 'section_0' );
			}
			// prepend heading to articles
			if ( $pageHeading ) {
				$preBodyText = Html::rawElement( 'h1', $headingOptions, $pageHeading );
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
					} else {
						$talkLabel = wfMessage( 'mobile-frontend-talk-overlay-header' );
					}
					// @todo: Redlink support when we have good editing
					$preBodyText .= Html::element( 'a',
						array( 'href' => $talkTitle->getLocalURL(), 'id' => 'talk' ),
						$talkLabel );
				}
			}

			// add last modified timestamp
			$timestamp = Revision::getTimestampFromId( $this->getTitle(), $this->getRevisionId() );
			$lastModified = wfMessage( 'mobile-frontend-last-modified-date',
				$this->getLanguage()->userDate( $timestamp, $user ),
				$this->getLanguage()->userTime( $timestamp, $user )
			)->parse();
			$timestamp = wfTimestamp( TS_UNIX, $timestamp );
			$historyUrl = $ctx->getMobileUrl( wfExpandUrl( $this->getRequest()->appendQuery( 'action=history' ) ) );
			$postBodyText = Html::element( 'a', array(
				'id' => 'mw-mf-last-modified',
				'data-timestamp' => $timestamp,
				'href' => $historyUrl
			), $lastModified );
		}

		$htmlHeader = $this->getOutput()->getProperty( 'mobile.htmlHeader' );
		if ( $isSpecialPage ) {
			if ( !$htmlHeader ) {
				$htmlHeader = Html::element( 'h1', array(), $pageHeading );
			}
			$tpl->set( 'specialPageHeader', $htmlHeader );
		}

		$tpl->set( 'prebodytext', $preBodyText );
		$tpl->set( 'postbodytext', $postBodyText );
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

	protected function attachResources( Title $title, QuickTemplate $tpl, IDeviceProperties $device ) {
		global $wgMFVaryResources;

		$out = $this->getOutput();
		$out->setTarget( 'mobile' );

		$out->addModuleStyles( 'mobile.styles' );
		$this->enableModules();

		// add device specific css file - add separately to avoid cache fragmentation
		if ( $wgMFVaryResources ) {
			$out->addModuleStyles( 'mobile.xdevice.detect' );
		} elseif ( $device->moduleName() ) {
			$out->addModuleStyles( $device->moduleName() );
		}

		// FIXME: EditPage.php adds an inline script that breaks editing without this - dirty hack to get around bug 47296
		if ( in_array( 'mobile.action.edit', $out->getModules() ) ) {
			$bottomScripts = Html::inlineScript(
				'mw.loader.implement("mediawiki.action.edit", [],{},{});' .
				'mw.toolbar = { addButton: function(){}, init: function(){} };'
			);
		} else {
			 $bottomScripts = '';
		}
		$bottomScripts .= Html::inlineScript(
			"document.documentElement.className = document.documentElement.className.replace( 'page-loading', '' );"
		);
		$bottomScripts .= $out->getBottomScripts();

		$tpl->set( 'bottomScripts', $bottomScripts );
		return $tpl;
	}

	/**
	 * Enables RL modules for page
	 */
	public function enableModules() {
		$context = MobileContext::singleton();
		$inBeta = $context->isBetaGroupMember();
		$inAlpha = $context->isAlphaGroupMember();
		$out = $this->getOutput();
		$title = $this->getTitle();

		$out->addModules( 'mobile.site' );
		$out->addModules( 'mobile.stable' );
		$mode = 'stable';
		if ( $inBeta ) {
			$out->addModules( 'mobile.beta' );
			$mode = 'beta';
		} else {
			$out->addModules( 'mobile.toggling' );
		}
		if ( $inAlpha ) {
			$out->addModules( 'mobile.alpha' );
			$mode = 'alpha';
		}
		wfRunHooks( 'EnableMobileModules', array( $out, $mode ) );

		// modules based on context
		$isFilePage = $title->getNamespace() == NS_FILE;
		$action = $context->getRequest()->getText( 'action' );
		$isSpecialPage = $title->isSpecialPage();

		// specific to current context
		if ( $isFilePage ) {
			$out->addModules( 'mobile.file.scripts' );
			$out->addModuleStyles( 'mobile.file.styles' );
		}

		if ( !$isSpecialPage ) {
			$out->addModuleStyles( 'mobile.styles.page' );
		}

		if ( $title->isMainPage() ) {
			if ( $context->isAlphaGroupMember() ) {
				$out->addModuleStyles( 'mobile.mainpage.styles' );
			} else {
				$out->addModules( 'mobile.mainpage.scripts' );
			}
		}

		if ( $action === 'edit' ) {
			$out->addModules( 'mobile.action.edit' );
		} else if ( $action === 'history' ) {
			$out->addModules( 'mobile.action.history' );
		}
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
			$url = SpecialPage::getTitleFor( 'UserLogin' )->getFullURL( $query );
			$url = $context->getMobileUrl( $url, $wgMFForceSecureLogin );
			$text = wfMessage( 'mobile-frontend-main-menu-login' )->escaped();
		}
		wfProfileOut( __METHOD__ );
		return array(
			'text' => $text,
			'href' => $url,
		);
	}
}
