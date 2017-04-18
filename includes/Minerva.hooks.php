<?php
/**
 * Minerva.hooks.php
 */

/**
 * Hook handlers for Minerva skin.
 * Hooks specific to all skins running in mobile mode should belong in
 * MobileFrontend.hooks.php
 *
 * Hook handler method names should be in the form of:
 *	on<HookName>()
 */
class MinervaHooks {
	/**
	 * Invocation of hook SpecialPageBeforeExecute
	 *
	 * We use this hook to ensure that login/account creation pages
	 * are redirected to HTTPS if they are not accessed via HTTPS and
	 * $wgSecureLogin == true - but only when using the
	 * mobile site.
	 *
	 * @param SpecialPage $special
	 * @param string $subpage
	 * @return bool
	 */
	public static function onSpecialPageBeforeExecute( SpecialPage $special, $subpage ) {
		$name = $special->getName();
		$out = $special->getOutput();
		$skin = $out->getSkin();
		$request = $special->getRequest();

		// Ensure desktop version of Special:Preferences page gets mobile targeted modules
		// FIXME: Upstream to core (?)
		if ( $skin instanceof SkinMinerva ) {
			switch ( $name ) {
				case 'Preferences':
					$out->addModules( 'skins.minerva.special.preferences.scripts' );
					break;
				case 'Userlogin':
				case 'CreateAccount':
					// FIXME: Note mobile.ajax.styles should not be necessary here.
					// It's used by the Captcha extension (see T162196)
					$out->addModuleStyles( [ 'mobile.ajax.styles', 'skins.minerva.special.userlogin.styles' ] );
					// Add default warning message to Special:UserLogin and Special:UserCreate
					// if no warning message set.
					if (
						!$request->getVal( 'warning', null ) &&
						!$special->getUser()->isLoggedIn()
					) {
						$request->setVal( 'warning', 'mobile-frontend-generic-login-new' );
					}
					break;
				case 'Search':
					$out->addModuleStyles( 'skins.minerva.special.search.styles' );
					break;
			}
		}
	}

	/**
	 * BeforePageDisplayMobile hook handler.
	 *
	 * @param OutputPage $out
	 * @param Skin $skin
	 */
	public static function onRequestContextCreateSkinMobile(
		MobileContext $mobileContext, Skin $skin
	) {
		// setSkinOptions is not available
		if ( $skin instanceof SkinMinerva ) {
			$skin->setSkinOptions( [
				SkinMinerva::OPTION_PRINT_STYLES
					=> $mobileContext->getConfigVariable( 'MinervaPrintStyles' ),
				SkinMinerva::OPTION_CATEGORIES
					=> $mobileContext->getConfigVariable( 'MinervaShowCategoriesButton' ),
				SkinMinerva::OPTION_FONT_CHANGER
					=> $mobileContext->getConfigVariable( 'MinervaEnableFontChanger' ),
				SkinMinerva::OPTION_BACK_TO_TOP
					=> $mobileContext->getConfigVariable( 'MinervaEnableBackToTop' ),
				SkinMinerva::OPTION_TOGGLING => true,
				SkinMinerva::OPTION_MOBILE_OPTIONS => true,
			] );
		}
	}
}
