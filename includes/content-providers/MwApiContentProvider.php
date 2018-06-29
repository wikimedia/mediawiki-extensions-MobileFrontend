<?php

namespace MobileFrontend\ContentProviders;

use OutputPage;

class MwApiContentProvider implements IContentProvider {
	/**
	 * @var string
	 */
	private $baseUrl;

	/**
	 * @var OutputPage
	 */
	private $out;

	/**
	 * @var string
	 */
	private $skinName;

	/**
	 * @param string $baseUrl for the MediaWiki API to be used minus query string e.g. /w/api.php
	 * @param OutputPage $out so that the ResourceLoader modules specific to the page can be added
	 * @param string $skinName the skin name the content is being provided for
	 */
	public function __construct( $baseUrl, OutputPage $out, $skinName ) {
		$this->baseUrl = $baseUrl;
		$this->out = $out;
		$this->skinName = $skinName;
	}

	/**
	 * @inheritDoc
	 */
	public function getHTML() {
		$out = $this->out;
		$title = $out->getTitle();
		$query = 'action=parse&prop=text|modules|langlinks&page=';
		$url = $this->baseUrl . '?formatversion=2&format=json&' . $query;
		$url .= rawurlencode( $title->getPrefixedDBKey() );
		$url .= '&useskin=' . $this->skinName;

		$resp = file_get_contents( $url, false );
		$json = json_decode( $resp, true );
		if ( !is_bool( $json ) && array_key_exists( 'parse', $json ) ) {
			$parse = $json['parse'];

			$out->addModules( $parse['modules'] );
			$out->addModuleStyles( $parse['modulestyles'] );
			// Forward certain variables so that the page is not registered as "missing"
			$out->addJsConfigVars( [
				'wgArticleId' => $parse['pageid'],
			] );
			if ( array_key_exists( 'langlinks', $parse ) ) {
				$langlinks = [];
				foreach ( $parse['langlinks'] as $lang ) {
					$langlinks[] = ':' . $lang['lang'] . ':' . $lang['title'];
				}
				$out->setLanguageLinks( $langlinks );
			}
			return $parse['text'];
		} else {
			return '';
		}
	}
}
