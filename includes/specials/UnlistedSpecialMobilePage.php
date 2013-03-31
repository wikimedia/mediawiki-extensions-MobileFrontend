<?php
class UnlistedSpecialMobilePage extends UnlistedSpecialPage {

	public function __construct( $name, $restriction = '', $function = false, $file = 'default' ) {
		parent::__construct( $name, $restriction, false, $function, $file );
		$this->clearPageMargins();
		$this->addModules( $name );
	}

	public function addModules( $name ) {
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

	public function clearPageMargins() {
		$ctx = MobileContext::singleton();
		$this->getOutput()->setProperty( 'bodyClassName', 'no-margins' );
	}
}
