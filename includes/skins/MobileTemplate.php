<?php

class MobileTemplate extends MinervaTemplate {
	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct();
	}

	public function getPersonalTools() {
		$data = $this->data;

		$items = array(
			'watchlist' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-watchlist' )->escaped(),
				'href' => $data['watchlistUrl'],
				'class' => 'icon-watchlist jsonly',
			),
			'uploads' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-upload' )->escaped(),
				'href' => $data['donateImageUrl'],
				'class' => 'icon-uploads jsonly',
			),
			'settings' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-settings' )->escaped(),
				'href' => $data['settingsUrl'],
				'class' => 'icon-settings',
			),
			'auth' => array(
				'text' => $data['loginLogoutText'],
				'href' => $data['loginLogoutUrl'],
				'class' => 'icon-loginout jsonly',
			),
		);

		$nav = array();

		$nav[] = $items['watchlist'];
		$nav[] = $items['uploads'];

		$nav[] = $items['settings'];

		$nav[] = $items['auth'];
		return $nav;
	}

	public function getDiscoveryTools() {
		global $wgMFNearby;
		$data = $this->data;
		$items = array(
			'home' => array(
				'text' => wfMessage( 'mobile-frontend-home-button' )->escaped(),
				'href' => $data['mainPageUrl'],
				'class' => 'icon-home',
			),
			'random' => array(
				'text' => wfMessage( 'mobile-frontend-random-button' )->escaped(),
				'href' => $data['randomPageUrl'],
				'class' => 'icon-random',
				'id' => 'randomButton',
			),
			'nearby' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-nearby' )->escaped(),
				'href' => $data['nearbyURL'],
				'class' => 'icon-nearby jsonly',
			),
		);
		if ( !$wgMFNearby ) {
			unset( $items['nearby'] );
		}

		return $items;
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
