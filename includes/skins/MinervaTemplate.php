<?php
class MinervaTemplate extends BaseTemplate {
	public function getSearchPlaceholderText() {
		return wfMessage( 'mobile-frontend-placeholder' )->escaped();
	}

	private function prepareCommonData() {
		// set defaults
		if ( !isset( $this->data['postbodytext'] ) ) {
			$this->set( 'postbodytext', '' ); // not set in desktop skin
		}
		$searchBox = $this->makeSearchInput(
			array(
				'id' => 'searchInput',
				'class' => 'search',
				'autocomplete' => 'off',
				'placeholder' => $this->getSearchPlaceholderText(),
			)
		);
		$script = $this->data['wgScript'];
		$searchButton = $this->makeSearchButton( 'go', array( 'class' => 'searchSubmit' ) );
		$header = <<<HTML
<form action="{$script}" class="search-box">
	{$searchBox}
	{$searchButton}
</form>
HTML;
		$this->set( 'header', $header );

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

	public function prepareData() {
		$this->set( 'isSpecialPage', Title::newFromText( $this->data[ 'title' ] )->isSpecialPage() );
		$this->set( 'prebodytext', '<h1>' . $this->data[ 'title' ] . '</h1>' );
	}

	private function prepareBannerData() {
		global $wgMFEnableSiteNotice;
		$banners = '';
		if ( isset( $this->data['zeroRatedBanner'] ) ) { // FIXME: Add hook and move to Zero extension?
			$banners .= $this->data['zeroRatedBanner'];
		}
		if ( isset( $this->data['notice'] ) ) {
			$banners .= $this->data['notice'];
		}
		if ( $wgMFEnableSiteNotice ) {
			$banners .= '<div id="siteNotice"></div>';
		}
		$this->set( 'banners', $banners );
	}
	public function execute() {
		$this->prepareCommonData();
		$this->prepareData();
		$this->prepareBannerData();
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

	// FIXME: Design means that currently this menu can only cope with one item
	public function getUserActionTools() {
		$menu = array();
		if ( isset( $this->data['content_navigation']['actions'] ) ) {
			$actions = $this->data['content_navigation']['actions'];

			if ( isset( $actions['unwatch'] ) ) {
				$menu['unwatch'] = $actions['unwatch'];
				$menu['unwatch']['class'] = 'watch-this-article';
			} else if ( isset( $actions['watch'] ) ) {
				$menu['watch'] = $actions['watch'];
				$menu['watch']['class'] = 'watch-this-article';
			}
		}
		return $menu;
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
		if ( !$data['isSpecialPage'] ) {
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

	protected function render( $data ) { // FIXME: replace with template engines
		$languages = $this->getLanguages();
		$variants = $this->getLanguageVariants();
		$languageData = array(
			'heading' => wfMessage( 'mobile-frontend-language-article-heading' )->text(),
			'languages' => $languages,
			'variants' => $variants,
			'languageSummary' => wfMessage( 'mobile-frontend-language-header', count( $languages ) )->text(),
			'variantSummary' => count( $variants ) > 1 ? wfMessage( 'mobile-frontend-language-variant-header' )->text() : '',
		);

		// begin rendering
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
				<!-- start -->
				<?php
					echo $this->html( 'banners' );
				?>
				<div class="header">
				<?php
					echo $this->html( 'menuButton' );
					echo $this->html( 'header' );
				?>
					<ul id="mw-mf-menu-page">
						<?php
							foreach( $this->getUserActionTools() as $key => $val ):
								echo $this->makeListItem( $key, $val );
							endforeach;
						?>
					</ul>
				</div>
				<div class='show' id='content_wrapper'>
					<div id="content" class="content">
						<?php
							echo $data['prebodytext'];
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
