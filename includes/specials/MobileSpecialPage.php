<?php

class MobileSpecialPage extends SpecialPage {
	/**
	 * @var bool: Whether this special page should appear on Special:SpecialPages
	 */
	protected $listed = false;
	/**
	 * @var bool: Whether the special page's content should be wrapped in div.content
	 */
	protected $unstyledContent = true;

	public function setHeaders() {
		parent::setHeaders();
		$this->addModules();

		if ( $this->unstyledContent ) {
			$this->getOutput()->setProperty( 'unstyledContent', true );
		}
	}

	protected function addModules() {
		$out = $this->getOutput();
		$rl = $out->getResourceLoader();
		$title = $this->getTitle();
		list( $name, /* $subpage */ ) = SpecialPageFactory::resolveAlias( $title->getDBkey() );
		$id = strtolower( $name );
		// FIXME: These names should be more specific
		$specialStyleModuleName = 'mobile.' . $id . '.styles';
		$specialScriptModuleName = 'mobile.' . $id . '.scripts';

		if ( $rl->getModule( $specialStyleModuleName ) ) {
			$out->addModuleStyles( $specialStyleModuleName );
		}

		if ( $rl->getModule( $specialScriptModuleName ) ) {
			$out->addModules( $specialScriptModuleName );
		}
	}

	public function isListed() {
		return $this->listed;
	}
}
