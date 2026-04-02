<?php

namespace MobileFrontend\Tests;

use Wikimedia\Parsoid\Core\DOMCompat;
use Wikimedia\Parsoid\DOM\Element;
use Wikimedia\Parsoid\DOM\HTMLDocument;
use Wikimedia\Parsoid\Ext\DOMUtils;

/**
 * Class with utility methods for MF tests.
 */
class Utils {
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
