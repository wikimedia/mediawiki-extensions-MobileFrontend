<?php

class SkinMobileBeta extends SkinMobile {
	public $template = 'MobileTemplateBeta';
	protected $mode = 'beta';

	public function outputPage( OutputPage $out = null ) {
		wfProfileIn( __METHOD__ );
		if ( !$out ) {
			$out = $this->getOutput();
		}
		# Replace page content before DOMParse to make sure images are scrubbed and Zero transformations are applied
		$this->handleNewPages( $out );
		parent::outputPage( $out );
	}

	protected function getSearchPlaceHolderText() {
		return wfMessage( 'mobile-frontend-placeholder-beta' )->text();
	}

	protected function getSkinStyles() {
		$styles = parent::getSkinStyles();
		$styles[] = 'mobile.styles.beta';
		return $styles;
	}

	protected function prepareQuickTemplate( OutputPage $out = null ) {
		$tpl = parent::prepareQuickTemplate( $out );
		// Move last modified link to top as long as it is not the main page
		$tpl->set( '_lastModifiedAbove', !$this->getTitle()->isMainPage() );
		return $tpl;
	}

	protected function getHistoryLink( Title $title ) {
		$link = parent::getHistoryLink( $title );
		if ( !$title->isMainPage() ) {
			$link['class'] = 'top-bar';
		}
		return $link;
	}

	public function getSkinConfigVariables() {
		$vars = parent::getSkinConfigVariables();
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
		$modules['notifications'] = array( 'mobile.notifications.beta' );
		$modules['beta'][] = 'mobile.geonotahack';
		$modules['search'] = array( 'mobile.search.beta' );
		$modules['issues'] = array( 'mobile.issues.beta' );
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

	protected function handleNewPages( OutputPage $out ) {
		# Show error message
		$title = $this->getTitle();
		if ( !$title->exists()
			&& !$title->isSpecialPage()
			&& $title->userCan( 'create', $this->getUser() )
		) {
			$out->clearHTML();
			$out->addHTML(
				Html::openElement( 'div', array( 'id' => 'mw-mf-newpage' ) )
				. wfMessage( 'mobile-frontend-editor-newpage-prompt' )->parse()
				. Html::closeElement( 'div' )
			);
		}
	}
}
