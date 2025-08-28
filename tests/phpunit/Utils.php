<?php

namespace MobileFrontend\Tests;

use Wikimedia\Parsoid\DOM\Element;
use Wikimedia\Parsoid\DOM\HTMLDocument;
use Wikimedia\Parsoid\Utils\DOMCompat;
use Wikimedia\Parsoid\Utils\DOMUtils;

/**
 * Class with utility methods for MF tests.
 */
class Utils {
	/**
	 * Used as test value for $wgMobileUrlCallback in MobileContextTest and MobileFrontendHooksTest.
	 *
	 * This is a copy of Wikimedia's mobile URL callback, but the logic of the callback
	 * itself is tested in the operations/mediawiki-config repo so the tests here don't
	 * need to cover that.
	 *
	 * @param string $domain
	 * @return string
	 */
	public static function mobileUrlCallback( string $domain ): string {
		switch ( $domain ) {
			case 'wikisource.org':
				return 'm.wikisource.org';
			case 'wikitech.wikimedia.org':
				return 'wikitech.wikimedia.org';
			case 'wikidata.beta.wmflabs.org':
				return 'm.wikidata.beta.wmflabs.org';
			case 'wikifunctions.beta.wmflabs.org':
				return 'm.wikifunctions.beta.wmflabs.org';
		}

		$domainParts = explode( '.', $domain );
		if ( $domainParts[0] === 'www' ) {
			$domainParts[0] = 'm';
		} else {
			array_splice( $domainParts, 1, 0, [ 'm' ] );
		}
		return implode( '.', $domainParts );
	}

	/**
	 * @param string $html
	 * @return Element
	 */
	public static function createBody( string $html ): Element {
		// T400401: Temporary workaround to ensure Parsoid DOM aliases
		// are loaded.
		class_exists( HTMLDocument::class );

		$doc = DOMUtils::parseHTML( $html );
		return DOMCompat::getBody( $doc );
	}

	/**
	 * @param Element $element
	 * @return string
	 */
	public static function getInnerHTML( Element $element ): string {
		return DOMCompat::getInnerHTML( $element );
	}

	/**
	 * @param string $html
	 * @return string
	 */
	public static function wrapSection( string $html ): string {
		return "<section>$html</section>";
	}

	/**
	 * @param string $html
	 * @return string
	 */
	public static function wrapParserOutput( string $html ): string {
		return "<div class=\"mw-parser-output\">$html</div>";
	}

}
