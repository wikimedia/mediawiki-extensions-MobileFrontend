<?php
/**
 * MinervaTemplateBeta.php
 */

/**
 * Alternative Minerva template sent to users who have opted into the
 * beta mode via Special:MobileOptions
 */
class MinervaTemplateBeta extends MinervaTemplate {
	/** {@inheritdoc} */
	protected $renderHistoryLinkBeforeContent = false;
	/**
	 * @var string $searchPlaceHolderMsg Message used as placeholder in search input
	 */
	protected $searchPlaceHolderMsg = 'mobile-frontend-placeholder-beta';

	/**
	 * Render available page actions
	 * @param array $data Data used to build page actions
	 */
	public function renderPageActions( $data ) {
		if ( !$this->isMainPage ) {
			parent::renderPageActions( $data );
		}
	}

	/**
	 * Get page secondary actions
	 */
	protected function getSecondaryActions() {
		$donationUrl = $this->getSkin()->getMFConfig()->get( 'MFDonationUrl' );

		$result = parent::getSecondaryActions();

		if ( $donationUrl && !$this->isSpecialPage ) {
			$result['donation'] = array(
				'attributes' => array(
					'href' => $donationUrl,
				),
				'label' => wfMessage( 'mobile-frontend-donate-button-label' )->text()
			);
		}
		return $result;
	}

	/**
	 * Renders the list of page actions and then the title of the page in its
	 * container to keep LESS changes to a minimum.
	 *
	 * @param array $data
	 */
	protected function renderPreContent( $data ) {
		$internalBanner = $data[ 'internalBanner' ];
		$preBodyText = isset( $data['prebodytext'] ) ? $data['prebodytext'] : '';

		if ( $internalBanner || $preBodyText ) {

			?>
			<div class="pre-content">
				<?php
				if ( !$this->isSpecialPage ) {
					$this->renderPageActions( $data );
				}
				echo $preBodyText;
				// FIXME: Temporary solution until we have design
				if ( isset( $data['_old_revision_warning'] ) ) {
					echo $data['_old_revision_warning'];
				}
				echo $internalBanner;
				?>
			</div>
			<?php
		}
	}

	/**
	 * @inheritdoc
	 * Renders a search link and branding.
	 */
	protected function makeChromeHeaderContent( $data ) {
		$templateParser = new TemplateParser( __DIR__ .'/../../templates' );
		$args = array(
			'siteName' => SkinMinerva::getSitename(),
			'showSearchForm' => $this->isSpecialMobileMenuPage,
			'showTitle' => !$this->isSpecialMobileMenuPage,
		);

		if ( $this->isSpecialMobileMenuPage ) {
			$args += array(
				'mobileMenuClass' => 'js-only back ' . MobileUI::iconClass( 'back' ),
				'mobileMenuLink' => '#back',
				'mobileMenuTitle' => wfMessage( 'mobile-frontend-main-menu-back' )->parse(),
				'searchForm' => $this->makeSearchForm( $data ),
			);
		} else {
			$args += array(
				'mobileMenuClass' => MobileUI::iconClass( 'search' ),
				'mobileMenuLink' => SpecialPage::getTitleFor( 'MobileMenu' )->getLocalUrl(),
				'mobileMenuTitle' => wfMessage( 'mobile-frontend-main-menu' )->parse(),
				'searchInputClass' => 'hidden',
			);
		}

		echo $templateParser->processTemplate( 'header', $args );
	}

	protected function getSearchAttributes() {
		$searchAttributes = parent::getSearchAttributes();
		$searchAttributes['class'] = MobileUI::iconClass( 'search', 'before', 'search' );

		return $searchAttributes;
	}

	/**
	 * Render Header elements
	 * @param array $data Data used to build the header
	 */
	protected function renderHeader( $data ) {
		$this->makeChromeHeaderContent( $data );
		echo $data['secondaryButton'];
	}

	protected function renderMainMenu( $data ) {
		$class = $this->isSpecialMobileMenuPage ? '' : ' hidden';

		?>
		<nav class="<?php echo $class; ?>">
		<?php
		$this->renderMainMenuItems();
		?>
		</nav>
		<?php
	}

	/**
	 * Renders the page.
	 *
	 * The menu is included and hidden by default.
	 *
	 * @param array $data Data used to build the page
	 */
	protected function render( $data ) {
		echo $data[ 'headelement' ];
		?>
		<div id="mw-mf-viewport">
			<div class="header">
				<?php $this->renderHeader( $data ); ?>
			</div>
			<?php $this->renderMainMenu( $data ); ?>
			<div id="mw-mf-page-center">
				<?php
					foreach ( $this->data['banners'] as $banner ):
						echo $banner;
					endforeach;
				?>
				<div id="content_wrapper">
					<?php $this->renderContentWrapper( $data ); ?>
				</div>
				<?php $this->renderFooter( $data ); ?>
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
