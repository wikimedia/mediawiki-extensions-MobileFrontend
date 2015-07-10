<?php
/**
 * MinervaTemplateBeta.php
 */

/**
 * Alternative Minerva template sent to users who have opted into the
 * beta mode via Special:MobileOptions
 */
class MinervaTemplateBeta extends MinervaTemplate {
	/** {@inheritdoc} */
	protected $renderHistoryLinkBeforeContent = false;
	/**
	 * @var string $searchPlaceHolderMsg Message used as placeholder in search input
	 */
	protected $searchPlaceHolderMsg = 'mobile-frontend-placeholder-beta';

	/**
	 * Render available page actions
	 * @param array $data Data used to build page actions
	 */
	public function renderPageActions( $data ) {
		if ( !$this->isMainPage ) {
			parent::renderPageActions( $data );
		}
	}

	/**
	 * Get category button if categories are present
	 * @return array A map of the button's friendly name, "categories" to its
	 *   spec if the button can be displayed.
	 */
	protected function getCategoryButton() {
		$skin = $this->getSkin();
		$categories = $skin->getCategoryLinks( false /* don't render the heading */ );

		if ( !$categories ) {
			return array();
		}

		return array(
			'categories' => array(
				'attributes' => array(
					'href' => '#/categories',
					// add hidden class (the overlay works only, when JS is enabled (class will
					// be removed in categories/init.js)
					'class' => 'category-button hidden',
				),
				'label' => wfMessage( 'categories' )->text()
			),
		);
	}

	/**
	 * Get page secondary actions
	 */
	protected function getSecondaryActions() {
		$donationUrl = $this->getSkin()->getMFConfig()->get( 'MFDonationUrl' );

		$result = parent::getSecondaryActions();

		if ( $donationUrl && !$this->isSpecialPage ) {
			$result['donation'] = array(
				'attributes' => array(
					'href' => $donationUrl,
				),
				'label' => wfMessage( 'mobile-frontend-donate-button-label' )->text()
			);
		}

		$result += $this->getCategoryButton();

		return $result;
	}

	/**
	 * @inheritdoc
	 */
	protected function getHeaderHtml( $data ) {
		$templateParser = new TemplateParser( __DIR__ );
		$args = array(
			'siteName' => SkinMinerva::getSitename(),
			'mobileMenuClass' => MobileUI::iconClass( 'search-gray', 'element', 'header-icon' ),
			'mobileMenuLink' => SpecialPage::getTitleFor( 'MobileMenu' )->getLocalUrl(),
			'mobileMenuTitle' => wfMessage( 'mobile-frontend-main-menu' )->parse(),
			'secondaryButton' => $data['secondaryButton'],
		);

		return $templateParser->processTemplate( 'header', $args );
	}

	/**
	 * @inheritdoc
	 */
	protected function getSearchAttributes() {
		$searchAttributes = parent::getSearchAttributes();
		$searchAttributes['class'] =  MobileUI::semanticClass( 'mw-ui-input', '', 'search' );

		return $searchAttributes;
	}

	/**
	 * @inheritdoc
	 */
	protected function getSearchForm( $data ) {
		return Html::openElement( 'form',
				array(
				'action' => $data['wgScript'],
				'class' => 'search-box',
				)
			) .
			Html::openElement( 'div', array(
				'class' => MobileUI::iconClass( 'search-invert', 'element',
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
	 * In addition to the main menu, this function renders the search form on top of the menu
	 * @inheritdoc
	 */
	protected function getMainMenuHtml( $data ) {
		$templateParser = new TemplateParser( __DIR__ );
		$args = array(
			'searchForm' => $this->getSearchForm( $data )
		);
		return $templateParser->processTemplate( 'searchForm', $args )
			   . parent::getMainMenuHtml( $data );
	}
}
