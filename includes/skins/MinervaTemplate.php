<?php
class MinervaTemplate extends BaseTemplate {
	public function execute() {
		$this->getSkin()->prepareData( $this );
		wfRunHooks( 'MinervaPreRender', array( $this ) );
		$this->render( $this->data );
	}

	public function getLanguageVariants() {
		return $this->data['content_navigation']['variants'];
	}

	public function getLanguages() {
		return $this->data['language_urls'];
	}

	public function getDiscoveryTools() {
		return $this->data['sidebar']['navigation'];
	}

	public function getSiteLinks() {
		return $this->data['site_urls'];
	}

	public function getPageActions() {
		return $this->data['page_actions'];
	}

	protected function renderLanguages() {
		$languages = $this->getLanguages();
		$variants = $this->getLanguageVariants();
		$languageTemplateData = array(
			'heading' => wfMessage( 'mobile-frontend-language-article-heading' )->text(),
			'languages' => $languages,
			'variants' => $variants,
			'languageSummary' => wfMessage( 'mobile-frontend-language-header', count( $languages ) )->text(),
			'variantSummary' => count( $variants ) > 1 ? wfMessage( 'mobile-frontend-language-variant-header' )->text() : '',
		);
		if ( $languageTemplateData['languages'] && count( $languageTemplateData['languages'] ) > 0 ) {
		?>
		<div class="section" id="mw-mf-language-section">
			<h2 id="section_language" class="section_heading"><?php echo $languageTemplateData['heading']; ?></h2>
			<div id="content_language" class="content_block">
				<?php if ( count( $languageTemplateData['variants'] ) > 0 ) { ?>
				<p id="mw-mf-language-variant-header"><?php echo $languageTemplateData['variantSummary']; ?></p>
				<ul id="mw-mf-language-variant-selection">
				<?php
				foreach( $languageTemplateData['variants'] as $key => $val ):
					echo $this->makeListItem( $key, $val );
				endforeach;
				?>
				</ul>
				<?php } ?>
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

	protected function renderFooter( $data ) {
		if ( !$this->getSkin()->getTitle()->isSpecialPage() ) {
		?>
		<div id="footer">
			<?php
				foreach( $this->getFooterLinks() as $category => $links ):
			?>
				<ul class="footer-<?php echo $category; ?>">
					<?php foreach( $links as $link ): ?><li><?php $this->html( $link ) ?></li><?php endforeach; ?>
				</ul>
			<?php endforeach; ?>
		</div>
		<?php
		}
	}

	protected function renderPageActions( $data ) {
		?><ul id="page-actions" class="hlist"><?php
		foreach( $this->getPageActions() as $key => $val ):
			echo $this->makeListItem( $key, $val );
		endforeach;
		?></ul><?php
	}

	protected function renderHistoryLink( $data ) {
		if ( isset( $data['historyLink'] ) ) {
			$historyLink = $data['historyLink'];
			$historyLabel = $historyLink['text'];
			unset( $historyLink['text'] );
			echo Html::element( 'a', $historyLink, $historyLabel );
		}
	}

	protected function renderMetaSections() {
		$this->renderLanguages();
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
					if ( isset( $data['subject-page'] ) ) {
						echo $data['subject-page'];
					}
					echo $data[ 'bodytext' ];
					$this->renderMetaSections();
					$this->renderHistoryLink( $data );
				?>
			</div>
		</div>
		<?php
	}

	protected function renderMainMenu( $data ) {
		?>
		<ul>
		<?php
		foreach( $this->getDiscoveryTools() as $key => $val ):
			echo $this->makeListItem( $key, $val );
		endforeach;
		?>
		</ul>
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

	protected function render( $data ) { // FIXME: replace with template engines
		$isSpecialPage = $this->getSkin()->getTitle()->isSpecialPage();

		// begin rendering
		echo $data[ 'headelement' ];
		?>
		<div id="mw-mf-viewport">
			<div id="mw-mf-page-left">
				<?php
					$this->renderMainMenu( $data );
				?>
			</div>
			<div id='mw-mf-page-center'>
				<?php
					foreach( $this->data['banners'] as $banner ):
						echo $banner;
					endforeach;
				?>
				<div class="header">
					<?php
						$this->html( 'menuButton' );
						if ( $isSpecialPage ) {
							echo $data['specialPageHeader'];
						} else {
							?>
							<form action="<?php echo $data['wgScript'] ?>" class="search-box">
							<?php
							echo $this->makeSearchInput( $data['searchBox'] );
							echo $this->makeSearchButton( 'go', array( 'class' => 'searchSubmit' ) );
							?>
							</form>
							<?php
						}
						echo $data['userButton'];
					?>
				</div>
				<?php
					$this->renderContentWrapper( $data );
					$this->renderFooter( $data );
				?>
			</div>
		</div>
		<?php
			echo $data['reporttime'];
			echo $data['bottomscripts'];
		?>
		</body>
		</html>
		<?php
	}
}
