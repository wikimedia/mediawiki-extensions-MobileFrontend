<?php

/**
 * Provides a list of citations available for a page
 */
class SpecialMobileCite extends MobileSpecialPage {

	public function __construct() {
		parent::__construct( 'MobileCite' );
	}

	/**
	 * Returns HTML body with cites for given revision.
	 *
	 * @param Title $title Revision title
	 * @param int $revId Revision id
	 * @return Message
	 */
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
		$data = $api->getResult()->getResultData( [ "mobileview", "sections" ], [
			'Strip' => 'all',
		] );
		$html = '';
		if ( $data !== null ) {
			foreach ( $data as $section ) {
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
	 *
	 * @param string $param The revision number
	 */
	public function executeWhenAvailable( $param ) {
		$this->setHeaders();
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
			$link = $this->getLinkRenderer()->makeLink(
				$title, $this->msg( 'mobile-frontend-return-to-page' )->text()
			);
			$out->addHTML(
				'<div class="pre-content mobile-cite-article-link-container">' .
				$link .
				'</div>' .
				$html
			);
		} else {
			$out->setPageTitle( $this->msg( 'mobile-frontend-cite-error-title' ) );
			$out->addHTML( Html::errorBox( $this->msg( 'mobile-frontend-cite-error' ) ) );
		}
	}
}
