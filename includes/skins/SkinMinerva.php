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
		$modules = array(
			'mobile.startup',
			'mobile.stable.universal',
		);
		$out->addModules( $modules );
		$out->addJsConfigVars( $this->getSkinConfigVariables() );
	}

	/**
	 * Returns array of config variables that should be added only to this skin for use in javascript
	 * @return Array
	 */
	public function getSkinConfigVariables() {
		global $wgMFLeadPhotoUploadCssSelector, $wgMFEnableCssAnimations,
			$wgMFAnonymousEditing, $wgMFEnablePhotoUploadCTA,
			$wgMFPhotoUploadEndpoint, $wgMFPhotoUploadAppendToDesc;

		return array(
			'wgMFAnonymousEditing' => $wgMFAnonymousEditing,
			'wgMFEnablePhotoUploadCTA' => $wgMFEnablePhotoUploadCTA,
			'wgMFPhotoUploadAppendToDesc' => $wgMFPhotoUploadAppendToDesc,
			'wgMFLeadPhotoUploadCssSelector' => $wgMFLeadPhotoUploadCssSelector,
			'wgMFEnableCssAnimations' => $wgMFEnableCssAnimations,
			'wgMFPhotoUploadEndpoint' => $wgMFPhotoUploadEndpoint ? $wgMFPhotoUploadEndpoint : '',
		);
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
}
