<?php

namespace MobileFrontend\Transforms\Utils;

/**
 * Simple utility class for working with html styles as with key-value array
 */
class HtmlStyleUtils {
	/**
	 * Parse html `styles` string into kev-value array
	 *
	 * @param string $styleAttr Element or document to rewrite images in.
	 *
	 * @return array
	 */
	public static function parseStyleString( string $styleAttr ): array {
		if ( empty( $styleAttr ) ) {
			return [];
		}
		$styleStrings = preg_split( '/\;/', $styleAttr, -1, PREG_SPLIT_NO_EMPTY );
		$result = [];
		foreach ( $styleStrings as $styleString ) {
			$styleWithValue = explode( ':', $styleString );
			$style = trim( $styleWithValue[0] );
			if ( !empty( $style ) ) {
				$result[ $style ] = trim( $styleWithValue[1] ?? '' );
			}
		}
		return $result;
	}

	/**
	 * Forms style's string from kev-value array
	 *
	 * @param array $styles
	 *
	 * @return string
	 */
	public static function formStyleString( array $styles ): string {
		$styleString = '';
		foreach ( $styles as $style => $value ) {
			if ( empty( $value ) ) {
				$styleString .= $style . ';';

			} else {
				$styleString .= $style . ': ' . $value . ';';
			}
		}
		return $styleString;
	}

	/**
	 * Filters style key-value array by list of allowed styles, appending them by
	 * list of additional styles
	 *
	 * @param array $styles key-value array of html styles
	 * @param string[] $allowedStyles list of allowed styles
	 * @param array $additional key-value array of additional styles should be added in front of list
	 *
	 * @return array
	 */
	public static function filterAllowedStyles( array $styles, array $allowedStyles, array $additional ): array {
		return $additional + array_intersect_key(
			$styles,
			array_fill_keys( $allowedStyles, '' )
		);
	}
}
