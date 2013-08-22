<?php

// FIXME: This should be upstreamed to Echo extension after some design treatment for desktop version

class SpecialMobileNotifications extends SpecialNotifications {
	public function execute( $par ) {
		$out = $this->getOutput();
		$title = $out->getRequest()->getText( 'returnto' );
		if ( $title ) {
			$title = Title::newFromText( $title );
			$out->addHtml(
				Html::openElement( 'p' ) .
				Html::element( 'a', array( 'href' => $title->getLocalUrl() ), wfMessage( 'returnto', $title->getText() ) ) .
				Html::closeElement( 'p' )
			);
		}
		parent::execute( $par );
	}
}
