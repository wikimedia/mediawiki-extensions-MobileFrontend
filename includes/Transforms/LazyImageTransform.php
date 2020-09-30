<?php

namespace MobileFrontend\Transforms;

use DOMDocument;
use DOMElement;
use MobileFrontend\Transforms\Utils\HtmlClassUtils;
use MobileFrontend\Transforms\Utils\HtmlStyleUtils;

class LazyImageTransform implements IMobileTransform {

	/**
	 * Do not lazy load images smaller than this size (in pixels)
	 */
	private const SMALL_IMAGE_DIMENSION_THRESHOLD_IN_PX = 50;

	/**
	 * Do not lazy load images smaller than this size (in relative to x-height of the current font)
	 */
	private const SMALL_IMAGE_DIMENSION_THRESHOLD_IN_EX = 10;

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
	 *
	 * @param DOMElement $node to be transformed
	 */
	public function apply( DOMElement $node ) {
		$sections = $node->getElementsByTagName( 'section' );
		$sectionNumber = 0;
		foreach ( $sections as $sectionNumber => $section ) {
			if ( $sectionNumber > 0 ) {
				$this->doRewriteImagesForLazyLoading( $section, $section->ownerDocument );
			}
			$sectionNumber++;
		}
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
			$this->copyClasses(
				$img,
				$imgPlaceholder,
				[
					// T199351
					'thumbborder'
				],
				[
					'lazy-image-placeholder',
				]
			);

			$this->copyStyles(
				$img,
				$imgPlaceholder,
				[
					// T207929
					'vertical-align'
				],
				[
					'width' => $dimensions['width'],
					'height' => $dimensions['height'],
				]
			);
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
	 * Copy allowed styles from one HTMLElement to another, filtering them and
	 * unconditionally adding several in front of list
	 *
	 * @param DOMElement|DOMDocument $from html element styles to be copied from
	 * @param DOMElement|DOMDocument $to html element styles to be copied to
	 * @param string[] $enabled list of enabled styles to be copied
	 * @param array $additional key-value array of styles to be added/overriden unconditionally
	 *   at the beginning of string
	 *
	 */
	private function copyStyles( $from, $to, array $enabled, array $additional ) {
		$styles = HtmlStyleUtils::parseStyleString(
			$from->hasAttribute( 'style' ) ? $from->getAttribute( 'style' ) : ''
		);

		$filteredStyles = HtmlStyleUtils::filterAllowedStyles( $styles, $enabled, $additional );
		$to->setAttribute( 'style', HtmlStyleUtils::formStyleString( $filteredStyles ) );
	}

	/**
	 * Copy allowed classes from one HTMLElement to another
	 * @param DOMElement|DOMDocument $from html element classes to be copied from
	 * @param DOMElement|DOMDocument $to html element classes to be copied to
	 * @param string[] $enabled array of enabled classes to be copied
	 * @param string[] $additional array of classes to be added/overriden unconditionally
	 *   to the beginning
	 */
	private function copyClasses( $from, $to, array $enabled, array $additional ) {
		$styles = HtmlClassUtils::parseClassString(
			$from->hasAttribute( 'class' ) ? $from->getAttribute( 'class' ) : ''
		);

		$filteredClasses = HtmlClassUtils::filterAllowedClasses( $styles, $enabled, $additional );
		$to->setAttribute( 'class', HtmlClassUtils::formClassString( $filteredClasses ) );
	}

	/**
	 * Fallback for Grade C to load lazy-load image placeholders.
	 *
	 * Note: This will add a single repaint for Grade C browsers as
	 * images enter view but this is intentional and deemed acceptable.
	 *
	 * @return string The JavaScript code to load lazy placeholders in Grade C browsers
	 */
	public static function gradeCImageSupport() {
		// Notes:
		// * Document#getElementsByClassName is supported by IE9+ and #querySelectorAll is
		// supported by IE8+. To gain the widest possible browser support we scan for
		// noscript tags using #getElementsByTagName and look at the next sibling.
		// If the next sibling has the lazy-image-placeholder class then it will be assumed
		// to be a placeholder and replace with an img tag.
		// * Iterating over the live NodeList from getElementsByTagName() is suboptimal
		// but in IE < 9, Array#slice() throws when given a NodeList. It also requires
		// the 2nd argument ('end').
		$js = <<<JAVASCRIPT
(window.NORLQ = window.NORLQ || []).push( function () {
	var ns, i, p, img;
	ns = document.getElementsByTagName( 'noscript' );
	for ( i = 0; i < ns.length; i++ ) {
		p = ns[i].nextSibling;
		if ( p && p.className && p.className.indexOf( 'lazy-image-placeholder' ) > -1 ) {
			img = document.createElement( 'img' );
			img.setAttribute( 'src', p.getAttribute( 'data-src' ) );
			img.setAttribute( 'width', p.getAttribute( 'data-width' ) );
			img.setAttribute( 'height', p.getAttribute( 'data-height' ) );
			img.setAttribute( 'alt', p.getAttribute( 'data-alt' ) );
			p.parentNode.replaceChild( img, p );
		}
	}
} );
JAVASCRIPT;
		return $js;
	}
}
