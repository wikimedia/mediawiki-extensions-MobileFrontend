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
	 * Do not render secondary actions on the user page
	 */
	protected function getSecondaryActionsHtml() {
		// no secondary actions on the user page
		if ( !$this->getSkin()->isUserPage ) {
			parent::getSecondaryActions();
		}
	}
}
