<?php
class UnlistedSpecialMobilePage extends UnlistedSpecialPage {

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
}
