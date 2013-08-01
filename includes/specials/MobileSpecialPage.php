<?php

class MobileSpecialPage extends SpecialPage {
	/**
	 * @var bool: Whether this special page should appear on Special:SpecialPages
	 */
	protected $listed = false;

	public function setHeaders() {
		parent::setHeaders();
		$this->clearPageMargins();
		$this->addModules();
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

	protected function clearPageMargins() {
		$this->getOutput()->setProperty( 'bodyClassName', 'no-margins' );
	}

	public function isListed() {
		return $this->listed;
	}
}
