<?php

namespace MobileFrontend\Transforms\Utils;

/**
 * Simple utility for working with html classes as with set
 */
class HtmlClassUtils {
	/**
	 * Parse html class string into set (array of string=>bool) where key is class name
	 * and values is always true
	 *
	 * @param string $classAttr raw `class` attribute's string retrieved from html
	 *
	 * @return array
	 */
	public static function parseClassString( string $classAttr ): array {
		$classes = preg_split( '/\s+/', $classAttr, -1, PREG_SPLIT_NO_EMPTY );
		return array_fill_keys( $classes, true );
	}

	/**
	 * Forms raw html `class` string from set of classes. Set is a key-value array where
	 * key is class name and value is boolean that determines wheather this class should be
	 * included to string or not.
	 *
	 *
	 * @param array $classes set of classes that should be formed into string
	 *
	 * @return string
	 */
	public static function formClassString( array $classes ): string {
		$enabled = array_filter(
			$classes,
			function ( $enabled ) {
				return $enabled;
			}
		);
		return implode( ' ', array_keys( $enabled ) );
	}

	/**
	 * Filters set of classes by list of allowed classes
	 *
	 * @param array $classes key-value array of html classes
	 * @param string[] $allowedClasses list of allowed classes
	 * @param string[] $additional list of additional styles should be added in front of list
	 *
	 * @return array
	 */
	public static function filterAllowedClasses( array $classes, array $allowedClasses, array $additional ): array {
		return array_fill_keys( $additional, true ) + array_intersect_key(
			$classes,
			array_fill_keys( $allowedClasses, true )
		);
	}
}
