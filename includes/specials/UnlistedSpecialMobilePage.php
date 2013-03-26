<?php
class UnlistedSpecialMobilePage extends UnlistedSpecialPage {

	public function __construct( $name, $restriction = '', $function = false, $file = 'default' ) {
		parent::__construct( $name, $restriction, false, $function, $file );
		$this->clearPageMargins();
	}

	public function clearPageMargins() {
		$ctx = MobileContext::singleton();
		// assumes mobile skin
		$mobileSkin = $ctx->getSkin();
		if ( $ctx->shouldDisplayMobileView() ) {
			$mobileSkin->addArticleClass( 'noMargins' );
		} // FIXME: do redirect ? Make page work on desktop?
	}
}
