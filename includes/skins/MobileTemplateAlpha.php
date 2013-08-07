<?php
class MobileTemplateAlpha extends MobileTemplate {
	protected function renderCategories() {
		?>
			<div class="section">
				<h2 class="section_heading" id="section_categories">
					<span><?php $this->msg( 'categories' ) ?></span>
				</h2>
				<div class="content_block" id="content_categories">
					<?php echo $this->getSkin()->getCategoryLinks( false /* don't render the heading */ ); ?>
				</div>
			</div>
		<?php
	}

	protected function renderMetaSections() {
		$this->renderCategories();
		parent::renderMetaSections();
	}
}