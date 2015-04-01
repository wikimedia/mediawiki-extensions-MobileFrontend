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

	/**
	 * Returns the javascript modules to load.
	 * @return array
	 */
	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		$modules['alpha'] = array( 'skins.minerva.alpha.scripts' );

		if ( $this->getCategoryLinks( false ) ) {
			$modules['categories'] = array( 'mobile.categories' );
		}
		return $modules;
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
		$config = $this->getMFConfig();

		$vars = parent::getSkinConfigVariables();
		$vars['wgWikiBasePropertyConfig'] = $config->get( 'WikiBasePropertyConfig' );
		$vars['wgMFInfoboxConfig'] = $config->get( 'MFInfoboxConfig' );
		$vars['wgMFShowRedLinks'] = true;

		return $vars;
	}
}
