<?php

class SkinMobileWML extends SkinMobileBase {
	public $skinname = 'SkinMobileWML';
	public $stylename = 'SkinMobileWML';
	public $template = 'SkinMobileTemplateWML';

	protected function prepareTemplate( OutputPage $out ) {
		$out->getRequest()->response()->header( 'Content-Type: text/vnd.wap.wml' );
		return parent::prepareTemplate( $out );
	}
}

class SkinMobileTemplateWML extends BaseTemplate {
	public function execute() {
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
		<p><input emptyok="true" format="*M" type="text" name="search" value="" size="16" />
			<do type="accept" label="<?php $this->msg( 'mobile-frontend-search-submit' ) ?>">
				<go href="<?php $this->text( 'scriptUrl' ) ?>?title=Special%3ASearch&amp;search=<?php $this->text( 'searchField' ) ?>"></go></do>
		</p>
		<?php $this->html( 'bodytext' ) ?>
	</wml>
	<?php
	}
}