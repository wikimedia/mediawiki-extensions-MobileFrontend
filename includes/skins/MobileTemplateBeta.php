<?php
class MobileTemplateBeta extends MobileTemplate {
	protected function renderMainMenu( $data ) {
		echo Html::element( 'h2', array(), wfMessage( 'mobile-frontend-main-menu-discovery' )->text() );
		?>
		<ul id="mw-mf-menu-main">
		<?php
		foreach( $this->getDiscoveryTools() as $key => $val ):
			echo $this->makeListItem( $key, $val );
		endforeach;
		?>
		</ul>
		<?php
		echo Html::element( 'h2', array(), wfMessage( 'mobile-frontend-main-menu-personal' )->text() );
		?>
		<ul>
		<?php
		foreach( $this->getPersonalTools() as $key => $val ):
			echo $this->makeListItem( $key, $val );
		endforeach;
		?>
		</ul>
		<ul class="hlist">
		<?php
		foreach( $this->getSiteLinks() as $key => $val ):
			echo $this->makeListItem( $key, $val );
		endforeach;
		?>
		</ul>
		<?php
	}

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
