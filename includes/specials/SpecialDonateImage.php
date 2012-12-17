<?php

class SpecialDonateImage extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'DonateImage' );
	}

	public function execute( $par = '' ) {
		$this->setHeaders();
		$output = $this->getOutput();
		$output->htmlClass = 'galleryPage';
		$output->setPageTitle( wfMessage( 'mobile-frontend-donate-image-title' )->text() );

		$context = MobileContext::singleton();
		$html =
			Html::element( 'div',
				array( 'id' => 'content_0' ),
				wfMessage( 'mobile-frontend-donate-image-summary' )->text() ) .
			Html::element( 'h2', array(),
				wfMessage( 'mobile-frontend-donate-image-heading' )->text() ) .
			Html::element( 'ul', array( "class" => 'mobileUserGallery' ) );
		$output->addHTML( $html );
	}
}
