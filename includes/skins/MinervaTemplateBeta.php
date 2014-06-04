<?php
class MinervaTemplateBeta extends MinervaTemplate {
	/**
	 * @var string $searchPlaceHolderMsg Message used as placeholder in search input
	 */
	protected $searchPlaceHolderMsg = 'mobile-frontend-placeholder-beta';

	// FIXME: Remove variable when secondary page actions menu moves to stable
	protected $languageButtonClassName = 'mw-ui-button mw-ui-progressive button
		languageSelector icon icon-32px';

	public function renderPageActions( $data ) {
		if ( !$this->isMainPage ) {
			parent::renderPageActions( $data );
		}
	}
}
