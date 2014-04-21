<?php

class SpecialMobileWebApp extends MobileSpecialPage {
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

	/**
	 * Given HTML markup searches for URLs inside elements
	 * FIXME: Refactor OutputPage in MediaWiki core so this is unnecessary
	 * @param string $html
	 * @param string $tag A tag to extract URLs from (e.g. 'link' or 'script')
	 * @param string $attr An attribute to find the URL (e.g. 'href' or 'src')
	 * @return array of urls
	 */
	private function extractUrls( $html, $tag, $attr ) {
		$doc = new DOMDocument();
		$doc->loadHTML( $html );
		$links = $doc->getElementsByTagName( $tag );
		$urls = array();
		foreach( $links as $link ) {
			$val = $link->getAttribute( $attr );
			if ( $val ) {
				$urls[] = $val;
			}
		}
		return $urls;
	}

	/**
	 * Utility function to get relative path part of the URL.
	 * @param string $url The URL from which to extract the relative path
	 * @return string The relative path of the URL
	 */
	private function getRelativePath( $url ) {
		// first, let's try the easy way
		$parts = wfParseUrl( $url );
		// if that didn't work, let's try the standard way
		$parts = $parts ? $parts : parse_url( $url );
		return isset( $parts['path'] ) && isset( $parts['query'] ) ?
			$parts['path'] . '?' . $parts['query'] :
			$parts['path'];
	}

	/**
	 * Generates a cache manifest for the current skin
	 * that contains JavaScript start up URL, and the URLs
	 * for stylesheets in the page for use in an offline web
	 * application
	 * See: http://www.w3.org/TR/2011/WD-html5-20110525/offline.html
	 */
	private function genAppCache() {
		// This parameter currently hardcoded
		$target = 'mobile';

		$out = $this->getOutput();
		$out->setTarget( $target );
		$css = $out->buildCssLinks();
		$scriptUrls = implode( "\n", $this->extractUrls( $out->getHeadScripts(), 'script', 'src' ) );
		$scriptUrls = $this->getRelativePath( $scriptUrls );
		$styleUrls = implode( "\n", $this->extractUrls( $css, 'link', 'href' ) );
		$styleUrls = $this->getRelativePath( $styleUrls );
		$rl = $out->getResourceLoader();
		$styles = $out->getModuleStyles();
		$ctx = new ResourceLoaderContext( $rl, new FauxRequest() );

		$fr = new FauxRequest( array(
			'debug' => false,
			'lang' => $this->getLanguage()->getCode(),
			'modules' => 'startup',
			'only' => 'scripts',
			'skin' => $out->getSkin()->getSkinName(),
			'target' => $out->getTarget(),
		));
		$startupCtx = new ResourceLoaderContext( new ResourceLoader(), $fr );

		$startupUrl = ResourceLoaderStartUpModule::getStartupModulesUrl( $startupCtx );
		$startupUrl = $this->getRelativePath( $startupUrl );

		// Add a ts parameter for cachebusting when things change
		$urls = "\n$scriptUrls\n$styleUrls\n$startupUrl";
		// TODO: add timestamp components in checksum calculation?
		// Granted, it's used below. So maybe that's good enough,
		// at least if we're totally confident in the timestamp logic.
		// We'll just make it more user friendly in time.
		$checksum = sha1( $urls );
		$req = $this->getRequest();
		$resp = $req->response();
		$resp->header( 'Content-type: text/cache-manifest; charset=UTF-8' );
		$resp->header( 'Cache-Control: public, max-age=300, s-maxage=300' );
		$resp->header( "ETag: $checksum" );
		$localBasePath = dirname( __DIR__ );
		$ts = max(
			filemtime( "${localBasePath}/specials/SpecialMobileWebApp.php" ),
			filemtime( "${localBasePath}/skins/SkinMinervaApp.php" )
		);

		// TODO: validate timestamp checking. Some bugs don't manifest on
		// WMF production's PECL memcached backing, although it becomes
		// a problem with Redis (e.g., in MediaWiki-Vagrant) at the moment
		foreach( $styles as $name) {
			$module = $rl->getModule( $name );
			if ( $module ) {
				$lastModified = $module->getModifiedTime( $ctx );
				if ( $lastModified === $module->getDefinitionMtime( $ctx ) ) {
					// This means no caching is setup (see bug 59623)
					// round module changes to nearest 10 minutes
					// (shouldn't happen in production)
					$lastModified = $lastModified - ( $lastModified % 600 );
				}
				$ts = max( $ts, $lastModified );
			}
		}

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
