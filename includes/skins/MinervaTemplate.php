<?php
class MinervaTemplate extends BaseTemplate {
	private function prepareCommonData() {
		$this->set( 'language_urls', array() );

		// menu button
		$url = SpecialPage::getTitleFor( 'MobileMenu' )->getLocalUrl() . '#mw-mf-page-left';
		$this->set( 'menuButton',
			Html::element( 'a', array(
			'title' => wfMessage( 'mobile-frontend-main-menu-button-tooltip' ),
			'href' => $url,
			'id'=> 'mw-mf-main-menu-button',
			) )
		);
	}

	public function prepareData() { // expects to be overriden
	}

	public function execute() {
		$this->prepareCommonData();
		$this->prepareData();
		$this->render( $this->data );
	}

	public function getLanguageVariants() {
		return $this->data['content_navigation']['variants'];
	}

	public function getLanguages() {
		return $this->data['language_urls'];
	}

	public function renderLanguages( $languageTemplateData ) {
		if ( $languageTemplateData['languages'] && count( $languageTemplateData['languages'] ) > 0 ) {
		?>
		<div class="section" id="mw-mf-language-section">
			<h2 id="section_language" class="section_heading"><?php echo $languageTemplateData['heading']; ?></h2>
			<div id="content_language" class="content_block">
				<p id="mw-mf-language-variant-header"><?php echo $languageTemplateData['variantSummary']; ?></p>
				<ul id="mw-mf-language-variant-selection">
				<?php
				foreach( $languageTemplateData['variants'] as $key => $val ):
					echo $this->makeListItem( $key, $val );
				endforeach;
				?>
				</ul>
				<p id="mw-mf-language-header"><?php echo $languageTemplateData['languageSummary']; ?></p>
				<ul id="mw-mf-language-selection">
				<?php
				foreach( $languageTemplateData['languages'] as $key => $val ):
					echo $this->makeListItem( $key, $val );
				endforeach;
				?>
				</ul>
			</div>
		</div>
		<?php
		}
	}

	private function render( $data ) { // FIXME: replace with template engines
		echo $data[ 'headelement' ];
		?>
		<div id="mw-mf-viewport">
			<div id="mw-mf-page-left">
				<ul id="mw-mf-menu-main">
				<?php
				foreach( $this->getDiscoveryTools() as $key => $val ):
					echo $this->makeListItem( $key, $val );
				endforeach;
				foreach( $this->getPersonalTools() as $key => $val ):
					echo $this->makeListItem( $key, $val );
				endforeach;
				?>
				</ul>
			</div>
			<div id='mw-mf-page-center'>
		<?php
	}
}
