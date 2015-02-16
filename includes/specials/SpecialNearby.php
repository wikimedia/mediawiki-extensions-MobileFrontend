<?php
/**
 * SpecialNearby.php
 */

/**
 * Provide the Special page "Nearby" with location based articles
 */
class SpecialNearby extends MobileSpecialPage {
	/** @var boolean $hasDesktopVersion Does this special page has a desktop version? */
	protected $hasDesktopVersion = true;

	/**
	 * Construct function
	 */
	public function __construct() {
		parent::__construct( 'Nearby' );
		$this->listed = true;
	}

	/**
	 * Render Special Page Nearby
	 * @param string $par Parameter submitted as subpage
	 */
	public function executeWhenAvailable( $par = '' ) {
		$this->setHeaders();

		$output = $this->getOutput();

		// set config
		$output->addJsConfigVars( 'wgMFNearbyRange', $this->getMFConfig()->get( 'MFNearbyRange' ) );
		// Only the Minerva skin loads this module so make sure we load it for desktop
		$output->addModuleStyles( 'mobile.pagelist.styles' );

		$output->setPageTitle( wfMessage( 'mobile-frontend-nearby-title' )->escaped() );

		$html =
			Html::openElement( 'div',
				array(
					'id' => 'mw-mf-nearby',
				)
			) .
			Html::openElement( 'div',
				array(
					'class' => 'noscript errorbox',
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
