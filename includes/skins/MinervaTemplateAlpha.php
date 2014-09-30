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
	 * Add categories section to Meta section in page
	 */
	protected function renderMetaSections() {
		$this->renderCategories();
		parent::renderMetaSections();
	}
}
