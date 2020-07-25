<?php

namespace MobileFrontend\Transforms;

use DOMDocument;
use DOMElement;

class LazyImageTransform implements IMobileTransform {

	/**
	 * Do not lazy load images smaller than this size (in pixels)
	 */
	const SMALL_IMAGE_DIMENSION_THRESHOLD_IN_PX = 50;

	/**
	 * Do not lazy load images smaller than this size (in relative to x-height of the current font)
	 */
	const SMALL_IMAGE_DIMENSION_THRESHOLD_IN_EX = 10;

	/**
	 * Whether to skip the loading of small images
	 * @var bool
	 */
	protected $skipSmall;

	/**
	 * @param bool $skipSmallImages whether small images should be excluded from lazy loading
	 */
	public function __construct( $skipSmallImages = false ) {
		$this->skipSmall = $skipSmallImages;
	}

	/**
	 * Insert a table of content placeholder into the element
	 * which will be progressively enhanced via JS
	 * @param DOMElement $node to be transformed
	 */
	public function apply( DOMElement $node ) {
		$this->doRewriteImagesForLazyLoading( $node, $node->ownerDocument );
	}

	/**
	 * @see MobileFormatter#getImageDimensions
	 *
	 * @param DOMElement $img
	 * @param string $dimension Either "width" or "height"
	 * @return string|null
	 */
	private function getImageDimension( DOMElement $img, $dimension ) {
		$style = $img->getAttribute( 'style' );
		$numMatches = preg_match( "/.*?{$dimension} *\: *([^;]*)/", $style, $matches );

		if ( !$numMatches && !$img->hasAttribute( $dimension ) ) {
			return null;
		}

		return $numMatches
			? trim( $matches[1] )
			: $img->getAttribute( $dimension ) . 'px';
	}

	/**
	 * Determine the user perceived width and height of an image element based on `style`, `width`,
	 * and `height` attributes.
	 *
	 * As in the browser, the `style` attribute takes precedence over the `width` and `height`
	 * attributes. If the image has no `style`, `width` or `height` attributes, then the image is
	 * dimensionless.
	 *
	 * @param DOMElement $img <img> element
	 * @return array with width and height parameters if dimensions are found
	 */
	public function getImageDimensions( DOMElement $img ) {
		$result = [];

		foreach ( [ 'width', 'height' ] as $dimensionName ) {
			$dimension = $this->getImageDimension( $img, $dimensionName );

			if ( $dimension ) {
				$result[$dimensionName] = $dimension;
			}
		}

		return $result;
	}

	/**
	 * Is image dimension small enough to not lazy load it
	 *
	 * @param string $dimension in css format, supports only px|ex units
	 * @return bool
	 */
	public function isDimensionSmallerThanThreshold( $dimension ) {
		$matches = null;
		if ( preg_match( '/(\d+)(\.\d+)?(px|ex)/', $dimension, $matches ) === 0 ) {
			return false;
		}

		$size = $matches[1];
		$unit = array_pop( $matches );

		switch ( strtolower( $unit ) ) {
			case 'px':
				return $size <= self::SMALL_IMAGE_DIMENSION_THRESHOLD_IN_PX;
			case 'ex':
				return $size <= self::SMALL_IMAGE_DIMENSION_THRESHOLD_IN_EX;
			default:
				return false;
		}
	}

	/**
	 * @param array $dimensions
	 * @return bool
	 */
	private function skipLazyLoadingForSmallDimensions( array $dimensions ) {
		if ( array_key_exists( 'width', $dimensions )
			&& $this->isDimensionSmallerThanThreshold( $dimensions['width'] )
		) {
			return true;
		}
		if ( array_key_exists( 'height', $dimensions )
			&& $this->isDimensionSmallerThanThreshold( $dimensions['height'] )
		) {
			return true;
		}
		return false;
	}

	/**
	 * Enables images to be loaded asynchronously
	 *
	 * @param DOMElement|DOMDocument $el Element or document to rewrite images in.
	 * @param DOMDocument $doc Document to create elements in
	 */
	private function doRewriteImagesForLazyLoading( $el, DOMDocument $doc ) {
		$lazyLoadSkipSmallImages = $this->skipSmall;

		foreach ( $el->getElementsByTagName( 'img' ) as $img ) {
			$parent = $img->parentNode;
			$dimensions = $this->getImageDimensions( $img );
			$hasCompleteDimensions = isset( $dimensions['width'] ) && isset( $dimensions['height'] );

			if ( $lazyLoadSkipSmallImages
				&& $this->skipLazyLoadingForSmallDimensions( $dimensions )
			) {
				continue;
			}
			// T133085 - don't transform if we have no idea about dimensions of image
			if ( !$hasCompleteDimensions ) {
				continue;
			}

			// HTML only clients
			$noscript = $doc->createElement( 'noscript' );

			// To be loaded image placeholder
			$imgPlaceholder = $doc->createElement( 'span' );
			$imgPlaceholder->setAttribute( 'class', 'lazy-image-placeholder' );

			$styles = $this->parseStyleString(
				$img->hasAttribute( 'style' ) ? $img->getAttribute( 'style' ) : ''
			);

			$allowedStyles = $this->filterAllowedStyles(
				$styles,
				[
					// T207929
					'vertical-align'
				]
			);
			$allowedStyles['width'] = $dimensions['width'];
			$allowedStyles['height'] = $dimensions['height'];

			$imgPlaceholder->setAttribute( 'style', $this->formStyleString( $allowedStyles ) );
			foreach ( [ 'src', 'alt', 'width', 'height', 'srcset', 'class', 'usemap' ] as $attr ) {
				if ( $img->hasAttribute( $attr ) ) {
					$imgPlaceholder->setAttribute( "data-$attr", $img->getAttribute( $attr ) );
				}
			}
			// Assume data saving and remove srcset attribute from the non-js experience
			$img->removeAttribute( 'srcset' );

			// T145222: Add a non-breaking space inside placeholders to ensure that they do not report
			// themselves as invisible when inline.
			$imgPlaceholder->appendChild( $doc->createEntityReference( 'nbsp' ) );

			// Set the placeholder where the original image was
			$parent->replaceChild( $imgPlaceholder, $img );
			// Add the original image to the HTML only markup
			$noscript->appendChild( $img );
			// Insert the HTML only markup before the placeholder
			$parent->insertBefore( $noscript, $imgPlaceholder );
		}
	}

	/**
	 * Parse html `styles` string into kev-value array
	 *
	 * @param string $styleAttr Element or document to rewrite images in.
	 *
	 * @return array
	 */
	private function parseStyleString( string $styleAttr ): array {
		if ( empty( $styleAttr ) ) {
			return [];
		}
		$styleStrings = explode( ';', $styleAttr );
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
	private function formStyleString( array $styles ): string {
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
	 * Filters styles key-value array by list of allowed styles
	 *
	 * @param array $styles key-value array of html styles
	 * @param string[] $allowedStyles list of allowed styles
	 *
	 * @return array
	 */
	private function filterAllowedStyles( array $styles, array $allowedStyles ): array {
		return array_filter(
			$styles,
			function ( $key ) use ( $allowedStyles ) {
				return in_array( $key, $allowedStyles );
			},
			ARRAY_FILTER_USE_KEY
		);
	}
}
