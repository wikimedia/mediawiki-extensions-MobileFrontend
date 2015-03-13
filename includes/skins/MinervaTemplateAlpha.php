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

	/**
	 * Get category button if categories are present
	 * @return array A map of the button's friendly name, "categories" to its
	 *   spec if the button can be displayed.
	 */
	public function getCategoryButton() {
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

	/** @inheritdoc */
	protected function getSecondaryActions() {
		$result = parent::getSecondaryActions();
		$result += $this->getNearbyButton();
		$result += $this->getCategoryButton();

		return $result;
	}
}
