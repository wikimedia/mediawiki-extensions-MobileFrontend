<?php

class SkinMobileBeta extends SkinMobile {
	public $template = 'MobileTemplateBeta';
	protected $mode = 'beta';

	protected function getSearchPlaceHolderText() {
		return wfMessage( 'mobile-frontend-placeholder-beta' )->text();
	}

	public function initPage( OutputPage $out ) {
		parent::initPage( $out );
		$out->addModuleStyles( 'mobile.styles.beta' );
	}

	public function getSkinConfigVariables() {
		$vars = parent::getSkinConfigVariables();
		// force cta on in beta
		$vars['wgMFEnablePhotoUploadCTA'] = true;
		return $vars;
	}

	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		$modules['beta'] = array( 'mobile.beta' );

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
