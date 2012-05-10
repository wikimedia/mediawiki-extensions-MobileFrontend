<?php

abstract class SkinMobileBase extends SkinTemplate {
	/**
	 * @var ExtMobileFrontend
	 */
	protected $extMobileFrontend;
	protected $hookOptions;

	public static function factory( ExtMobileFrontend $extMobileFrontend ) {
		if ( $extMobileFrontend->getContentFormat() == 'HTML' ) {
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

	public function initPage( OutputPage $out ) {
		wfProfileIn( __METHOD__ );
		parent::initPage( $out );
		wfProfileOut( __METHOD__ );
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
			$tpl = $this->prepareTemplate( $out );
			$tpl->set( 'bodytext', $html );
			$tpl->set( 'zeroRatedBanner', $this->extMobileFrontend->getZeroRatedBanner() );
			$tpl->set( 'notice', $this->extMobileFrontend->getNotice() );
			$tpl->execute();
			wfProfileOut( __METHOD__  . '-tpl' );
		}
		wfProfileOut( __METHOD__ );
	}

	protected function prepareTemplate( OutputPage $out ) {
		wfProfileIn( __METHOD__ );
		$this->setContext( $out );
		$lang = $this->getLanguage();

		$tpl = $this->setupTemplate( $this->template );
		$tpl->setRef( 'skin', $this );
		$tpl->set( 'code', $lang->getHtmlCode() );
		$tpl->set( 'dir', $lang->getDir() );
		$tpl->set( 'scriptUrl', wfScript() );

		$url = $this->extMobileFrontend->getDesktopUrl( wfExpandUrl(
			$this->getRequest()->appendQuery( 'mobileaction=toggle_view_desktop' )
		) );
		if ( is_array( $this->hookOptions ) && isset( $this->hookOptions['toggle_view_desktop'] ) ) {
			$hookQuery = $this->hookOptions['toggle_view_desktop'];
			$url = $this->getRequest()->appendQuery( $hookQuery ) . urlencode( $url );
		}
		$tpl->set( 'viewNormalSiteURL', $url );
		$tpl->set( 'mainPageUrl', Title::newMainPage()->getLocalUrl() );
		$tpl->set( 'randomPageUrl', SpecialPage::getTitleFor( 'Randompage' )->getLocalUrl() );
		$tpl->set( 'searchField', $this->getRequest()->getText( 'search', '' ) );

		wfProfileOut( __METHOD__ );
		return $tpl;
	}
}
