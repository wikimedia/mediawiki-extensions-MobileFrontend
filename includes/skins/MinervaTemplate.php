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

	private function renderLanguages( $languageTemplateData ) {
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

	protected function render( $data ) { // FIXME: replace with template engines
		$isSpecialPage = $this->getSkin()->getTitle()->isSpecialPage();
		$languages = $this->getLanguages();
		$variants = $this->getLanguageVariants();
		$languageData = array(
			'heading' => wfMessage( 'mobile-frontend-language-article-heading' )->text(),
			'languages' => $languages,
			'variants' => $variants,
			'languageSummary' => wfMessage( 'mobile-frontend-language-header', count( $languages ) )->text(),
			'variantSummary' => count( $variants ) > 1 ? wfMessage( 'mobile-frontend-language-variant-header' )->text() : '',
		);
		$showMenuHeaders = isset( $this->data['_show_menu_headers'] ) && $this->data['_show_menu_headers'];

		// begin rendering
		echo $data[ 'headelement' ];
		?>
		<div id="mw-mf-viewport">
			<div id="mw-mf-page-left">
			<?php if ( $showMenuHeaders ) { ?>
				<h2><?php echo wfMessage( 'mobile-frontend-main-menu-discovery' )->text() ?></h2>
			<?php } ?>
				<ul id="mw-mf-menu-main">
				<?php
				foreach( $this->getDiscoveryTools() as $key => $val ):
					echo $this->makeListItem( $key, $val );
				endforeach;
				?>
				</ul>
				<?php if ( $showMenuHeaders ) { ?>
				<h2><?php echo wfMessage( 'mobile-frontend-main-menu-personal' )->text() ?></h2>
				<?php } ?>
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
			</div>
			<div id='mw-mf-page-center'>
				<!-- start -->
				<?php
					foreach( $this->data['banners'] as $banner ):
						echo $banner;
					endforeach;
				?>
				<div class="header">
					<?php
						echo $this->html( 'menuButton' );
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
				<div class='show' id='content_wrapper'>
					<div id="content" class="content">
						<?php
							if ( !$isSpecialPage ) {
								echo $data['prebodytext'];
								$this->renderPageActions( $data );
							}
							echo $data[ 'bodytext' ];
							echo $this->renderLanguages( $languageData );
							echo $data['postbodytext'];
						?>
					</div><!-- close #content -->
				</div><!-- close #content_wrapper -->
				<?php
					echo $this->renderFooter( $data );
				?>
			</div><!-- close #mw-mf-page-center -->
		</div><!-- close #mw-mf-viewport -->
		<?php
			echo $data['reporttime'];
			echo $data['bottomscripts'];
		?>
		</body>
		</html>
		<?php
	}
}
