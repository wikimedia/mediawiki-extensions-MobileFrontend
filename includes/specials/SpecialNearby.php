<?php

class SpecialNearby extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'Nearby' );
	}

	public function execute( $par = '' ) {
		$this->setHeaders();

		$output = $this->getOutput();
		$output->setPageTitle( wfMessage( 'mobile-frontend-nearby-title' )->escaped() );

		$context = MobileContext::singleton();
		// assumes mobile skin
		$mobileSkin = $context->getSkin();
		$mobileSkin->addArticleClass( 'noMargins' );

		$html =
			Html::openElement( 'div',
				array(
					'id' => 'mw-mf-nearby',
				)
			) .
			Html::element( 'div',
				array(
					'class' => 'noscript content',
				),
				wfMessage( 'mobile-frontend-nearby-requirements' )->escaped()
			) .
			Html::closeElement( 'div' );

		$output->addHTML( $html );
	}
}
