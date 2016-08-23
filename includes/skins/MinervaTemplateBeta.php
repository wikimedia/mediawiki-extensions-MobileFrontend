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
	 * Gets template data for rendering
	 *
	 * @inheritdoc
	 */
	protected function getFooterTemplateData( $data ) {
		$tmpData = parent::getFooterTemplateData( $data );
		// This turns off the footer id and allows us to distinguish the old footer with the new design

		$tmpData = array_merge( $tmpData, [
			'lastmodified' => $this->getHistoryLinkHtml( $data ),
			'headinghtml' => $data['footer-site-heading-html'],
			'licensehtml' => $data['mobile-license']
		] );
		return $tmpData;
	}

	/**
	 * Removes the last modified bar from the post content area
	 * so that it can instead be placed in the footer
	 *
	 * @inheritdoc
	 */
	protected function getPostContentHtml( $data ) {
		return $this->getSecondaryActionsHtml();
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
	 */
	protected function getSecondaryActions() {
		$donationUrl = $this->getSkin()->getMFConfig()->get( 'MFDonationUrl' );

		$result = parent::getSecondaryActions();

		if ( $donationUrl && !$this->isSpecialPage ) {
			$result['donation'] = [
				'attributes' => [
					'href' => $donationUrl,
				],
				'label' => $this->getMsg( 'mobile-frontend-donate-button-label' )->text()
			];
		}

		$result += $this->getCategoryButton();

		return $result;
	}
}
