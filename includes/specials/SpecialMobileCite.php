<?php
/**
 * SpecialMobileCite.php
 */

/**
 * Provides a list of citiations available for a page
 */
class SpecialMobileCite extends MobileSpecialPage {
	/** @var string $mode Saves the actual mode used by user (stable|beta) */
	protected $mode = 'beta';

	/**
	 * Construct function
	 */
	public function __construct() {
		parent::__construct( 'MobileCite' );
	}

	protected function getReferenceBodyHtml( Title $title, $revId ) {
		$api = new ApiMain(
			new DerivativeRequest(
				$this->getRequest(),
				[
					'action' => 'mobileview',
					'page' => $title->getPrefixedText(),
					'revision' => $revId,
					'prop' => 'text',
					'sections' => 'references',
				]
			)
		);
		$api->execute();
		$data = $api->getResult()->getData();
		$html = '';
		if ( isset( $data["mobileview"]["sections"] ) ) {
			foreach ( $data["mobileview"]["sections"] as $section ) {
				$html .= $section['*'];
			}
		}
		if ( !$html ) {
			$html = $this->msg( 'mobile-frontend-cite-none-available' );
		}
		return $html;
	}

	/**
	 * Render the page with a list of references for the given revision identifier
	 * @param string $pagename The revision number
	 */
	public function executeWhenAvailable( $param ) {
		$out = $this->getOutput();
		$revision = null;
		if ( $param ) {
			$args = explode( '/', $param );
			if ( ctype_digit( $args[0] ) ) {
				$revId = intval( $args[0] );
				$revision = Revision::newFromId( $revId );
			}
		}

		if ( $revision ) {
			$title = $revision->getTitle();
			$html = $this->getReferenceBodyHtml( $title, $revId );
			$html = MobileUI::contentElement( $html );
			$out->setPageTitle( $title->getText() );
			$out->addHTML( $html );
		} else {
			$out->setPageTitle( $this->msg( 'mobile-frontend-cite-error-title' ) );
			$out->addHTML( MobileUI::errorBox( $this->msg( 'mobile-frontend-cite-error' ) ) );
		}
	}
}
