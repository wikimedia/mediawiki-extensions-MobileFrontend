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
	/** @var stringDescribes 'stability' of the skin - alpha, beta, stable */
	protected $mode = 'alpha';

	/**
	 * Get the needed styles for this skin
	 * @return array
	 */
	protected function getSkinStyles() {
		$styles = parent::getSkinStyles();
		$styles[] = 'mediawiki.ui.icon';
		$styles[] = 'skins.minerva.icons.styles';
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
	 * Get various skin specific configuration.
	 * @return array
	 */
	public function getSkinConfigVariables() {
		$vars = parent::getSkinConfigVariables();
		$vars['wgMFAnonymousEditing'] = true;
		return $vars;
	}
}
