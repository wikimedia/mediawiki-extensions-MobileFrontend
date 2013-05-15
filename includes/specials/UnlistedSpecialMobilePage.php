<?php
class UnlistedSpecialMobilePage extends UnlistedSpecialPage {

	public function setHeaders() {
		parent::setHeaders();
		$this->clearPageMargins();
		$this->addModules();
	}

	protected function addModules() {
		global $wgResourceModules;
		$out = $this->getOutput();
		$title = $this->getTitle();
		list( $name, /* $subpage */ ) = SpecialPageFactory::resolveAlias( $title->getDBkey() );
		$id = strtolower( $name );
		$specialStyleModuleName = 'mobile.' . $id . '.styles';
		$specialScriptModuleName = 'mobile.' . $id . '.scripts';

		if ( isset( $wgResourceModules[ $specialStyleModuleName ] ) ) {
			$out->addModuleStyles( $specialStyleModuleName );
		}

		if ( isset( $wgResourceModules[ $specialScriptModuleName ] ) ) {
			$out->addModules( $specialScriptModuleName );
		}
	}

	protected function clearPageMargins() {
		$this->getOutput()->setProperty( 'bodyClassName', 'no-margins' );
	}
}
