<?php

class SkinMobileBeta extends SkinMobile {
	public $template = 'MobileTemplateBeta';
	protected $mode = 'beta';

	protected function getSearchPlaceHolderText() {
		return wfMessage( 'mobile-frontend-placeholder-beta' )->text();
	}

	protected function getSkinStyles() {
		$styles = parent::getSkinStyles();
		$styles[] = 'mobile.styles.beta';
		return $styles;
	}

	public function prepareData( BaseTemplate $tpl ) {
		parent::prepareData( $tpl );
		// Move last modified link to top as long as it is not the main page
		$tpl->set( '_lastModifiedAbove', !$this->getTitle()->isMainPage() );
	}

	protected function getHistoryLink( Title $title ) {
		$link = parent::getHistoryLink( $title );
		$link['class'] = 'top-bar';
		return $link;
	}

	public function getSkinConfigVariables() {
		$vars = parent::getSkinConfigVariables();
		// force cta on in beta
		$vars['wgMFEnablePhotoUploadCTA'] = true;
		// Kill this when we fix the functionality in PageApi.js
		$user = $this->getUser();
		if ( $user->isLoggedIn() ) {
			$vars['wgMFUserGender'] = $this->getUser()->getOption( 'gender' );
		} else {
			$vars['wgMFUserGender'] = 'unknown';
		}
		return $vars;
	}

	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		$modules['beta'] = array( 'mobile.beta' );
		if ( $this->getUser()->isLoggedIn() ) {
			$modules['beta'][] = 'mobile.notifications.overlay';
		}
		$modules['beta'][] = 'mobile.geonotahack';
		// turn off stable only modules
		$modules['stableonly'] = array();
		return $modules;
	}

	/**
	 * Creates a login or logout button
	 * @return Array: Representation of button with text and href keys
	*/
	protected function getLogInOutLink() {
		$loginLogoutLink = parent::getLoginOutLink();
		$user = $this->getUser();
		if ( $user->isLoggedIn() ) {
			$loginLogoutLink['class'] = 'icon-secondary icon-secondary-logout';
			$name = $user->getName();
			$loginLogoutLink = array(
				'links' => array(
					array(
						'text' => $name,
						'href' => SpecialPage::getTitleFor( 'UserProfile', $name )->getLocalUrl(),
						'class' => 'icon-profile',
					),
					$loginLogoutLink
				),
			);
			$loginLogoutLink['class'] = 'icon-user';
		} else {
			$loginLogoutLink['class'] = 'icon-anon';
		}
		return $loginLogoutLink;
	}

}
