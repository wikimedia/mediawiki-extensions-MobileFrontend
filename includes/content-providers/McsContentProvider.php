<?php

namespace MobileFrontend\ContentProviders;

use OutputPage;

/**
 * Sources content from the Mobile-Content-Service
 * This requires allow_url_fopen to be set.
 * @since
 */
class McsContentProvider implements IContentProvider {
	/** @var OutputPage */
	private $out;
	/** @var string */
	private $baseUrl;

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
	 * @param array $json response
	 * @return string
	 */
	protected function buildHtmlFromResponse( array $json ) {
		$lead = $json['lead'];
		$html = isset( $lead['sections'][0]['text'] ) ? $lead['sections'][0]['text'] : '';

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
	 * @inheritDoc
	 */
	public function getHTML() {
		$out = $this->out;
		$title = $out->getTitle();
		if ( !$title ) {
			return '';
		}
		$url = $this->baseUrl . '/page/mobile-sections/';
		$url .= urlencode( $title->getPrefixedDBKey() );
		// file_get_contents() will throw php warning when server returns 404. MCS will return 404
		// when article is not available, we're handling that case so we can safely ignore error
		// MediaWiki PHPCS forbids silencing errors but there is no other way to ignore 404 warning
		// @codingStandardsIgnoreLine
		$resp = @file_get_contents( $url, false );
		if ( $resp ) {
			$json = json_decode( $resp, true );
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
