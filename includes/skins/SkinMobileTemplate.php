<?php

class SkinMobileTemplate extends MinervaTemplate {
	public function getMode() {
		$context = MobileContext::singleton();
		if ( $context->isAlphaGroupMember() ) {
			return 'alpha';
		} else if ( $context->isBetaGroupMember() ) {
			return 'beta';
		} else {
			return 'stable';
		}
	}

	public function getSearchPlaceholderText() {
		$mode = $this->getMode();
		if ( $mode === 'alpha' ) {
			return wfMessage( 'mobile-frontend-placeholder-alpha' )->escaped();
		} else if ( $mode === 'beta' ) {
			return wfMessage( 'mobile-frontend-placeholder-beta' )->escaped();
		} else {
			return wfMessage( 'mobile-frontend-placeholder' )->escaped();
		}
	}

	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct();
	}

	public function prepareData() {
		global $wgExtensionAssetsPath;
		$data = $this->data;

		wfProfileIn( __METHOD__ );
		$this->setRef( 'wgExtensionAssetsPath', $wgExtensionAssetsPath );

		$this->set( 'bodytext', $data['bodytext'] );
		$this->set( 'bottomscripts', $data['bottomScripts'] );
		if ( isset( $data['specialPageHeader'] ) ) {
			$this->set( 'header', $data['specialPageHeader'] );
		}
		wfProfileOut( __METHOD__ );
	}

	public function getPersonalTools() {
		global $wgMFNearby;
		$data = $this->data;

		$items = array(
			'nearby' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-nearby' )->escaped(),
				'href' => $data['nearbyURL'],
				'class' => 'icon-nearby jsonly',
			),
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

		if ( $data['isBetaGroupMember'] && $wgMFNearby ) {
			$nav[] = $items['nearby'];
		}

		$nav[] = $items['watchlist'];
		$nav[] = $items['uploads'];

		$nav[] = $items['settings'];

		$nav[] = $items['auth'];
		return $nav;
	}

	public function getDiscoveryTools() {
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
		);

		return $items;
	}

	public function getUserActionTools() {
		return array();
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
