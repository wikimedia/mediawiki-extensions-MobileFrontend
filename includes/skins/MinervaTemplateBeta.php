<?php
/**
 * MinervaTemplateBeta.php
 */

/**
 * Alternative Minerva template sent to users who have opted into the
 * beta mode via Special:MobileOptions
 */
class MinervaTemplateBeta extends MinervaTemplate {
	/**
	 * Get attributes to create search input
	 * @return array Array with attributes for search bar
	 */
	protected function getSearchAttributes() {
		$searchBox = parent::getSearchAttributes();
		$searchBox['placeholder'] = $this->getMsg( 'mobile-frontend-placeholder-beta' )->text();
		return $searchBox;
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
			return [];
		}

		return [
			'categories' => [
				'attributes' => [
					'href' => '#/categories',
					// add hidden class (the overlay works only, when JS is enabled (class will
					// be removed in categories/init.js)
					'class' => 'category-button hidden',
				],
				'label' => $this->getMsg( 'categories' )->text()
			],
		];
	}

	/**
	 * Get page secondary actions
	 *
	 * @return array An array of button definitions
	 */
	protected function getSecondaryActions() {
		$result = parent::getSecondaryActions();
		$result += $this->getCategoryButton();

		return $result;
	}
}
