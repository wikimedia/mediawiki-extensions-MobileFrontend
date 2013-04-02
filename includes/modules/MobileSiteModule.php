<?php
class MobileSiteModule extends ResourceLoaderSiteModule {
	protected $targets = array( 'mobile' );

	protected function getPages( ResourceLoaderContext $context ) {
		return array(
			'MediaWiki:Mobile.css' => array( 'type' => 'style' ),
			'MediaWiki:Mobile.js' => array( 'type' => 'script' ),
		);
	}

	public function getPosition() {
		return 'top';
	}
}
