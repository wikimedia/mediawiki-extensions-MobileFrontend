<?php

/**
 * Minerva: Born from the godhead of Jupiter with weapons!
 * A skin that works on both desktop and mobile
 * @ingroup Skins
 */
class SkinMinerva extends SkinTemplate {
	public $skinname = 'minerva';
	public $template = 'MinervaTemplate';
	public $useHeadElement = true;

	/**
	 * Initializes output page and sets up skin-specific parameters
	 * @param $out OutputPage object to initialize
	 */
	public function initPage( OutputPage $out ) {
		parent::initPage( $out );
		// add styling
		$out->addModuleStyles( 'mobile.styles' );

		$out->addJsConfigVars( $this->getSkinConfigVariables() );
	}

	public function prepareData( BaseTemplate $tpl ) {
		global $wgMFEnableSiteNotice;
		$title = $this->getTitle();
		$user = $this->getUser();
		$out = $this->getOutput();
		if ( $title->isMainPage() ) {
			$out->setPageTitle( $user->isLoggedIn() ?
				wfMessage( 'mobile-frontend-logged-in-homepage-notification', $user->getName() )->text() : '' );
		}
		$pageHeading = $out->getPageTitle();

		$htmlHeader = $out->getProperty( 'mobile.htmlHeader' );
		if ( $title->isSpecialPage() ) {
			if ( !$htmlHeader ) {
				$htmlHeader = Html::element( 'h1', array(), $pageHeading );
			}
			$tpl->set( 'specialPageHeader', $htmlHeader );
		} else {
			$preBodyText = Html::rawElement( 'h1', array( 'id' => 'section_0' ), $pageHeading );
			$tpl->set( 'prebodytext', $preBodyText );
		}

		// set defaults
		if ( !isset( $tpl->data['postbodytext'] ) ) {
			$tpl->set( 'postbodytext', '' ); // not currently set in desktop skin
		}

		$searchBox = array(
			'id' => 'searchInput',
			'class' => 'search',
			'autocomplete' => 'off',
			// The placeholder gets fed to HTML::element later which escapes all
			// attribute values, so no need to escape the string here.
			'placeholder' =>  wfMessage( 'mobile-frontend-placeholder' )->text(),
		);
		$tpl->set( 'searchBox', $searchBox );

		// menu button
		$url = SpecialPage::getTitleFor( 'MobileMenu' )->getLocalUrl() . '#mw-mf-page-left';
		$tpl->set( 'menuButton',
			Html::element( 'a', array(
			'title' => wfMessage( 'mobile-frontend-main-menu-button-tooltip' ),
			'href' => $url,
			'id'=> 'mw-mf-main-menu-button',
			) )
		);
		$tpl->set( 'userButton', '<ul id="mw-mf-menu-page"></ul>' );

		$banners = array();
		if ( isset( $tpl->data['notice'] ) ) {
			$banners[] = $tpl->data['notice'];
		}
		if ( $wgMFEnableSiteNotice ) {
			$banners[] = '<div id="siteNotice"></div>';
		}
		$tpl->set( 'banners', $banners );
		// site_urls is used on beta only
		$tpl->set( 'site_urls', array() );
		$tpl->set( 'page_actions', array() );
	}

	/**
	 * Returns array of config variables that should be added only to this skin
	 * for use in JavaScript.
	 * @return Array
	 */
	public function getSkinConfigVariables() {
		global $wgMFLeadPhotoUploadCssSelector, $wgMFEnableCssAnimations,
			$wgMFUseCentralAuthToken,
			$wgMFAnonymousEditing, $wgMFEnablePhotoUploadCTA,
			$wgMFPhotoUploadEndpoint, $wgMFPhotoUploadAppendToDesc;

		$title = $this->getTitle();
		$user = $this->getUser();
		$userCanCreatePage = !$title->exists() && $title->quickUserCan( 'create', $user );

		$vars = array(
			'wgMFUseCentralAuthToken' => $wgMFUseCentralAuthToken,
			'wgMFAnonymousEditing' => $wgMFAnonymousEditing,
			'wgMFEnablePhotoUploadCTA' => $wgMFEnablePhotoUploadCTA,
			'wgMFPhotoUploadAppendToDesc' => $wgMFPhotoUploadAppendToDesc,
			'wgMFLeadPhotoUploadCssSelector' => $wgMFLeadPhotoUploadCssSelector,
			'wgMFEnableCssAnimations' => $wgMFEnableCssAnimations,
			'wgMFPhotoUploadEndpoint' => $wgMFPhotoUploadEndpoint ? $wgMFPhotoUploadEndpoint : '',
			'wgPreferredVariant' => $title->getPageLanguage()->getPreferredVariant(),
			'wgIsPageEditable' => $title->quickUserCan( 'edit', $user ) || $userCanCreatePage,
		);
		if ( !$user->isAnon() ) {
			$vars['wgWatchedPageCache'] = array(
				$title->getText() => $user->isWatched( $title ),
			);
		}
		$ctx = MobileContext::singleton();
		// mobile specific config variables
		if ( $ctx->shouldDisplayMobileView() ) {
			$vars['wgImagesDisabled'] = $ctx->imagesDisabled();
		}
		return $vars;
	}

	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		$out = $this->getOutput();

		$modules['mobile'] = array(
			'mobile.startup',
			'mobile.site',
			// FIXME: separate mobile.stable into more meaningful groupings
			'mobile.stable',
		);

		$modules['watch'] = array();
		$modules['search'] = array();

		$title = $this->getTitle();
		// modules based on context
		$action = $this->getContext()->getRequest()->getText( 'action' );

		// specific to current context
		if ( $title->inNamespace( NS_FILE ) ) {
			$modules['file'] = array( 'mobile.file.scripts' );
			$out->addModuleStyles( 'mobile.file.styles' );
		}

		if ( !$title->isSpecialPage() ) {
			$out->addModuleStyles( 'mobile.styles.page' );
		}

		if ( $action === 'history' ) {
			$out->addModuleStyles( 'mobile.action.history' );
		}
		$out->addModuleStyles( 'mobile.styles' );
		return $modules;
	}

	/**
	 * This will be called by OutputPage::headElement when it is creating the
	 * "<body>" tag, - adds output property bodyClassName to the existing classes
	 * @param $out OutputPage
	 * @param $bodyAttrs Array
	 */
	public function addToBodyAttributes( $out, &$bodyAttrs ) {
		// does nothing by default
		$classes = $out->getProperty( 'bodyClassName' );
		$bodyAttrs[ 'class' ] .= ' ' . $classes;
	}

	/**
	 * @param $out OutputPage
	 */
	public function setupSkinUserCss( OutputPage $out ) {
		parent::setupSkinUserCss( $out );
		// Add the ResourceLoader module to the page output
		$styles = array(
			'mobile.styles',
			'mobile.styles.page',
		);
		$out->addModuleStyles( $styles );
	}

	/**
	 * Determines what the heading of the login page should be based on the context
	 * @return string
	 */
	protected function getLoginPageHeading() {
		if ( $this->getRequest()->getVal( 'type' ) == 'signup' ) {
			$key = 'mobile-frontend-sign-up-heading';
		} else {
			$key = 'mobile-frontend-sign-in-heading';
		}
		return wfMessage( $key )->plain();
	}
}
