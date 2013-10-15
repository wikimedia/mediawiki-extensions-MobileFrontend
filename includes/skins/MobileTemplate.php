<?php
// FIXME: kill the need for this file (MinervaTemplate instead)
/**
 * MobileTemplate: 
 * Extends MinervaTemplate with mobile specific functionality
 */
class MobileTemplate extends MinervaTemplate {
	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct();
	}

	/**
	 * Returns an array of footerlinks trimmed down to only those footer links that
	 * are valid.
	 * @param null $option: Currently unused in mobile
	 * @return array|mixed
	 */
	public function getFooterLinks( $option = null ) {
		return array(
			'info' => array(
				'mobile-switcher',
				'mobile-license',
			),
			'places' => array(
				'terms-use',
				'privacy',
			),
		);
	}
}
