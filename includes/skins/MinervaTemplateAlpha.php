<?php
/**
 * MinervaTemplateAlpha.php
 */

/**
 * Alternative Minerva template sent to users who have opted into the
 * experimental (alpha) mode via Special:MobileOptions
 */
class MinervaTemplateAlpha extends MinervaTemplateBeta {
	/**
	 * @var string $searchPlaceHolderMsg Message used as placeholder in search input
	 */
	protected $searchPlaceHolderMsg = 'mobile-frontend-placeholder-alpha';

	/**
	 * Get button information to link to Special:Nearby to find articles
	 * (geographically) related to this
	 * @return array A map of the button's friendly name, "nearby", to its spec
	 *   if the button can be displayed.
	 */
	public function getNearbyButton() {
		$skin = $this->getSkin();
		$title = $skin->getTitle();

		if (
			!$skin->getMFConfig()->get( 'MFNearby' )
			|| !class_exists( 'GeoData' )
			|| !GeoData::getPageCoordinates( $title )
		) {
			return array();
		}

		return array(
			'nearby' => array(
				'attributes' => array(
					'href' => SpecialPage::getTitleFor( 'Nearby' )->getLocalUrl() . '#/page/' . $title->getText(),
					'class' => 'nearby-button',
				),
				'label' => wfMessage( 'mobile-frontend-nearby-sectiontext' )->text()
			),
		);
	}

	/** @inheritdoc */
	protected function getSecondaryActions() {
		$result = parent::getSecondaryActions();
		$result += $this->getNearbyButton();

		return $result;
	}

	/**
	 * @inheritdoc
	 */
	protected function getChromeHeaderContentHtml( $data ) {
		$templateParser = new TemplateParser( __DIR__ );
		$args = array(
			'siteName' => SkinMinerva::getSitename(),
			'mobileMenuClass' => MobileUI::iconClass( 'search', 'element', 'header-icon' ),
			'mobileMenuLink' => SpecialPage::getTitleFor( 'MobileMenu' )->getLocalUrl(),
			'mobileMenuTitle' => wfMessage( 'mobile-frontend-main-menu' )->parse()
		);

		return $templateParser->processTemplate( 'header', $args );
	}

	protected function getSearchAttributes() {
		$searchAttributes = parent::getSearchAttributes();
		$searchAttributes['class'] =  MobileUI::semanticClass( 'mw-ui-input', '', 'search' );

		return $searchAttributes;
	}

	/**
	 * @inheritdoc
	 */
	protected function makeSearchForm( $data ) {
		return Html::openElement( 'form',
				array(
					'action' => $data['wgScript'],
					'class' => 'search-box',
				)
			) .
			Html::openElement( 'div', array(
				// FIXME: If this ever makes it to stable replace with search-inverted
				'class' => MobileUI::iconClass( 'search-white', 'element',
					'fulltext-search no-js-only' ),
			) ) .
			$this->makeSearchButton( 'fulltext' ) .
			Html::closeElement( 'div' ) .
			Html::openElement( 'span' ) .
			$this->makeSearchInput( $this->getSearchAttributes() ) .
			Html::closeElement( 'span' ) .
			Html::closeElement( 'form' );
	}

	/**
	 * Render Header elements
	 * @param array $data Data used to build the header
	 */
	protected function renderHeader( $data ) {
		echo $this->getChromeHeaderContentHtml( $data );
		echo $data['secondaryButton'];
	}

	/**
	 * In addition to the main menu, this function renders the search form on top of the menu
	 * @inheritdoc
	 */
	protected function renderMainMenu( $data ) {
		$templateParser = new TemplateParser( __DIR__ );
		$args = array(
			'searchForm' => $this->makeSearchForm( $data )
		);
		echo $templateParser->processTemplate( 'searchForm', $args );
		parent::renderMainMenu( $data );
	}

}
