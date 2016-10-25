<?php

namespace Tests\MobileFrontend\Skins;

use MediaWikiTestCase;
use MobileContext;
use SkinMinerva;

class TestSkinMinerva extends SkinMinerva {

	/**
	 * The Minimum Viable Constructor for SkinMinerva.
	 *
	 * @FIXME Why doesn't SkinMinerva have its dependencies injected?
	 *
	 * @param MobileContext $mobileContext
	 */
	public function __construct( MobileContext $mobileContext ) {
		$this->mobileContext = $mobileContext;
	}
}

class SkinMinervaTest extends MediaWikiTestCase {

	public function testAddToBodyAttributes() {
		// The `class` attribute gets set to the "bodyClassName" property by
		// default.
		$this->assertContains(
			'no-js',
			$this->addToBodyAttributes( 'no-js', false )
		);

		// When `$wgMinervaUseFooterV2' is truthy, then the "feature-footer-v2"
		// feature class is added to the `class` attribute.
		$classes = $this->addToBodyAttributes( 'no-js', true );

		$this->assertContains( 'no-js', $classes );
		$this->assertContains( 'feature-footer-v2', $classes );
	}

	private function addToBodyAttributes(
		$bodyClassName,
		$wgMinervaUseFooterV2
	) {
		$context = MobileContext::singleton();

		$outputPage = $context->getOutput();
		$outputPage->setProperty( 'bodyClassName', $bodyClassName );

		$this->setMwGlobals( 'wgMinervaUseFooterV2', [
			'base' => $wgMinervaUseFooterV2
		] );

		$bodyAttrs = [ 'class' => '' ];

		$this->factorySkin( $context )
			->addToBodyAttributes( $outputPage, $bodyAttrs );

		return explode( ' ', $bodyAttrs[ 'class' ] );
	}

	private function factorySkin( MobileContext $context ) {
		return new TestSkinMinerva( $context );
	}
}
