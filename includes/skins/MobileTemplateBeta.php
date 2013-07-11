<?php
class MobileTemplateBeta extends MobileTemplate {
	protected function renderContentWrapper( $data ) {
		$isSpecialPage = $this->getSkin()->getTitle()->isSpecialPage();
		?>
		<div class='show' id='content_wrapper'>
			<?php
				if ( !$isSpecialPage ) {
					echo $data['prebodytext'];
					$this->renderPageActions( $data );
				}
			?>
			<div id="content" class="content">
			<?php
					echo $data[ 'bodytext' ];
					$this->renderLanguages( $data );
					$this->renderHistoryLink( $data );
				?>
			</div>
		</div>
		<?php
	}
}
