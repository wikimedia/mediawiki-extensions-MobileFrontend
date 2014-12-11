<?php
/**
 * SkinMinervaAlpha.php
 */

/**
 * Alpha-Implementation of stable class SkinMinervaBeta
 */
class SkinMinervaAlpha extends SkinMinervaBeta {
	/** @var string Name of the template */
	public $template = 'MinervaTemplateAlpha';
	/** @var string Describes 'stability' of the skin - alpha, beta, stable */
	protected $mode = 'alpha';

	/** @inheritdoc **/
	protected function getHeaderHtml() {
		$html = parent::getHeaderHtml();
		$vars = $this->getSkinConfigVariables();
		$description = $vars['wgMFDescription'];
		if ( $description && !$this->getTitle()->isSpecialPage() ) {
			$html .= Html::element( 'div',
				array(
					'class' => 'tagline',
				), $description );
		}
		return $html;
	}

	/**
	 * Get the needed styles for this skin
	 * @return array
	 */
	protected function getSkinStyles() {
		$styles = parent::getSkinStyles();
		$styles[] = 'mediawiki.ui.icon';
		$styles[] = 'skins.minerva.icons.styles';
		$styles[] = 'skins.minerva.alpha.styles';
		return $styles;
	}

	/**
	 * Returns the javascript modules to load.
	 * @return array
	 */
	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		$modules['alpha'] = array( 'mobile.alpha' );

		if ( $this->getCategoryLinks( false ) ) {
			$modules['categories'] = array( 'mobile.categories' );
		}
		return $modules;
	}

	/**
	 * Creates element relating to secondary button
	 * Unlike method in stable adds span outside the link element.
	 * @param string $title Title attribute value of secondary button
	 * @param string $url of secondary button
	 * @param string $spanLabel text of span associated with secondary button.
	 * @param string $spanClass the class of the secondary button
	 * @return string html relating to button
	 */
	protected function createSecondaryButton( $title, $url, $spanLabel, $spanClass ) {
		return Html::element( 'a', array(
				'title' => $title,
				'href' => $url,
				'class' => MobileUI::iconClass( 'notifications', 'element',
					'user-button main-header-button icon-32px' ),
				'id' => 'secondary-button',
			) ) .
			Html::element(
				'span',
				array( 'class' => $spanClass ),
				$spanLabel
			);
	}

	/**
	 * Returns an array of sitelinks to add into the main menu footer.
	 * @return Array array of site links
	 */
	protected function getSiteLinks() {
		$urls = parent::getSiteLinks();
		$msg = $this->msg( 'mobile-frontend-fontchanger-link' );
		// Don't add elements, where the message does not exist
		if ( !$msg->isDisabled() ) {
			$urls[] = array(
				'href' => '#',
				'text'=> $msg->text(),
				// hide the link, fontchanger works only with JS enabled (hidden will be removed with JS)
				'class' => 'fontchanger link hidden'
			);
		}

		return $urls;
	}

	/**
	 * Get various skin specific configuration.
	 * @return array
	 */
	public function getSkinConfigVariables() {
		$vars = parent::getSkinConfigVariables();
		$vars['wgMFEditorOptions']['anonymousEditing'] = true;
		$vars['wgMFDescription'] = $this->getOutput()->getProperty( 'wgMFDescription' );
		return $vars;
	}

	/**
	 * {@inheritdoc}
	 */
	protected function getDiscoveryTools() {
		global $wgMFEnableWikiGrok, $wgMFEnableWikiGrokInSidebar, $wgMFEnableWikiGrokForAnons;

		$items = parent::getDiscoveryTools();
		if (
			$wgMFEnableWikiGrok &&
			$wgMFEnableWikiGrokInSidebar &&
			($this->getUser()->isLoggedIn() || $wgMFEnableWikiGrokForAnons)
		) {
			$items['wikigrok'] = array(
				'links' => array(
					array(
						'text' => 'WikiGrok',
						'href' => '#',
						'class' => MobileUI::iconClass( 'wikigrok', 'before',
							'wikigrok-roulette' ),
					),
				),
				'class' => 'jsonly'
			);
		}
		return $items;
	}
}
