<?php

class SkinMobileBase extends SkinMinerva {
	/**
	 * @var ExtMobileFrontend
	 */
	protected $extMobileFrontend;
	protected $hookOptions;

	/** @var array of classes that should be present on the body tag */
	private $pageClassNames = array();

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
			$tpl->set( 'headelement', $out->headElement( $this ) );
			$tpl->set( 'bodytext', $html );
			$tpl->set( 'zeroRatedBanner', $this->extMobileFrontend->getZeroRatedBanner() );
			$notice = '';
			wfRunHooks( 'GetMobileNotice', array( $this, &$notice ) );
			$tpl->set( 'notice', $notice );
			$tpl->set( 'reporttime', wfReportTime() );
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
		$ctx = MobileContext::singleton();
		$req = $this->getRequest();

		$tpl = $this->setupTemplate( $this->template );
		$tpl->setRef( 'skin', $this );
		$tpl->set( 'wgScript', wfScript() );

		$this->initPage( $this->getOutput() );
		// user specific configurations
		$user = $this->getUser();
		$watchlistQuery = array();
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

		$tpl->set( 'mainPageUrl', Title::newMainPage()->getLocalUrl() );
		$tpl->set( 'randomPageUrl', SpecialPage::getTitleFor( 'Randompage' )->getLocalUrl() );
		$tpl->set( 'watchlistUrl', SpecialPage::getTitleFor( 'Watchlist' )->getLocalUrl( $watchlistQuery ) );
		$tpl->set( 'searchField', $this->getRequest()->getText( 'search', '' ) );
		$tpl->set( 'loggedin', $this->getUser()->isLoggedIn() );
		$this->loggedin = $this->getUser()->isLoggedIn();
		$content_navigation = $this->buildContentNavigationUrls();
		$tpl->setRef( 'content_navigation', $content_navigation );
		$tpl->set( 'language_urls', $this->mobilizeUrls( $this->getLanguages() ) );

		wfProfileOut( __METHOD__ );
		return $tpl;
	}

	/**
	 * Takes an array of link elements and applies mobile urls to any urls contained in them
	 * @param $urls Array
	 * @return Array
	 */
	public function mobilizeUrls( $urls ) {
		function fn( $url ) {
			$ctx = MobileContext::singleton();
			$url['href'] = $ctx->getMobileUrl( $url['href'] );
			return $url;
		}
		return array_map( 'fn', $urls );
	}
}
