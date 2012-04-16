<?php

class SkinMobile extends SkinTemplate {

	public $skinname = 'SkinMobile';
	public $stylename = 'SkinMobile';
	public $extMobileFrontend;

	public function __construct( ExtMobileFrontend &$extMobileFrontend ) {
		$this->setContext( $extMobileFrontend );
		$this->extMobileFrontend = $extMobileFrontend;
	}

	function initPage( OutputPage $out ) {
		wfProfileIn( __METHOD__ );
		parent::initPage( $out );
		wfProfileOut( __METHOD__ );
	}

	function outputPage( OutputPage $out = null ) {
		wfProfileIn( __METHOD__ );
		$out = $this->getOutput();
		$out->setRobotpolicy( 'noindex,nofollow' );
		$this->extMobileFrontend->beforePageDisplayHTML( $out );
		echo $this->extMobileFrontend->DOMParse( $out );
		wfProfileOut( __METHOD__ );
	}
}