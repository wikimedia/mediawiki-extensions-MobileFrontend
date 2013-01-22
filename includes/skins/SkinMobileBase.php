<?php

abstract class SkinMobileBase extends SkinTemplate {
	/**
	 * @var ExtMobileFrontend
	 */
	protected $extMobileFrontend;
	protected $hookOptions;

	/** @var string html representing the header of the skin */
	private $mobileHtmlHeader = null;

	/** @var array of classes that should be present on the content_wrapper */
	private $articleClassNames = array();

	/**
	 * Provides alternative html for the header
	 * @return string html
	 */
	public function getHtmlHeader() {
		return $this->mobileHtmlHeader;
	}

	/**
	 * Provides alternative html for the header
	 * @param string html
	 */
	public function setHtmlHeader( $html ) {
		$this->mobileHtmlHeader = $html;
	}

	/**
	 * @param string $className: valid class name
	 */
	public function addArticleClass( $className ) {
		$this->articleClassNames[ $className ] = true;
	}

	/**
	 * @return string representing the class attribute of element
	 */
	public function getArticleClassString() {
		return implode( ' ', array_keys( $this->articleClassNames ) );
	}

	public static function factory( ExtMobileFrontend $extMobileFrontend ) {
		if ( MobileContext::singleton()->getContentFormat() == 'HTML' ) {
			$skinClass = 'SkinMobile';
		} else {
			$skinClass = 'SkinMobileWML';
		}
		return new $skinClass( $extMobileFrontend );
	}

	public function __construct( ExtMobileFrontend $extMobileFrontend ) {
		$this->setContext( $extMobileFrontend );
		$this->extMobileFrontend = $extMobileFrontend;
	}

	/**
	 * createDismissableBanner
	 *
	 * @param $id string: unique identification string for banner to distinguish it from other banners
	 * @param $content string: html string to put in banner
	 * @param $classNames string: additional classes that can be added to the banner. In particular used to target certain devices (e.g. android)
	 * @param $bannerStyle string: additional styling for banner
	 * @return string
	 */
	public function createDismissableBanner( $id, $content="", $classNames="", $bannerStyle="" ) {
		return <<<HTML
			<div class="mw-mf-banner {$classNames}" id="mw-mf-banner-{$id}"
				style="{$bannerStyle}">
			{$content}
			</div>
HTML;
	}

	public function outputPage( OutputPage $out = null ) {
		global $wgMFNoindexPages;
		wfProfileIn( __METHOD__ );
		$out = $this->getOutput();
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
		if ( $html !== false ) {
			wfProfileIn( __METHOD__  . '-tpl' );
			$tpl = $this->prepareTemplate();
			$tpl->set( 'bodytext', $html );
			$tpl->set( 'zeroRatedBanner', $this->extMobileFrontend->getZeroRatedBanner() );
			$notice = '';
			wfRunHooks( 'GetMobileNotice', array( $this, &$notice ) );
			$tpl->set( 'notice', $notice );
			$tpl->execute();
			wfProfileOut( __METHOD__  . '-tpl' );
		}
		wfProfileOut( __METHOD__ );
	}

	/**
	 * @return QuickTemplate
	 */
	protected function prepareTemplate() {
		wfProfileIn( __METHOD__ );
		$lang = $this->getLanguage();

		$tpl = $this->setupTemplate( $this->template );
		$tpl->setRef( 'skin', $this );
		$tpl->set( 'code', $lang->getHtmlCode() );
		$tpl->set( 'dir', $lang->getDir() );
		$tpl->set( 'scriptUrl', wfScript() );

		$url = MobileContext::singleton()->getDesktopUrl( wfExpandUrl(
			$this->getRequest()->appendQuery( 'mobileaction=toggle_view_desktop' )
		) );
		if ( is_array( $this->hookOptions ) && isset( $this->hookOptions['toggle_view_desktop'] ) ) {
			$hookQuery = $this->hookOptions['toggle_view_desktop'];
			$url = $this->getRequest()->appendQuery( $hookQuery ) . urlencode( $url );
		}
		$tpl->set( 'viewNormalSiteURL', $url );
		$tpl->set( 'mainPageUrl', Title::newMainPage()->getLocalUrl() );
		$tpl->set( 'randomPageUrl', SpecialPage::getTitleFor( 'Randompage' )->getLocalUrl() );
		$tpl->set( 'watchlistUrl', SpecialPage::getTitleFor( 'Watchlist' )->getLocalUrl() );
		$tpl->set( 'searchField', $this->getRequest()->getText( 'search', '' ) );
		$tpl->set( 'loggedin', $this->getUser()->isLoggedIn() );

		wfProfileOut( __METHOD__ );
		return $tpl;
	}
}
