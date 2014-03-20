<?php

class SpecialMobileWebApp extends MobileSpecialPage {
	protected $disableSearchAndFooter = false;
	public function __construct() {
		parent::__construct( 'MobileWebApp' );
	}

	public function executeWhenAvailable( $par ) {
		if ( $par === 'manifest' ) {
			$this->generateManifest();
		} else {
			$out = $this->getOutput();
			$out->addModules( 'mobile.special.app.scripts' );
			$out->setPageTitle( $this->msg( 'mobile-frontend-app-title' )->escaped() );
		}
	}

	public function generateManifest() {
		$this->getOutput()->disable();
		$this->genAppCache();
	}

	private function genAppCache() {
		$urls = "# Manifest URLs will be listed here.\n";
		$checksum = sha1( $urls );
		$req = $this->getRequest();
		$resp = $req->response();
		$resp->header( 'Content-type: text/cache-manifest; charset=UTF-8' );
		$resp->header( 'Cache-Control: public, max-age=300, s-max-age=300' );
		$resp->header( "ETag: $checksum" );
		$localBasePath = dirname( __DIR__ );
		$ts = max(
			filemtime( "${localBasePath}/specials/SpecialMobileWebApp.php" ),
			filemtime( "${localBasePath}/skins/SkinMinervaApp.php" )
		);
		echo <<<HTML
CACHE MANIFEST

# Last modified ${ts}
NETWORK:
*

HTML;

		echo <<<HTML

CACHE:
{$urls}

# {$checksum}

HTML;
	}
}
