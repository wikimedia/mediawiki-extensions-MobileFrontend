<?php

use MobileFrontend\Transforms\NativeLazyImageTransform;
use Wikimedia\Parsoid\Utils\DOMCompat;

/**
 * @group MobileFrontend
 */
class NativeLazyImageTransformTest extends \MediaWikiUnitTestCase {
	public static function wrap( $html ) {
		return "<!DOCTYPE HTML>
<html><body><div class=\"mw-parser-output\">$html</div></body></html>
";
	}

	public static function wrapSection( $html ) {
		return "<section>$html</section>";
	}

	/**
	 * @covers \MobileFrontend\Transforms\NativeLazyImageTransform::apply
	 * @covers \MobileFrontend\Transforms\NativeLazyImageTransform::doRewriteImagesForLazyLoading
	 */
	public function testTransformFirstSection() {
		$img = '<img src="kitty.jpg" width="500" height="400">';

		$transform = new NativeLazyImageTransform( false );
		libxml_use_internal_errors( true );
		$doc = new DOMDocument();

		$doc->loadHTML( self::wrap( self::wrapSection( $img ) ) );
		$transform->apply( DOMCompat::querySelector( $doc, 'body' ) );
		$this->assertEquals(
			self::wrap( self::wrapSection( $img ) ),
			$doc->saveHTML(),
			"First section should be ignored"
		);
		libxml_clear_errors();
	}

	/**
	 * @covers \MobileFrontend\Transforms\NativeLazyImageTransform::apply
	 * @covers \MobileFrontend\Transforms\NativeLazyImageTransform::doRewriteImagesForLazyLoading
	 */
	public function testTransformUnwrappedSection() {
		$img = '<img src="kitty.jpg" width="500" height="400">';

		$transform = new NativeLazyImageTransform( false );
		libxml_use_internal_errors( true );
		$doc = new DOMDocument();

		$doc->loadHTML( self::wrap( $img ) );
		$transform->apply( DOMCompat::querySelector( $doc, 'body' ) );
		$this->assertEquals(
			self::wrap( $img ),
			$doc->saveHTML(),
			"Unwrapped to <section> image should be ignored"
		);
		libxml_clear_errors();
	}

	/**
	 * @param string $html
	 * @param string $expected
	 * @param string $explanation
	 *
	 * @covers \MobileFrontend\Transforms\NativeLazyImageTransform::apply
	 * @covers \MobileFrontend\Transforms\NativeLazyImageTransform::doRewriteImagesForLazyLoading
	 * @dataProvider provideTransform
	 */
	public function testTransform(
		string $html,
		string $expected,
		string $explanation
	) {
		$transform = new NativeLazyImageTransform();
		$doc = new DOMDocument();
		libxml_use_internal_errors( true );
		$doc->loadHTML( self::wrap( self::wrapSection( 'First' ) . self::wrapSection( $html ) ) );
		$transform->apply( DOMCompat::querySelector( $doc, 'body' ) );
		$this->assertEquals(
			self::wrap( self::wrapSection( 'First' ) . self::wrapSection( $expected ) ),
			$doc->saveHTML(),
			$explanation
		);
		libxml_clear_errors();
	}

	public static function provideTransform() {
		$img = '<img src="kitty.jpg" width="500" height="400">';
		$lazyImg = '<img src="kitty.jpg" width="500" height="400" loading="lazy">';
		$imgStyle = '<img src="bigPicture.jpg" style="vertical-align: top; '
			. 'width: 84.412ex; height:70.343ex; background:none;">';

		$lazyImgStyle = '<img src="bigPicture.jpg" style="vertical-align: top; '
			. 'width: 84.412ex; height:70.343ex; background:none;" loading="lazy">';

		$imgNoAttribs = '<img src="foo.jpg">';
		$lazyImgNoAttribs = '<img src="foo.jpg" loading="lazy">';

		$imgWithThumbborder = '<img src="bigPicture.jpg" style="vertical-align: top; '
			. 'width: 84.412ex; height:70.343ex; background:none;" '
			. 'class="class thumbborder">';

		$lazyImgWithThumbborder = '<img src="bigPicture.jpg" style="vertical-align: top; '
			. 'width: 84.412ex; height:70.343ex; background:none;" '
			. 'class="class thumbborder" loading="lazy">';

		return [
			[
				$imgNoAttribs,
				$lazyImgNoAttribs,
				'No change if no dimensions found on image (T133085)'
			],
			[
				"$img",
				"$lazyImg",
				'Images have loading="lazy" attribute'
			],
			[
				"$imgStyle",
				"$lazyImgStyle",
				"Dimension styles are copied to the placeholder"
			],
			[
				"$imgWithThumbborder",
				"$lazyImgWithThumbborder",
				"Thumbborder class should be copied to placeholder"
			]
		];
	}
}
