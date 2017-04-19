<?php

namespace MobileFrontend\ContentProviders;

use MobileFrontend\ContentProviders\IContentProvider;
use OutputPage;

class MwApiContentProvider implements IContentProvider {
	protected $html = '';

	/**
	 * Constructor
	 *
	 * @param string $baseUrl for the MediaWiki API to be used minus query string e.g. /w/api.php
	 * @param OutputPage $out so that the ResourceLoader modules specific to the page can be added
	 */
	public function __construct( $baseUrl, OutputPage $out ) {
		$this->baseUrl = $baseUrl;
		$this->out = $out;
	}

	/**
	 * @inheritdoc
	 */
	public function getHTML() {
		$out = $this->out;
		$title = $out->getTitle();
		$url = $this->baseUrl . '?formatversion=2&format=json&action=parse&prop=text|modules&page=';
		$url .= $title->getPrefixedDBKey();

		$resp = file_get_contents( $url, false );
		$json = json_decode( $resp, true );
		if ( !is_bool( $json ) && array_key_exists( 'parse', $json ) ) {
			$parse = $json['parse'];

			$out->addModules( $parse['modules'] );
			$out->addModuleStyles( $parse['modulestyles'] );

			return $parse['text'];
		} else {
			return '';
		}
	}
}
