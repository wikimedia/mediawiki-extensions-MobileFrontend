<?php
// FIXME: kill the need for this file (SkinMinerva instead)
/**
 * SkinMobile: Extends Minerva with mobile specific code that constructs the footer and 'mobilizes' urls
 */

class SkinMobile extends SkinMinerva {
	public $skinname = 'mobile';
	public $template = 'MobileTemplate';

	protected $hookOptions;
	protected $customisations = array();

	public function __construct( IContextSource $context ) {
		parent::__construct();
		$this->setContext( $context );
		$this->addPageClass( 'mobile' );
	}

	public function setTemplateVariable( $key, $val ) {
		$this->customisations[$key] = $val;
	}

	private function applyCustomisations( $tpl ) {
		foreach( $this->customisations as $key => $value ) {
			$tpl->set( $key, $value );
		}
	}

	public function outputPage( OutputPage $out = null ) {
		global $wgMFNoindexPages;
		wfProfileIn( __METHOD__ );
		if ( !$out ) {
			$out = $this->getOutput();
		}
		if ( $out && $wgMFNoindexPages ) {
			$out->setRobotPolicy( 'noindex,nofollow' );
		}

		$options = null;
		if ( wfRunHooks( 'BeforePageDisplayMobile', array( &$out, &$options ) ) ) {
			if ( is_array( $options ) ) {
				$this->hookOptions = $options;
			}
		}
		parent::outputPage( $out );
	}

	public function getSkinConfigVariables() {
		global $wgCookiePath;
		$wgUseFormatCookie = array(
			'name' => MobileContext::USEFORMAT_COOKIE_NAME,
			'duration' => -1, // in days
			'path' => $wgCookiePath,
			'domain' => $this->getRequest()->getHeader( 'Host' ),
		);
		$vars = parent::getSkinConfigVariables();
		$vars['wgUseFormatCookie'] = $wgUseFormatCookie;
		return $vars;
	}

	public function getDefaultModules() {
		$out = $this->getOutput();
		$modules = parent::getDefaultModules();

		$this->addExternalModules( $out );
		// FIXME: This is duplicate code of that in MobileFrontend.hooks.php. Please apply hygiene.
		if ( class_exists( 'ResourceLoaderSchemaModule' ) ) {
			$modules['eventlogging'] = array(
				'mobile.uploads.schema',
				'mobile.watchlist.schema',
				'mobile.editing.schema',
				'schema.MobileWebCta',
				'schema.MobileWebClickTracking',
			);
		}
		return $modules;
	}

	private function addExternalModules( $out ) {
		wfRunHooks( 'EnableMobileModules', array( $out, $this->getMode() ) );
	}

	protected function prepareQuickTemplate( OutputPage $out = null ) {
		wfProfileIn( __METHOD__ );
		$out->setTarget( 'mobile' );
		$html = ExtMobileFrontend::DOMParse( $out );
		$tpl = parent::prepareQuickTemplate( $out );
		$tpl->set( 'bodytext', $html );
		$this->applyCustomisations( $tpl );
		$this->prepareFooterLinks( $tpl );
		wfProfileOut( __METHOD__ );
		return $tpl;
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
		global $wgRightsPage, $wgRightsUrl, $wgRightsText;

		$req = $this->getRequest();

		$url = $this->mobileContext->getDesktopUrl( wfExpandUrl(
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

		// Construct the link to the licensinsing terms
		if ( $wgRightsText ) {
			// Use shorter text for some common licensing strings. See Installer.i18n.php
			// for the currently offered strings. Unfortunately, there is no good way to
			// comprehensively support localized licensing strings since the license (as
			// stored in LocalSetttings.php) is just freeform text, not an i18n key.
			$licenses = array(
				'Creative Commons Attribution-Share Alike 3.0' => 'CC BY-SA 3.0',
				'Creative Commons Attribution Share Alike' => 'CC BY-SA',
				'Creative Commons Attribution' => 'CC BY',
				'Creative Commons Attribution Non-Commercial Share Alike' => 'CC BY-NC-SA',
				'Creative Commons Zero (Public Domain)' => 'CC0 (Public Domain)',
				'GNU Free Documentation License 1.3 or later' => 'GFDL 1.3 or later',
			);
			if ( isset( $licenses[$wgRightsText] ) ) {
				$wgRightsText = $licenses[$wgRightsText];
			}
			if ( $wgRightsPage ) {
				$title = Title::newFromText( $wgRightsPage );
				$link = Linker::linkKnown( $title, $wgRightsText );
			} elseif ( $wgRightsUrl ) {
				$link = Linker::makeExternalLink( $wgRightsUrl, $wgRightsText );
			} else {
				$link = $wgRightsText;
			}
		} else {
			$link = '';
		}
		// The license message is displayed in the content language rather than the user
		// language. See Skin::getCopyright.
		if ( $link ) {
			$licenseText = $this->msg( 'mobile-frontend-copyright' )->rawParams( $link )->inContentLanguage()->text();
		} else {
			$licenseText = '';
		}

		$tpl->set( 'mobile-switcher', $switcherHtml );
		$tpl->set( 'mobile-license', $licenseText );
		$tpl->set( 'privacy', $this->footerLink( 'mobile-frontend-privacy-link-text', 'privacypage' ) );
		$tpl->set( 'terms-use', $this->getTermsLink( 'mobile-frontend-terms-url' ) );
	}

	/**
	 * Returns HTML of terms of use link or null if it shouldn't be displayed
	 *
	 * @param $messageKey
	 *
	 * @return null|string
	 */
	public function getTermsLink( $messageKey ) {
		$urlMsg = $this->msg( $messageKey )->inContentLanguage();
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
	 * Prepares a url to the Special:UserLogin with query parameters,
	 * taking into account $wgSecureLogin
	 * @param array $query
	 * @return string
	 */
	public function getLoginUrl( $query ) {
		global $wgSecureLogin;

		if ( WebRequest::detectProtocol() != 'https' && $wgSecureLogin ) {
			$loginUrl = SpecialPage::getTitleFor( 'Userlogin' )->getFullURL( $query );
			return $this->mobileContext->getMobileUrl( $loginUrl, $wgSecureLogin );
		}
		return SpecialPage::getTitleFor( 'Userlogin' )->getLocalURL( $query );
	}

	/**
	 * Takes an array of link elements and applies mobile urls to any urls contained in them
	 * @param $urls Array
	 * @return Array
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
