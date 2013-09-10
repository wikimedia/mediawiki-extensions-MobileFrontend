<?php

class SkinMobileWML extends SkinTemplate {
	public $skinname = 'SkinMobileWML';
	public $stylename = 'SkinMobileWML';
	public $template = 'MobileTemplateWML';

	public function __construct( IContextSource $context ) {
		$this->setContext( $context );
	}

	/**
	 * Overrides Skin::doEditSectionLink
	 */
	public function doEditSectionLink( Title $nt, $section, $tooltip = null, $lang = false ) {
		return '';
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

class MobileTemplateWML extends BaseTemplate {
	public function execute() {
		wfProfileIn( __METHOD__ );
		echo '<?xml version="1.0" encoding="utf-8" ?>';
		?><!DOCTYPE wml PUBLIC "-//WAPFORUM//DTD WML 1.3//EN"
		"http://www.wapforum.org/DTD/wml13.dtd">
	<wml xml:lang="<?php $this->text( 'code' ) ?>" dir="<?php $this->text( 'dir' ) ?>">
		<template>
			<do name="home" type="options" label="<?php $this->msg( 'mobile-frontend-home-button' ) ?>" >
				<go href="<?php $this->text( 'mainPageUrl' ) ?>"/>
			</do>
			<do name="random" type="options" label="<?php $this->msg( 'mobile-frontend-random-button' ) ?>">
				<go href="<?php $this->text( 'randomPageUrl' ) ?>"/>
			</do>
		</template>

		<?php echo $this->data['banner']; ?>

		<p><input emptyok="true" format="*M" type="text" name="search" value="" size="16" />
			<do type="accept" label="<?php $this->msg( 'mobile-frontend-search-submit' ) ?>">
				<go href="<?php $this->text( 'wgScript' ) ?>?title=Special%3ASearch&amp;search=<?php $this->text( 'searchField' ) ?>"></go></do>
		</p>
		<?php $this->html( 'bodytext' ) ?>
	</wml>
<?php
		wfProfileOut( __METHOD__ );
	}
}
