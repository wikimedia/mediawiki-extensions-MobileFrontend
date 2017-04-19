<?php

namespace Tests\MobileFrontend\Skins;

use MediaWikiTestCase;
use OutputPage;
use RequestContext;
use SkinMinerva;
use Title;
use Wikimedia\TestingAccessWrapper;

/**
 * @covers SkinMinerva
 * @group MobileFrontend
 */
class SkinMinervaTest extends MediaWikiTestCase {

	public function testAddToBodyAttributes() {
		// The `class` attribute gets set to the "bodyClassName" property by
		// default.
		$this->assertContains(
			'no-js',
			$this->addToBodyAttributes( 'no-js', false )
		);

		$classes = $this->addToBodyAttributes( 'no-js', true );

		$this->assertContains( 'no-js', $classes );
	}

	private function addToBodyAttributes(
		$bodyClassName
	) {
		$context = RequestContext::getMain();

		$outputPage = $context->getOutput();
		$outputPage->setProperty( 'bodyClassName', $bodyClassName );

		$bodyAttrs = [ 'class' => '' ];

		$skin = new SkinMinerva();
		$skin->addToBodyAttributes( $outputPage, $bodyAttrs );

		return explode( ' ', $bodyAttrs[ 'class' ] );
	}

	public function testHasCategoryLinksWhenOptionIsOff() {
		$outputPage = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->getMock();
		$outputPage->expects( $this->never() )
			->method( 'getCategoryLinks' );

		$context = $this->getMockBuilder( 'IContextSource' )->getMock();
		$context->expects( $this->any() )
			->method( 'getOutput' )
			->willReturn( $outputPage );

		$skin = new SkinMinerva();
		$skin->setContext( $context );
		$skin->setSkinOptions( [ SkinMinerva::OPTION_CATEGORIES => false ] );

		$skin = TestingAccessWrapper::newFromObject( $skin );

		$this->assertEquals( $skin->hasCategoryLinks(), false );
	}

	/**
	 * @dataProvider provideHasCategoryLinks
	 * @param array $categoryLinks
	 * @param bool $expected
	 */
	public function testHasCategoryLinks( array $categoryLinks, $expected ) {
		$outputPage = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->getMock();
		$outputPage->expects( $this->once() )
			->method( 'getCategoryLinks' )
			->will( $this->returnValue( $categoryLinks ) );

		$context = $this->getMockBuilder( 'IContextSource' )->getMock();
		$context->expects( $this->any() )
			->method( 'getOutput' )
			->willReturn( $outputPage );

		$skin = new SkinMinerva();
		$skin->setContext( $context );
		$skin->setSkinOptions( [ SkinMinerva::OPTION_CATEGORIES => true ] );

		$skin = TestingAccessWrapper::newFromObject( $skin );

		$this->assertEquals( $skin->hasCategoryLinks(), $expected );
	}

	public function provideHasCategoryLinks() {
		return [
			[ [], false ],
			[
				[
					'normal' => '<ul><li><a href="/wiki/Category:1">1</a></li></ul>'
				],
				true
			],
			[
				[
					'hidden' => '<ul><li><a href="/wiki/Category:Hidden">Hidden</a></li></ul>'
				],
				true
			],
			[
				[
					'normal' => '<ul><li><a href="/wiki/Category:1">1</a></li></ul>',
					'hidden' => '<ul><li><a href="/wiki/Category:Hidden">Hidden</a></li></ul>'
				],
				true
			],
			[
				[
					'unexpected' => '<ul><li><a href="/wiki/Category:1">1</a></li></ul>'
				],
				false
			],
		];
	}

	/**
	 * Test whether the font changer module is correctly added to the list context modules
	 *
	 * @covers       SkinMinerva::getContextSpecificModules
	 * @dataProvider provideGetContextSpecificModules
	 * @param string $fontchangerValue whether font changer feature is enabled
	 * @param mixed  $backToTopValue whether back to top feature is enabled
	 * @param string $moduleName Module name that is being tested
	 * @param bool $expected Whether the module is expected to be returned by the function being tested
	 */
	public function testGetContextSpecificModules( $fontchangerValue, $backToTopValue,
												   $moduleName, $expected ) {
		$skin = TestingAccessWrapper::newFromObject(
			$this->getMockBuilder( SkinMinerva::class )
				->disableOriginalConstructor()
				->setMethods( [ 'getTitle' ] )
				->getMock()
		);
		$title = Title::newFromText( 'Test' );
		$skin->expects( $this->any() )
			->method( 'getTitle' )
			->will( $this->returnValue( $title ) );

		$skin->setSkinOptions( [
			'fontChanger' => $fontchangerValue,
			'backToTop' => $backToTopValue,
		] );

		if ( $expected ) {
			$this->assertContains( $moduleName, $skin->getContextSpecificModules() );
		} else {
			$this->assertNotContains( $moduleName, $skin->getContextSpecificModules() );
		}
	}

	public function provideGetContextSpecificModules() {
		return [
			[ true, false, 'skins.minerva.fontchanger', true ],
			[ false, true, 'skins.minerva.fontchanger', false ],
			[ false, true, 'skins.minerva.backtotop', true ],
			[ false, false, 'skins.minerva.backtotop', false ],
		];
	}
}
