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
		$mobileSkin->setHtmlHeader( $this->getHeader() );

		$this->setHeaders();
		$output = $this->getOutput();
		$output->htmlClass = 'galleryPage';
		$output->setPageTitle( $this->msg( 'mobile-frontend-donate-image-title' ) );

		if( $user->isAnon() ) {
			$html = Html::openElement( 'div', array( 'class' => 'alert error' ) ) .
				$this->msg( 'mobile-frontend-donate-image-anon' )->parse() .
				Html::closeElement( 'div' );
		} else {
			$html = Html::element( 'ul', array( 'class' => 'mobileUserGallery' ) );
		}
		$output->addHTML( $html );
	}

	public function getHeader() {
		$mobileSkin = $this->getContext()->getSkin();

		return Html::openElement( 'div', array( 'class' => 'header' ) ) .
			$mobileSkin->getMenuButton() .
			Html::element( 'h1', array(),
				$this->msg( 'mobile-frontend-donate-image-page-title' )->plain() ) .
			Html::closeElement( 'div' );
	}
}
