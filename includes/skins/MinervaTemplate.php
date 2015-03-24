<?php
/**
 * MinervaTemplate.php
 */

/**
 * Extended Template class of BaseTemplate for mobile devices
 */
class MinervaTemplate extends BaseTemplate {
	/** @var boolean Temporary variable that decides whether
	 * history link should be rendered before the content. */
	protected $renderHistoryLinkBeforeContent = true;
	/** @var string $searchPlaceHolderMsg Message used as placeholder in search input */
	protected $searchPlaceHolderMsg = 'mobile-frontend-placeholder';

	/** @var boolean Specify whether the page is a special page */
	protected $isSpecialPage;

	/** @var boolean Whether or not the user is on the Special:MobileMenu page */
	protected $isSpecialMobileMenuPage;

	/** @var boolean Specify whether the page is main page */
	protected $isMainPage;

	/**
	 * Renders the header content for the top chrome.
	 * @param array $data Data used to build the page
	 */
	protected function makeChromeHeaderContent( $data ) {
		echo $this->makeSearchForm( $data );
	}

	/**
	 * Generates the HTML required to render the search form.
	 *
	 * @param array $data The data used to render the page
	 * @return string
	 */
	protected function makeSearchForm( $data ) {
		return Html::openElement( 'form',
				array(
					'action' => $data['wgScript'],
					'class' => 'search-box',
				)
			) .
			$this->makeSearchInput( $this->getSearchAttributes() ) .
			$this->makeSearchButton(
				'fulltext',
				array(
					'class' => 'fulltext-search no-js-only icon icon-search',
				)
			) .
			Html::closeElement( 'form' );
	}

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
		$title = $this->getSkin()->getTitle();
		$this->isSpecialPage = $title->isSpecialPage();
		$this->isSpecialMobileMenuPage = $this->isSpecialPage &&
			$title->equals( SpecialPage::getTitleFor( 'MobileMenu' ) );
		$this->isMainPage = $title->isMainPage();
		Hooks::run( 'MinervaPreRender', array( $this ) );
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
				foreach ( $this->getFooterLinks() as $category => $links ) {
			?>
				<ul class="footer-<?php echo $category; ?>">
					<?php
						foreach ( $links as $link ) {
							if ( isset( $this->data[$link] ) && $this->data[$link] !== '' ) {
								echo Html::openElement( 'li', array( 'id' => "footer-{$category}-{$link}" ) );
								$this->html( $link );
								echo Html::closeElement( 'li' );
							}
						}
					?>
				</ul>
			<?php
				}
			?>
		</div>
		<?php
	}

	/**
	 * Render available page actions
	 * @param array $data Data used to build page actions
	 */
	protected function renderPageActions( $data ) {
		$actions = $this->getPageActions();
		if ( $actions ) {
			?><ul id="page-actions" class="hlist"><?php
			foreach ( $actions as $key => $val ) {
				echo $this->makeListItem( $key, $val );
			}
			?></ul><?php
		}
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
	 * Get page secondary actions
	 */
	protected function getSecondaryActions() {
		$result = $this->data['secondary_actions'];

		// If languages are available, add a languages link
		if ( $this->getLanguages() || $this->getLanguageVariants() ) {
			$languageUrl = SpecialPage::getTitleFor(
				'MobileLanguages',
				$this->getSkin()->getTitle()
			)->getLocalURL();

			$result['language'] = array(
				'attributes' => array(
					'class' => 'languageSelector',
					'href' => $languageUrl,
				),
				'label' => wfMessage( 'mobile-frontend-language-article-heading' )->text()
			);
		}

		return $result;
	}

	/**
	 * Render secondary page actions like language selector
	 */
	protected function renderSecondaryActions() {
		$baseClass = MobileUI::buttonClass( '', 'button' );
		echo Html::openElement( 'div', array( 'id' => 'page-secondary-actions' ) );

		foreach ( $this->getSecondaryActions() as $el ) {
			if ( isset( $el['attributes']['class'] ) ) {
				$el['attributes']['class'] .= ' ' . $baseClass;
			} else {
				$el['attributes']['class'] = $baseClass;
			}
			echo Html::element( 'a', $el['attributes'], $el['label'] );
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
				echo $data[ 'bodytext' ];
				if ( isset( $data['subject-page'] ) ) {
					echo $data['subject-page'];
				}
				$this->renderSecondaryActions();
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
		if ( $this->renderHistoryLinkBeforeContent ) {
			$this->renderHistoryLinkTop( $data );
		?>
			<script>
				if ( window.mw && mw.mobileFrontend ) { mw.mobileFrontend.emit( 'history-link-loaded' ); }
			</script>
		<?php
		}
		?>
		<script>
			if ( window.mw && mw.mobileFrontend ) { mw.mobileFrontend.emit( 'header-loaded' ); }
		</script>
		<?php
			$this->renderPreContent( $data );
			$this->renderContent( $data );
			if ( !$this->renderHistoryLinkBeforeContent ) {
				$this->renderHistoryLinkTop( $data );
		?>
				<script>
					if ( window.mw && mw.mobileFrontend ) { mw.mobileFrontend.emit( 'history-link-loaded' ); }
				</script>
		<?php
			}
	}

	/**
	 * Renders the main menu.
	 *
	 * @param array $data Data used to build the page
	 */
	protected function renderMainMenu( $data ) {
		?>
		<nav id="mw-mf-page-left" class="navigation-drawer">
		<?php
		$this->renderMainMenuItems();
		?>
		</nav>
		<?php
	}

	/**
	 * Renders the contents of the main menu.
	 */
	protected function renderMainMenuItems() {
		?>
		<ul>
			<?php
				foreach ( $this->getDiscoveryTools() as $key => $val ) {
					echo $this->makeListItem( $key, $val );
				}
			?>
			</ul>
			<ul>
			<?php
				foreach ( $this->getPersonalTools() as $key => $val ){
					echo $this->makeListItem( $key, $val );
				}
			?>
			</ul>
			<ul class="hlist">
			<?php
				foreach ( $this->getSiteLinks() as $key => $val ) {
					echo $this->makeListItem( $key, $val );
				}
			?>
			</ul>
		<?php
	}

	/**
	 * Render Header elements
	 * @param array $data Data used to build the header
	 */
	protected function renderHeader( $data ) {
		$this->html( 'menuButton' );
		$this->makeChromeHeaderContent( $data );
		echo $data['secondaryButton'];
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
			<?php $this->renderMainMenu( $data ); ?>
			<div id="mw-mf-page-center">
				<?php
					foreach ( $this->data['banners'] as $banner ){
						echo $banner;
					}
				?>
				<div class="header">
					<?php
						$this->renderHeader( $data );
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
