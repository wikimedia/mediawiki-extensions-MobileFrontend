<?php
/**
 * MinervaTemplate.php
 */

/**
 * Extended Template class of BaseTemplate for mobile devices
 */
class MinervaTemplate extends BaseTemplate {
	/**
	 * @var string $languageButtonClassName Class names of language selector
	 * @todo: Remove variable when secondary page actions menu moves to stable
	 */
	protected $languageButtonClassName = 'mw-ui-button mw-ui-progressive button languageSelector';
	/** @var string $searchPlaceHolderMsg Message used as placeholder in search input */
	protected $searchPlaceHolderMsg = 'mobile-frontend-placeholder';

	/** @var boolean Specify whether the page is a special page */
	protected $isSpecialPage;

	/** @var boolean Specify whether the page is main page */
	protected $isMainPage;

	/**
	 * Get elements for personal toolbar
	 * @return array
	 */
	public function getPersonalTools() {
		return $this->data['personal_urls'];
	}

	/**
	 * Start render the page in template
	 */
	public function execute() {
		$this->isSpecialPage = $this->getSkin()->getTitle()->isSpecialPage();
		$this->isMainPage = $this->getSkin()->getTitle()->isMainPage();
		wfRunHooks( 'MinervaPreRender', array( $this ) );
		$this->render( $this->data );
	}

	/**
	 * Returns the available languages for this page
	 * @return array
	 */
	public function getLanguageVariants() {
		return $this->data['content_navigation']['variants'];
	}

	/**
	 * Get the language links for this page
	 * @return array
	 */
	public function getLanguages() {
		return $this->data['language_urls'];
	}

	/**
	 * Returns main sidebar menu elements
	 * @return array
	 */
	public function getDiscoveryTools() {
		return $this->data['discovery_urls'];
	}

	/**
	 * Returns sidebar footer links
	 * @return array
	 */
	public function getSiteLinks() {
		return $this->data['site_urls'];
	}

	/**
	 * Returns available page actions
	 * @return array
	 */
	public function getPageActions() {
		return $this->data['page_actions'];
	}

	/**
	 * Returns footer links
	 * @param string $option
	 * @return array
	 */
	public function getFooterLinks( $option = null ) {
		return $this->data['footerlinks'];
	}

	/**
	 * Get attributes to create search input
	 * @return array Array with attributes for search bar
	 */
	protected function getSearchAttributes() {
		$searchBox = array(
			'id' => 'searchInput',
			'class' => 'search',
			'autocomplete' => 'off',
			// The placeholder gets fed to HTML::element later which escapes all
			// attribute values, so no need to escape the string here.
			'placeholder' =>  wfMessage( $this->searchPlaceHolderMsg )->text(),
		);
		return $searchBox;
	}

	/**
	 * Render Footer elements
	 * @param array $data Data used to build the footer
	 */
	protected function renderFooter( $data ) {
		?>
		<div id="footer">
			<?php
				foreach( $this->getFooterLinks() as $category => $links ):
			?>
				<ul class="footer-<?php echo $category; ?>">
					<?php
						foreach( $links as $link ) {
							if ( isset( $this->data[$link] ) && $this->data[$link] !== '' ) {
								echo Html::openElement( 'li', array( 'id' => "footer-{$category}-{$link}" ) );
								$this->html( $link );
								echo Html::closeElement( 'li' );
							}
						}
					?>
				</ul>
			<?php
				endforeach;
			?>
		</div>
		<?php
	}

	/**
	 * Render available page actions
	 * @param array $data Data used to build page actions
	 */
	protected function renderPageActions( $data ) {
		?><ul id="page-actions" class="hlist"><?php
		foreach( $this->getPageActions() as $key => $val ):
			echo $this->makeListItem( $key, $val );
		endforeach;
		?></ul><?php
	}

	/**
	 * Outputs the 'Last edited' message, e.g. 'Last edited on...'
	 * @param array $data Data used to build the page
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
	 * Renders history link at top of page if it isn't the main page
	 * @param array $data Data used to build the page
	 */
	protected function renderHistoryLinkTop( $data ) {
		if ( !$this->isMainPage ) {
			$this->renderHistoryLink( $data );
		}
	}

	/**
	 * Renders history link at bottom of page if it is the main page
	 * @param array $data Data used to build the page
	 */
	protected function renderHistoryLinkBottom( $data ) {
		if ( $this->isMainPage ) {
			$this->renderHistoryLink( $data );
		}
	}

	/**
	 * Render secondary page actions like language selector
	 */
	protected function renderMetaSections() {
		echo Html::openElement( 'div', array( 'id' => 'page-secondary-actions' ) );

		// If languages are available, render a languages link
		if ( $this->getLanguages() || $this->getLanguageVariants() ) {
			$languageUrl = SpecialPage::getTitleFor(
				'MobileLanguages',
				$this->getSkin()->getTitle()
			)->getLocalURL();
			$languageLabel = wfMessage( 'mobile-frontend-language-article-heading' )->text();

			echo Html::element( 'a', array(
				'class' => $this->languageButtonClassName,
				'href' => $languageUrl
			), $languageLabel );
		}

		echo Html::closeElement( 'div' );
	}

	/**
	 * Renders the content of a page
	 * @param array $data Data used to build the page
	 */
	protected function renderContent( $data ) {
		if ( !$data[ 'unstyledContent' ] ) {
			echo Html::openElement( 'div', array(
				'id' => 'content',
				'class' => 'content',
				'lang' => $data['pageLang'],
				'dir' => $data['pageDir'],
			) );
			?>
			<?php
				if ( isset( $data['subject-page'] ) ) {
					echo $data['subject-page'];
				}
				echo $data[ 'bodytext' ];
				$this->renderMetaSections();
				$this->renderHistoryLinkBottom( $data );
			?>
			</div>
			<?php
		} else {
			echo $data[ 'bodytext' ];
		}
	}

	/**
	 * Renders pre-content (e.g. heading)
	 * @param array $data Data used to build the page
	 */
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
				} elseif ( !$isSpecialPage ){
					$this->renderPageActions( $data );
				}
				echo $internalBanner;
				?>
		</div>
		<?php
		}
	}

	/**
	 * Render wrapper for loading content
	 * @param array $data Data used to build the page
	 */
	protected function renderContentWrapper( $data ) {
		$this->renderHistoryLinkTop( $data );
		?>
		<script>
			if ( window.mw && mw.mobileFrontend ) { mw.mobileFrontend.emit( 'header-loaded' ); }
		</script>
		<?php
			$this->renderPreContent( $data );
			$this->renderContent( $data );
	}

	/**
	 * Render side menu as lists
	 * @param array $data Data used to build the page
	 */
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

	/**
	 * Render the entire page
	 * @param array $data Data used to build the page
	 * @todo replace with template engines
	 */
	protected function render( $data ) {

		// begin rendering
		echo $data[ 'headelement' ];
		?>
		<div id="mw-mf-viewport">
			<div id="mw-mf-page-left" class="navigation-drawer">
				<?php
					$this->renderMainMenu( $data );
				?>
			</div>
			<div id="mw-mf-page-center">
				<?php
					foreach( $this->data['banners'] as $banner ):
						echo $banner;
					endforeach;
				?>
				<div class="header">
					<?php
						$this->html( 'menuButton' );
					?>
							<form action="<?php echo $data['wgScript'] ?>" class="search-box">
							<?php
							echo $this->makeSearchInput( $this->getSearchAttributes() );
							// FIXME: change this into a search icon instead of a text button
							echo $this->makeSearchButton(
								'fulltext',
								array( 'class' => 'fulltext-search no-js-only icon icon-search' )
							);
							?>
							</form>
							<?php
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
