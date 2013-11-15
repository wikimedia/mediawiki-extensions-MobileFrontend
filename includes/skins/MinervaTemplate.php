<?php
class MinervaTemplate extends BaseTemplate {
	/**
	 * @var Boolean
	 */
	protected $isSpecialPage;

	public function getPersonalTools() {
		return $this->data['personal_urls'];
	}

	public function execute() {
		$this->isSpecialPage = $this->getSkin()->getTitle()->isSpecialPage();
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
		return $this->data['discovery_urls'];
	}

	public function getSiteLinks() {
		return $this->data['site_urls'];
	}

	public function getPageActions() {
		return $this->data['page_actions'];
	}

	public function getFooterLinks( $option = null ) {
		return $this->data['footerlinks'];
	}

	protected function renderLanguages() {
		$languages = $this->getLanguages();
		$variants = $this->getLanguageVariants();
		// stupid php: count( false ) returns 1
		$languagesCount = is_array( $languages ) ? count( $languages ) : 0;
		$variantsCount = is_array( $variants ) ? count( $variants ) : 0;

		if ( $languagesCount > 0 || $variantsCount > 1 ) {
			$heading = wfMessage( 'mobile-frontend-language-article-heading' )->text();
			$languageSummary = wfMessage( 'mobile-frontend-language-header', $languagesCount )->text();
			$variantSummary = $variantsCount > 1 ? wfMessage( 'mobile-frontend-language-variant-header' )->text() : '';
			?>
			<div class="section" id="mw-mf-language-section">
				<h2 id="section_language" class="section_heading"><?php echo $heading; ?></h2>
				<div id="content_language" class="content_block">

					<?php if ( $variantsCount > 1 ) { ?>
					<p id="mw-mf-language-variant-header"><?php echo $variantSummary; ?></p>
					<ul id="mw-mf-language-variant-selection">
					<?php
					foreach( $variants as $key => $val ):
						echo $this->makeListItem( $key, $val );
					endforeach;
					?>
					</ul>
					<?php } ?>

					<?php if ( $languagesCount > 0 ) { ?>
					<p id="mw-mf-language-header"><?php echo $languageSummary; ?></p>
					<ul id="mw-mf-language-selection">
					<?php
					foreach( $languages as $key => $val ):
						echo $this->makeListItem( $key, $val );
					endforeach;
					?>
					</ul>
					<?php } ?>

				</div>
			</div>
		<?php
		}
	}

	protected function renderFooter( $data ) {
		if ( !$data['disableSearchAndFooter'] ) {
		?>
		<div id="footer">
			<?php
				foreach( $this->getFooterLinks() as $category => $links ):
			?>
				<ul class="footer-<?php echo $category; ?>">
					<?php foreach( $links as $link ): if ( isset( $this->data[$link] ) ): ?><li><?php $this->html( $link ) ?></li><?php endif; endforeach; ?>
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

	/**
	 * Outputs the 'Last edited' message, e.g. 'Last edited on...'
	 * @param Array $data Data used to build the page
	 */
	protected function renderHistoryLink( $data ) {
		if ( isset( $data['historyLink'] ) ) {
			$historyLink = $data['historyLink'];
			$historyLabel = $historyLink['text'];
			unset( $historyLink['text'] );
			echo Html::element( 'a', $historyLink, $historyLabel );
		}
	}

	/**
	 * Renders history link at top of page
	 * @param Array $data Data used to build the page
	 */
	protected function renderHistoryLinkBottom( $data ) {
		$this->renderHistoryLink( $data );
	}

	protected function renderMetaSections() {
		$this->renderLanguages();
	}

	/**
	 * Renders the content of a page
	 * @param Array $data Data used to build the page
	 */
	protected function renderContent( $data ) {
		if ( !$data[ 'unstyledContent' ] ) { ?>
		<div id="content" class="content">
			<?php
				if ( isset( $data['subject-page'] ) ) {
					echo $data['subject-page'];
				}
				echo $data[ 'bodytext' ];
				$this->renderMetaSections();
				$this->renderHistoryLinkBottom( $data );
			?>
		</div>
		<?php } else {
			echo $data[ 'bodytext' ];
		}
	}

	protected function renderPreContent( $data ) {
		$internalBanner = $data[ 'internalBanner' ];
		$isSpecialPage = $this->isSpecialPage;
		$preBodyText = isset( $data['prebodytext'] ) ? $data['prebodytext'] : '';

		if ( $internalBanner || $preBodyText ) {
		?>
		<div class="pre-content">
			<?php
				echo $preBodyText;
				// FIXME: Temporary solution until we have design
				if ( isset( $data['_old_revision_warning'] ) ) {
					echo $data['_old_revision_warning'];
				} else if ( !$isSpecialPage ){
					$this->renderPageActions( $data );
				}
				echo $internalBanner;
				?>
		</div>
		<?php
		}
	}

	protected function renderContentWrapper( $data ) {
		?>
		<script>
			mw.mobileFrontend.emit( 'header-loaded' );
		</script>
		<?php
			$this->renderPreContent( $data );
			$this->renderContent( $data );
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
						if ( $data['disableSearchAndFooter'] ) {
							echo $data['specialPageHeader'];
						} else {
							?>
							<form action="<?php echo $data['wgScript'] ?>" class="search-box">
							<?php
							echo $this->makeSearchInput( $data['searchBox'] );
							echo $this->makeSearchButton( 'go', array( 'class' => 'searchSubmit mw-ui-button mw-ui-progressive' ) );
							?>
							</form>
							<?php
						}
						echo $data['secondaryButton'];
					?>
				</div>
				<div id="content_wrapper">
				<?php
					$this->renderContentWrapper( $data );
				?>
				</div>
				<?php
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
