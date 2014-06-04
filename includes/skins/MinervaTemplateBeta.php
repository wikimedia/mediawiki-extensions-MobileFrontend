<?php
/**
 * Alternative Minerva template sent to users who have opted into the
 * beta mode via Special:MobileOptions
 */
class MinervaTemplateBeta extends MinervaTemplate {
	/**
	 * @var string $searchPlaceHolderMsg Message used as placeholder in search input
	 */
	protected $searchPlaceHolderMsg = 'mobile-frontend-placeholder-beta';

	/**
	 * CSS classes for language button
	 * @var string $languageButtonClassName
	 * @todo Remove variable when secondary page actions menu moves to stable
	 */
	protected $languageButtonClassName = 'mw-ui-button mw-ui-progressive button
		languageSelector icon icon-32px';

	/**
	 * Render available page actions
	 * @param array $data Data used to build page actions
	 */
	public function renderPageActions( $data ) {
		if ( !$this->isMainPage ) {
			parent::renderPageActions( $data );
		}
	}
}
