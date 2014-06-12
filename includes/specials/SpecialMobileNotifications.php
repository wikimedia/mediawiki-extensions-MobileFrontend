<?php
/**
 * SpecialMobileNotifications.php
 */

/**
 * Extends SpecialNotifications for a mobile-customized Notifications Special page
 * @todo This should be upstreamed to Echo extension after some design treatment
 * for desktop version
 */
class SpecialMobileNotifications extends SpecialNotifications {
	/**
	 * Reimplementation of SpecialNotifications:execute to add mobile specific stylesheet and Html
	 * @param string $par Parameter submitted as subpage
	 */
	public function execute( $par ) {
		$out = $this->getOutput();
		$out->addModuleStyles( 'mobile.special.notifications.styles' );
		$title = $out->getRequest()->getText( 'returnto' );
		$title = Title::newFromText( $title );
		if ( $title ) {
			$out->addHtml(
				Html::openElement( 'p' ) .
					Html::element( 'a', array( 'href' => $title->getLocalUrl() ),
						wfMessage( 'returnto', $title->getText() ) ) .
					Html::closeElement( 'p' )
			);
		}
		parent::execute( $par );
		$out->addModules( 'mobile.special.notifications.scripts' );
	}

	/**
	 * Don't show this page on Special:SpecialPages
	 * @return false
	 */
	public function isListed() {
		return false;
	}
}
