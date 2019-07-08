<?php

use MobileFrontend\Transforms\LazyImageTransform;

/**
 * @group MobileFrontend
 */
class LazyImageTransformTest extends \MediaWikiUnitTestCase {
	public static function wrap( $html ) {
		return "<!DOCTYPE HTML>
<html><body>$html</body></html>
";
	}

	/**
	 * @dataProvider provideGetImageDimensions
	 *
	 * @param array $expected what we expect the dimensions to be.
	 * @param string $w value of width attribute (if any)
	 * @param string $h value of height attribute (if any)
	 * @param string $style value of style attribute (if any)
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::getImageDimensions
	 */
	public function testGetImageDimensions( $expected, $w, $h, $style ) {
		$mf = new LazyImageTransform();
		$doc = new DOMDocument();
		$img = $doc->createElement( 'img' );
		if ( $style ) {
			$img->setAttribute( 'style', $style );
		}
		if ( $w ) {
			$img->setAttribute( 'width', $w );
		}
		if ( $h ) {
			$img->setAttribute( 'height', $h );
		}
		$this->assertEquals( $expected, $mf->getImageDimensions( $img ) );
	}

	public function provideGetImageDimensions() {
		return [
			[
				[ 'width' => '500px', 'height' => '500px' ],
				'500',
				'500',
				''
			],
			[
				[ 'width' => '200px', 'height' => 'auto' ],
				'500',
				'500',
				'width: 200px; height: auto;'
			],
			[
				[ 'width' => '24.412ex', 'height' => '7.343ex' ],
				'500',
				'500',
				'width: 24.412ex; height: 7.343ex'
			],
			[
				[ 'width' => '24.412ex', 'height' => '7.343ex' ],
				'500',
				'500',
				'height: 7.343ex; width: 24.412ex'
			],
			[
				[ 'width' => '24.412ex', 'height' => '7.343ex' ],
				'500',
				'500',
				'height: 7.343ex; background-image: url(foo.jpg); width:    24.412ex   ; '
					. 'font-family: "Comic Sans";'
			],

			// <img src="..." alt="..." />
			[
				[],
				'',
				'',
				''
			]
		];
	}

	/**
	 * @dataProvider provideIsDimensionSmallerThanThreshold
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::isDimensionSmallerThanThreshold
	 */
	public function testIsDimensionSmallerThanThreshold( $dimension, $expected ) {
		$mf = new LazyImageTransform();
		$this->assertEquals( $expected, $mf->isDimensionSmallerThanThreshold( $dimension ) );
	}

	/**
	 * @see https://phabricator.wikimedia.org/T162623
	 */
	public function provideIsDimensionSmallerThanThreshold() {
		return [
			[ '40px', true ],
			[ '50px', true ],
			[ '57px', false ],
			[ '100ox', false ],
			[ '10', false ],
			[ '5.12ex', true ],
			[ '9.89ex', true ],
			[ '15.1ex', false ],
			[ '10in', false ],
			[ 'big', false ],
			[ '', false ]
		];
	}

	/**
	 * @dataProvider provideTransform
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::apply
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::doRewriteImagesForLazyLoading
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::getImageDimension
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::getImageDimensions
	 *
	 * @param string $html
	 * @param bool $skipSmallImages whether small images should be skipped
	 * @param string $expected
	 */
	public function testTransform( $html, $skipSmallImages, $expected, $explanation ) {
		$transform = new LazyImageTransform( $skipSmallImages );
		$doc = new DOMDocument();
		$doc->loadHTML( self::wrap( $html ) );
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals( $doc->saveHTML(), self::wrap( $expected ), $explanation );
	}

	public function provideTransform() {
		$img = '<img src="kitty.jpg" width="500" height="400">';
		$placeholder = '<span class="lazy-image-placeholder" style="width: 500px;height: 400px;" '
			. 'data-src="kitty.jpg" data-width="500" data-height="400">&nbsp;</span>';
		$imgStyle = '<img src="bigPicture.jpg" style="vertical-align: -3.505ex; '
			. 'width: 84.412ex; height:70.343ex; background:none;">';
		$placeholderStyle = '<span class="lazy-image-placeholder" '
			. 'style="width: 84.412ex;height: 70.343ex;" '
			. 'data-src="bigPicture.jpg">&nbsp;</span>';
		$imgSmall = '<img src="kitty.jpg" width="5" height="5">';
		$placeholderSmall = '<span class="lazy-image-placeholder" style="width: 5px;height: 5px;" '
			. 'data-src="kitty.jpg" data-width="5" data-height="5">&nbsp;</span>';
		return [
			[
				"$img",
				false,
				"<noscript>$img</noscript>$placeholder",
				'Images are wrapped in noscript and attached lazy image placeholder'
			],
			[
				"$img",
				true,
				"<noscript>$img</noscript>$placeholder",
				'Images are wrapped in noscript and attached lazy image placeholder'
			],
			[
				"$imgStyle",
				false,
				"<noscript>$imgStyle</noscript>$placeholderStyle",
				"Dimension styles are copied to sthe placeholder"
			],
			[
				"$imgSmall",
				true,
				"$imgSmall",
				"Small images are skipped"
			],
			[
				"$imgSmall",
				false,
				"<noscript>$imgSmall</noscript>$placeholderSmall",
				"Small images are not skipped when flag is passed"
			]
		];
	}
}
