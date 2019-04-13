<?php

namespace MobileFrontend\ContentProviders;

use FormatJson;
use MediaWiki\MediaWikiServices;
use Title;
use OutputPage;

/**
 * Sources content from the Mobile-Content-Service
 * This requires allow_url_fopen to be set.
 * @since
 */
class McsContentProvider implements IContentProvider {
	/** @var Title|null */
	private $title;
	/** @var OutputPage */
	private $out;
	/** @var string */
	private $baseUrl;

	/**
	 * @param string $baseUrl for the MediaWiki API to be used minus query string e.g. /w/api.php
	 * @param OutputPage $out
	 */
	public function __construct( $baseUrl, OutputPage $out ) {
		$this->baseUrl = $baseUrl;
		$this->out = $out;
		$this->title = $out->getTitle();
	}

	/**
	 * @param array $json response
	 * @return string
	 */
	protected function buildHtmlFromResponse( array $json ) {
		$lead = $json['lead'];
		$html = $lead['sections'][0]['text'] ?? '';

		$remaining = $json['remaining'];

		foreach ( $remaining['sections'] as $section ) {
			if ( isset( $section['line'] ) ) {
				$toc = $section['toclevel'] + 1;
				$line = $section['line'];
				$html .= "<h$toc>$line</h$toc>";
			}
			if ( isset( $section['text'] ) ) {
				$html .= $section['text'];
			}
		}
		return $html;
	}

	/**
	 * @param string $url URL to fetch the content
	 * @return string
	 */
	protected function fileGetContents( $url ) {
		$response = MediaWikiServices::getInstance()->getHttpRequestFactory()
			->create( $url );

		$status = $response->execute();
		if ( !$status->isOK() ) {
			return '';
		}

		return $response->getContent();
	}

	/**
	 * @inheritDoc
	 */
	public function getHTML() {
		$title = $this->title;
		if ( !$title ) {
			return '';
		}
		// Parsoid renders HTML incompatible with PHP parser and needs its own styles
		$this->out->addModuleStyles( 'mediawiki.skinning.content.parsoid' );

		$url = $this->baseUrl . '/page/mobile-sections/';
		$url .= urlencode( $title->getPrefixedDBkey() );

		$resp = $this->fileGetContents( $url );
		if ( $resp ) {
			$json = FormatJson::decode( $resp, true );
			if ( is_array( $json ) ) {
				return $this->buildHtmlFromResponse( $json );
			} else {
				return '';
			}
		} else {
			return '';
		}
	}
}
