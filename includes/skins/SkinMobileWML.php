<?php

class SkinMobileWML extends SkinTemplate {
	public $skinname = 'SkinMobileWML';
	public $stylename = 'SkinMobileWML';
	public $template = 'MobileTemplateWML';

	public function __construct( IContextSource $context ) {
		$this->setContext( $context );
	}

	public function outputPage( OutputPage $out = null ) {
		wfProfileIn( __METHOD__ );
		if ( !$out ) {
			$out = $this->getOutput();
		}

		$options = null;
		wfRunHooks( 'BeforePageDisplayMobile', array( &$out, &$options ) );

		$out->getRequest()->response()->header( 'Content-Type: text/vnd.wap.wml' );
		$tpl = $this->setupTemplate( $this->template );
		$tpl->setRef( 'skin', $this );
		$lang = $this->getLanguage();
		$tpl->set( 'code', $lang->getCode() );
		$tpl->set( 'dir', $lang->isRTL() ? 'rtl' : 'ltr' );
		$tpl->set( 'mainPageUrl', Title::newMainPage()->getLocalUrl() );
		$tpl->set( 'randomPageUrl', SpecialPage::getTitleFor( 'Randompage' )->getLocalUrl() );
		$tpl->set( 'wgScript', wfScript() );
		$tpl->set( 'searchField', $this->getRequest()->getText( 'search', '' ) );
		$notice = '';
		wfRunHooks( 'GetMobileNotice', array( $this, &$notice ) );
		$tpl->set( 'banner', $notice );
		$html = ExtMobileFrontend::DOMParse( $out );
		$tpl->set( 'bodytext', $html );

		$tpl->execute();

		wfProfileOut( __METHOD__ );
	}
}
