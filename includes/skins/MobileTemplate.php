<?php

class MobileTemplate extends MinervaTemplate {
	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct();
	}

	public function getDiscoveryTools() {
		return $this->data['discovery_urls'];
	}

	public function getPersonalTools() {
		return $this->data['personal_urls'];
	}

	/**
	 * Returns an array of footerlinks trimmed down to only those footer links that
	 * are valid.
	 * @param $option currently unused in mobile
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
