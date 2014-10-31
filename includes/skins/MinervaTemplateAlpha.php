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
	 * Show/Render categories as section in alpha mode
	 */
	protected function renderCategories() {
		$skin = $this->getSkin();
		$categories = $skin->getCategoryLinks( false /* don't render the heading */ );
		if ( $categories ) {
		?>
			<h2 id="collapsible-heading-categories">
				<span><?php $this->msg( 'categories' ) ?></span>
			</h2>
			<div id="collapsible-block-categories">
				<?php echo $categories ?>
			</div>
		<?php
		}
	}

	/**
	 * Render secondary page actions
	 */
	protected function renderSecondaryActions() {
		// FIXME: This should be a button like language button (bug 73008)
		$this->renderCategories();

		parent::renderSecondaryActions();
	}

	/**
	 * Get button information to link to Special:Nearby to find articles
	 * (geographically) related to this
	 */
	public function getNearbyButton() {
		global $wgMFNearby;
		$title = $this->getSkin()->getTitle();
		$result = array();

		if ( $wgMFNearby && class_exists( 'GeoData' ) && GeoData::getPageCoordinates( $title ) ) {
			$result['nearby'] = array(
				'url' => SpecialPage::getTitleFor( 'Nearby' )->getFullUrl() . '#/page/' . $title->getText(),
				'class' => 'nearbyButton',
				'label' => wfMessage( 'mobile-frontend-nearby-sectiontext' )->text()
			);
		}

		return $result;
	}

	/**
	 * Get page secondary actions
	 */
	protected function getSecondaryActions() {
		$result = parent::getSecondaryActions();

		$result += $this->getNearbyButton();

		return $result;
	}
}
