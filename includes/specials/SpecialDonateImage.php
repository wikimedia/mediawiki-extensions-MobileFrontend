<?php

class SpecialDonateImage extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'DonateImage' );
	}

	public function execute( $par = '' ) {
		$ctx = MobileContext::singleton();
		$user = $this->getUser();

		$ctx->setOverlay( false );
		$mobileSkin = $ctx->getSkin();
		if ( method_exists( $mobileSkin, 'setHtmlHeader' ) ) {
			$mobileSkin->setHtmlHeader( $this->getHeader( $mobileSkin ) );
		}

		$this->setHeaders();
		$output = $this->getOutput();
		$output->htmlClass = 'galleryPage';
		$output->setPageTitle( wfMessage( 'mobile-frontend-donate-image-title' )->text() );

		if( $user->isAnon() ) {
			$html = Html::openElement( 'div', array( 'class' => 'alert error' ) ) .
				wfMessage( 'mobile-frontend-donate-image-anon' )->parse() .
				Html::closeElement( 'div' );
		} else {
			$html = Html::element( 'ul', array( 'class' => 'mobileUserGallery' ) );
		}
		$output->addHTML( $html );
	}

	public function getHeader( $mobileSkin ) {

		return Html::openElement( 'div', array( 'class' => 'header' ) ) .
			$mobileSkin->getMenuButton() .
			Html::element( 'h1', array(),
				wfMessage( 'mobile-frontend-donate-image-page-title' )->plain() ) .
			Html::closeElement( 'div' );
	}
}
