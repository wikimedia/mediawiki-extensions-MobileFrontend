<?php
class MobileTemplateAlpha extends MobileTemplate {
	protected function renderCategories() {
		$skin = $this->getSkin();
		$categories = $skin->getCategoryLinks( false /* don't render the heading */ );
		if ( $categories ) {
		?>
			<div class="section">
				<h2 class="section_heading" id="section_categories">
					<span><?php $this->msg( 'categories' ) ?></span>
				</h2>
				<div class="content_block" id="content_categories">
					<?php echo $categories ?>
				</div>
			</div>
		<?php
		}
	}

	protected function renderMetaSections() {
		$this->renderCategories();
		parent::renderMetaSections();
	}
}