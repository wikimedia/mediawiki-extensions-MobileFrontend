<?php

// FIXME: This should be upstreamed to Echo extension after some design treatment for desktop version

class SpecialMobileNotifications extends SpecialNotifications {
	public function execute( $par ) {
		$out = $this->getOutput();
		$out->addModuleStyles( 'mobile.notifications.special.styles' );
		$title = $out->getRequest()->getText( 'returnto' );
		$title = Title::newFromText( $title );
		if ( $title ) {
			$out->addHtml(
				Html::openElement( 'p' ) .
				Html::element( 'a', array( 'href' => $title->getLocalUrl() ), wfMessage( 'returnto', $title->getText() ) ) .
				Html::closeElement( 'p' )
			);
		}
		parent::execute( $par );
		$out->addModules( 'mobile.notifications.special.scripts' );
	}

	/**
	 * Don't show this page on Special:SpecialPages
	 * @return false
	 */
	public function isListed() {
		return false;
	}
}
