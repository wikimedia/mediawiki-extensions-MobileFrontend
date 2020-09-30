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

	public static function wrapSection( $html ) {
		return "<section>$html</section>";
	}

	/**
	 * @param array $expected what we expect the dimensions to be.
	 * @param string $w value of width attribute (if any)
	 * @param string $h value of height attribute (if any)
	 * @param string $style value of style attribute (if any)
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::getImageDimensions
	 * @dataProvider provideGetImageDimensions
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
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::isDimensionSmallerThanThreshold
	 * @dataProvider provideIsDimensionSmallerThanThreshold
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
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::apply
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::doRewriteImagesForLazyLoading
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::getImageDimension
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::getImageDimensions
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::copyStyles
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::copyClasses
	 */
	public function testTransformFirstSection() {
		$img = '<img src="kitty.jpg" width="500" height="400">';

		$transform = new LazyImageTransform( false );
		libxml_use_internal_errors( true );
		$doc = new DOMDocument();

		$doc->loadHTML( self::wrap( self::wrapSection( $img ) ) );
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals(
			self::wrap( self::wrapSection( $img ) ),
			$doc->saveHTML(),
			"First section should be ignored"
		);
		libxml_clear_errors();
	}

	/**
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::apply
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::doRewriteImagesForLazyLoading
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::getImageDimension
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::getImageDimensions
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::copyStyles
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::copyClasses
	 */
	public function testTransformUnwrappedSection() {
		$img = '<img src="kitty.jpg" width="500" height="400">';

		$transform = new LazyImageTransform( false );
		libxml_use_internal_errors( true );
		$doc = new DOMDocument();

		$doc->loadHTML( self::wrap( $img ) );
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals(
			self::wrap( $img ),
			$doc->saveHTML(),
			"Unwrapped to <section> image should be ignored"
		);
		libxml_clear_errors();
	}

	/**
	 * @param string $html
	 * @param bool $skipSmallImages whether small images should be skipped
	 * @param string $expected
	 * @param string $explanation
	 *
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::apply
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::doRewriteImagesForLazyLoading
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::getImageDimension
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::getImageDimensions
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::copyStyles
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::copyClasses
	 * @dataProvider provideTransform
	 */
	public function testTransform(
		string $html,
		bool $skipSmallImages,
		string $expected,
		string $explanation
	) {
		$transform = new LazyImageTransform( $skipSmallImages );
		$doc = new DOMDocument();
		libxml_use_internal_errors( true );
		$doc->loadHTML( self::wrap( self::wrapSection( 'First' ) . self::wrapSection( $html ) ) );
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals(
			self::wrap( self::wrapSection( 'First' ) . self::wrapSection( $expected ) ),
			$doc->saveHTML(),
			$explanation
		);
		libxml_clear_errors();
	}

	public function provideTransform() {
		$img = '<img src="kitty.jpg" width="500" height="400">';
		$placeholder = '<span class="lazy-image-placeholder" style="width: 500px;height: 400px;" '
			. 'data-src="kitty.jpg" data-width="500" data-height="400">&nbsp;</span>';
		$imgStyle = '<img src="bigPicture.jpg" style="vertical-align: top; '
			. 'width: 84.412ex; height:70.343ex; background:none;">';

		$imgStyleBad = '<img src="bigPicture.jpg" style=" width: 84.412ex ; '
			. ' vertical-align  :  top ;  height:70.343ex; background:   none;   ">';

		// `width` and `height` should be added in front of string
		$placeholderStyle = '<span class="lazy-image-placeholder" '
			. 'style="width: 84.412ex;height: 70.343ex;vertical-align: top;" '
			. 'data-src="bigPicture.jpg">&nbsp;</span>';
		$imgSmall = '<img src="kitty.jpg" width="5" height="5">';
		$placeholderSmall = '<span class="lazy-image-placeholder" style="width: 5px;height: 5px;" '
			. 'data-src="kitty.jpg" data-width="5" data-height="5">&nbsp;</span>';
		$imgNoAttribs = '<img src="foo.jpg">';

		$imgWithThumbborder = '<img src="bigPicture.jpg" style="vertical-align: top; '
			. 'width: 84.412ex; height:70.343ex; background:none;" '
			. 'class="class thumbborder">';

		$placeholderWithThumbborder = '<span class="lazy-image-placeholder thumbborder" '
			. 'style="width: 84.412ex;height: 70.343ex;vertical-align: top;" '
			. 'data-src="bigPicture.jpg" '
			. 'data-class="class thumbborder">&nbsp;</span>';

		return [
			[
				$imgNoAttribs,
				false,
				$imgNoAttribs,
				'No change if no dimensions found on image (T133085)'
			],
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
				"Dimension styles are copied to the placeholder"
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
			],
			[
				"$imgStyleBad",
				false,
				"<noscript>$imgStyleBad</noscript>$placeholderStyle",
				"Malformed style should be processed also"
			],
			[
				"$imgWithThumbborder",
				false,
				"<noscript>$imgWithThumbborder</noscript>$placeholderWithThumbborder",
				"Thumbborder class should be copied to placeholder"
			]
		];
	}

	/**
	 * @covers \MobileFrontend\Transforms\LazyImageTransform::gradeCImageSupport
	 */
	public function testGradeCImageSupport() {
		$js = LazyImageTransform::gradeCImageSupport();

		$this->assertStringContainsString(
			'noscript',
			$js,
			'gain the widest possible browser support, scan for noscript tag'
		);
		$this->assertStringContainsString(
			'lazy-image-placeholder',
			$js,
			'check if sibling has the lazy-image-placeholder class gotten from ns[i].nextSibling;'
		);
		$this->assertStringContainsString(
			'parentNode.replaceChild( img, p );',
			$js,
			'make sure the replacement to image tag was properly done'
		);
	}

}
