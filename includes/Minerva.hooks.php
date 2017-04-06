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
	 * BeforePageDisplayMobile hook handler.
	 *
	 * @param OutputPage $out
	 * @param Skin $skin
	 */
	public static function onBeforePageDisplayMobile( OutputPage $out, Skin $skin ) {
		// In mobile mode MobileContext will always be available.
		$mobileContext = MobileContext::singleton();
		// setSkinOptions is not available
		if ( $skin instanceof SkinMinerva ) {
			$skin->setSkinOptions( [
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
