<?php

use MobileFrontend\Tests\Utils;
use MobileFrontend\Transforms\NativeLazyImageTransform;

/**
 * @group MobileFrontend
 */
class NativeLazyImageTransformTest extends \MediaWikiUnitTestCase {
	/**
	 * @covers \MobileFrontend\Transforms\NativeLazyImageTransform::apply
	 * @covers \MobileFrontend\Transforms\NativeLazyImageTransform::doRewriteImagesForLazyLoading
	 */
	public function testTransformFirstSection() {
		$img = '<img src="kitty.jpg" width="500" height="400"/>';

		$transform = new NativeLazyImageTransform( false );
		$body = Utils::createBody( Utils::wrapParserOutput( Utils::wrapSection( $img ) ) );
		$transform->apply( $body );
		$this->assertEquals(
			Utils::wrapParserOutput( Utils::wrapSection( $img ) ),
			Utils::getInnerHTML( $body ),
			"First section should be ignored"
		);
	}

	/**
	 * @covers \MobileFrontend\Transforms\NativeLazyImageTransform::apply
	 * @covers \MobileFrontend\Transforms\NativeLazyImageTransform::doRewriteImagesForLazyLoading
	 */
	public function testTransformUnwrappedSection() {
		$img = '<img src="kitty.jpg" width="500" height="400"/>';

		$transform = new NativeLazyImageTransform( false );
		$body = Utils::createBody( Utils::wrapParserOutput( $img ) );
		$transform->apply( $body );
		$this->assertEquals(
			Utils::wrapParserOutput( $img ),
			Utils::getInnerHTML( $body ),
			"Unwrapped to <section> image should be ignored"
		);
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
		$body = Utils::createBody(
			Utils::wrapParserOutput( Utils::wrapSection( 'First' ) . Utils::wrapSection( $html ) )
		);
		$transform->apply( $body );
		$this->assertEquals(
			Utils::wrapParserOutput( Utils::wrapSection( 'First' ) . Utils::wrapSection( $expected ) ),
			Utils::getInnerHTML( $body ),
			$explanation
		);
	}

	public static function provideTransform() {
		$img = '<img src="kitty.jpg" width="500" height="400"/>';
		$lazyImg = '<img src="kitty.jpg" width="500" height="400" loading="lazy"/>';
		$imgStyle = '<img src="bigPicture.jpg" style="vertical-align: top; '
			. 'width: 84.412ex; height:70.343ex; background:none;"/>';

		$lazyImgStyle = '<img src="bigPicture.jpg" style="vertical-align: top; '
			. 'width: 84.412ex; height:70.343ex; background:none;" loading="lazy"/>';

		$imgNoAttribs = '<img src="foo.jpg"/>';
		$lazyImgNoAttribs = '<img src="foo.jpg" loading="lazy"/>';

		$imgWithThumbborder = '<img src="bigPicture.jpg" style="vertical-align: top; '
			. 'width: 84.412ex; height:70.343ex; background:none;" '
			. 'class="class thumbborder"/>';

		$lazyImgWithThumbborder = '<img src="bigPicture.jpg" style="vertical-align: top; '
			. 'width: 84.412ex; height:70.343ex; background:none;" '
			. 'class="class thumbborder" loading="lazy"/>';

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
