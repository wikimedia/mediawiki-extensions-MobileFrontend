<?php

class SpecialNearby extends MobileSpecialPage {
	public function __construct() {
		parent::__construct( 'Nearby' );
		$this->listed = true;
	}

	public function execute( $par = '' ) {
		global $wgMFNearbyRange;

		$this->setHeaders();

		$output = $this->getOutput();

		// set config
		$output->addJsConfigVars( 'wgMFNearbyRange', $wgMFNearbyRange );

		$skin = $this->getSkin();
		if ( method_exists( $skin, 'setTemplateVariable' ) ) {
			// remove the Echo button to make way for a refresh button
			$this->getSkin()->setTemplateVariable( 'secondaryButton', '' );
		}

		// add previews to mobile only
		$ctx = MobileContext::singleton();
		if ( $ctx->shouldDisplayMobileView() && $ctx->isBetaGroupMember() ) {
			$output->addModules( 'mobile.nearby.previews' );
		} else {
			// Only the Minerva skin loads this module so make sure we load it for desktop
			$output->addModuleStyles( 'mobile.pagelist.styles' );
		}

		$output->setPageTitle( wfMessage( 'mobile-frontend-nearby-title' )->escaped() );

		$html =
			Html::openElement( 'div',
				array(
					'id' => 'mw-mf-nearby',
				)
			) .
			Html::openElement( 'div',
				array(
					'class' => 'noscript error alert',
				)
			) .
			Html::openElement( 'div',
				array(
					'class' => 'content',
				)
			) .
			Html::element( 'h2', array(),
				wfMessage( 'mobile-frontend-nearby-requirements' ) ) .
			Html::element( 'p', array(),
				wfMessage( 'mobile-frontend-nearby-requirements-guidance' ) ) .
			Html::closeElement( 'div' ) . // .content
			Html::closeElement( 'div' ) . // .noscript
			Html::closeElement( 'div' ); // #mw-mf-nearby

		$output->addHTML( $html );
	}
}
