<?php
class UnlistedSpecialMobilePage extends UnlistedSpecialPage {

	public function __construct( $name, $restriction = '', $function = false, $file = 'default' ) {
		parent::__construct( $name, $restriction, false, $function, $file );
		$this->clearPageMargins();
	}

	public function clearPageMargins() {
		$ctx = MobileContext::singleton();
		$this->getOutput()->setProperty( 'bodyClassName', 'no-margins' );
	}
}
