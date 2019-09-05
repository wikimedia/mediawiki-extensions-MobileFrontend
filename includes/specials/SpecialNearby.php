<?php

/**
 * Provide the Special page "Nearby" with location based articles
 */
class SpecialNearby extends MobileSpecialPage {
	/** @var boolean $hasDesktopVersion Does this special page has a desktop version? */
	protected $hasDesktopVersion = true;

	public function __construct() {
		parent::__construct( 'Nearby' );
		$this->listed = true;
	}

	/**
	 * Render Special Page Nearby
	 * @param string|null $par Parameter submitted as subpage
	 */
	public function executeWhenAvailable( $par = '' ) {
		$this->setHeaders();
		$output = $this->getOutput();
		$output->addBodyClasses( 'nearby-accept-pending' );
		// set config
		$output->addJsConfigVars( [
			'wgMFNearbyRange' => $this->config->get( 'MFNearbyRange' ),
		] );
		$output->addModuleStyles( [ 'mobile.placeholder.images' ] );
		$output->setPageTitle( $this->msg( 'mobile-frontend-nearby-title' ) );

		$html = Html::openElement( 'div', [ 'id' => 'mf-nearby-info-holder' ] )
				. Html::element( 'div', [
					'class' => 'mf-nearby-image-info'
				] )
				. Html::element( 'h3', [],
					$this->msg( 'mobile-frontend-nearby-info-heading' )->text() )
				. Html::element( 'div', [ 'class' => 'desc' ],
					$this->msg( 'mobile-frontend-nearby-info-description' )->text() )
				. Html::openElement( 'div', [ 'class' => 'jsonly' ] )
					. Html::element( 'button',
						[ 'id' => 'showArticles', 'disabled' => true, 'class' => 'mw-ui-button mw-ui-progressive' ],
						$this->msg( 'mobile-frontend-nearby-info-show-button' )->text()
					)
				. Html::closeElement( 'div' )
			. Html::closeElement( 'div' )

			. Html::openElement( 'div',
				[
					'class' => 'content-unstyled',
					'id' => 'mw-mf-nearby',
				]
			) .
			MobileUI::contentElement(
				Html::errorBox(
					Html::element( 'h2', [],
						$this->msg( 'mobile-frontend-nearby-requirements' )->text() ) .
					Html::element( 'p', [],
						$this->msg( 'mobile-frontend-nearby-requirements-guidance' )->text() )
				),
				'noscript'
			) .
			// #mw-mf-nearby
			Html::closeElement( 'div' );

		$output->addHTML( $html );
	}

	/**
	 * @return string
	 */
	protected function getGroupName() {
		return 'pages';
	}
}
