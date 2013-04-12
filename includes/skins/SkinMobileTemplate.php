<?php

class SkinMobileTemplate extends MinervaTemplate {
	public function getMode() {
		$context = MobileContext::singleton();
		if ( $context->isAlphaGroupMember() ) {
			return 'alpha';
		} else if ( $context->isBetaGroupMember() ) {
			return 'beta';
		} else {
			return 'stable';
		}
	}

	public function getSearchPlaceholderText() {
		$mode = $this->getMode();
		if ( $mode === 'alpha' ) {
			return wfMessage( 'mobile-frontend-placeholder-alpha' )->escaped();
		} else if ( $mode === 'beta' ) {
			return wfMessage( 'mobile-frontend-placeholder-beta' )->escaped();
		} else {
			return wfMessage( 'mobile-frontend-placeholder' )->escaped();
		}
	}

	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct();
	}

	public function renderArticleSkin() {
		$languages = $this->getLanguages();
		$variants = $this->getLanguageVariants();
		$languageData = array(
			'heading' => wfMessage( 'mobile-frontend-language-article-heading' )->text(),
			'languages' => $languages,
			'variants' => $variants,
			'languageSummary' => wfMessage( 'mobile-frontend-language-header', count( $languages ) )->text(),
			'variantSummary' => count( $variants ) > 1 ? wfMessage( 'mobile-frontend-language-variant-header' )->text() : '',
		);
		?>
	<div class='show' id='content_wrapper'>
			<div id="content" class="content">
			<?php
				$this->html( 'prebodytext' );
				$this->html( 'bodytext' );
				$this->renderLanguages( $languageData );
				$this->html( 'postbodytext' );
			?>
			</div><!-- close #content -->
	</div><!-- close #content_wrapper -->
		<?php
		if ( !$this->data[ 'isSpecialPage' ] ) {
			$this->footer();
		} ?>
		<?php
			$this->navigationEnd();
	}

	public function execute() {
		parent::execute();
		$this->renderArticleSkin();
		$this->html( 'bottomScripts' ) ?>
	</body>
	</html><?php
	}

	public function navigationEnd() {
		//close #mw-mf-page-center then viewport;
		?>
		</div><!-- close #mw-mf-page-center -->
		</div><!-- close #mw-mf-viewport -->
		<?php
	}

	public function prepareData() {
		global $wgExtensionAssetsPath,
			$wgMobileFrontendLogo;
		$data = $this->data;

		wfProfileIn( __METHOD__ );
		$this->setRef( 'wgExtensionAssetsPath', $wgExtensionAssetsPath );
		$this->set( 'wgMobileFrontendLogo', $wgMobileFrontendLogo );

		if ( isset( $data['specialPageHeader'] ) ) {
			$this->set( 'header', $data['specialPageHeader'] );
		}
		wfProfileOut( __METHOD__ );
	}

	private function footer() {
		?>
		<div id="footer">
			<h2 id="section_footer">
				<?php $this->html( 'sitename' ); ?>
			</h2>
			<div id="content_footer">
		<?php
			foreach( $this->getFooterLinks() as $category => $links ):
		?>
				<ul class="footer-<?php echo $category; ?>">
					<?php foreach( $links as $link ): ?><li id="footer-<?php echo $category ?>-<?php echo $link ?>"><?php $this->html( $link ) ?></li><?php endforeach; ?>
				</ul>
			<?php endforeach; ?>
			</div>
		</div>
		<?php
	}

	public function getPersonalTools() {
		global $wgMFNearby;
		$data = $this->data;

		$items = array(
			'nearby' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-nearby' )->escaped(),
				'href' => $data['nearbyURL'],
				'class' => 'icon-nearby jsonly',
			),
			'watchlist' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-watchlist' )->escaped(),
				'href' => $data['watchlistUrl'],
				'class' => 'icon-watchlist jsonly',
			),
			'uploads' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-upload' )->escaped(),
				'href' => $data['donateImageUrl'],
				'class' => 'icon-uploads jsonly',
			),
			'settings' => array(
				'text' => wfMessage( 'mobile-frontend-main-menu-settings' )->escaped(),
				'href' => $data['settingsUrl'],
				'class' => 'icon-settings',
			),
			'auth' => array(
				'text' => $data['loginLogoutText'],
				'href' => $data['loginLogoutUrl'],
				'class' => 'icon-loginout jsonly',
			),
		);

		$nav = array();

		if ( $data['isBetaGroupMember'] && $wgMFNearby ) {
			$nav[] = $items['nearby'];
		}

		$nav[] = $items['watchlist'];
		$nav[] = $items['uploads'];

		$nav[] = $items['settings'];

		$nav[] = $items['auth'];
		return $nav;
	}

	public function getDiscoveryTools() {
		$data = $this->data;
		$items = array(
			'home' => array(
				'text' => wfMessage( 'mobile-frontend-home-button' )->escaped(),
				'href' => $data['mainPageUrl'],
				'class' => 'icon-home',
			),
			'random' => array(
				'text' => wfMessage( 'mobile-frontend-random-button' )->escaped(),
				'href' => $data['randomPageUrl'],
				'class' => 'icon-random',
				'id' => 'randomButton',
			),
		);

		return $items;
	}

	/**
	 * Returns an array of footerlinks trimmed down to only those footer links that
	 * are valid.
	 * $option currently unused in mobile
	 * @return array|mixed
	 */
	public function getFooterLinks( $option = null ) {
		return array(
			'notice' => array(
				'mobile-switcher',
				'mobile-notice',
			),
			'places' => array(
				'privacy',
				'about',
				'disclaimer',
			),
		);
	}
}
