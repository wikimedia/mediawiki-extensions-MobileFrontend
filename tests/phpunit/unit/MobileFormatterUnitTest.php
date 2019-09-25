<?php

/**
 * @group MobileFrontend
 * @coversDefaultClass MobileFormatter
 */
class MobileFormatterUnitTest extends \MediaWikiUnitTestCase {
	/**
	 * @see MobileFormatter::canApply for params doc
	 * @covers ::canApply
	 * @dataProvider canApplyDataProvider
	 */
	public function testCanApply(
		$text, $options, $expected
	) {
		$actual = MobileFormatter::canApply( $text, $options );

		$this->assertSame( $expected, $actual );
	}

	/**
	 * Data provider for testing MobileFormatter::canApply
	 * @return array
	 */
	public function canApplyDataProvider() {
		return [
			[
				'<h1>hello</h1>text<h2>text</h2>',
				[
					'maxHeadings' => 1,
					'maxImages' => 1000
				],
				false
			],
			[
				'<h1>hello</h1>text',
				[
					'maxHeadings' => 1,
					'maxImages' => 1000
				],
				true
			],
			[
				'text without heading but references to h1 h2 h3 h4 h5 h6',
				[
					'maxHeadings' => 1,
					'maxImages' => 1000
				],
				true
			],
			[
				'<h3 class="foo">h3</h3><p>test.</p><h6 class="foo">h6</h6><p>test.</p>',
				[
					'maxHeadings' => 1,
					'maxImages' => 1000
				],
				false
			],
			[
				'<img src="gif"><p>test.</p><h6 class="foo">h6</h6><img src="gif"><p>test.</p>',
				[
					'maxHeadings' => 1,
					'maxImages' => 1
				],
				false
			],
		];
	}

}
