<?php

use MediaWiki\Request\FauxRequest;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\ResourceLoader\ResourceLoader;
use MobileFrontend\ResourceLoaderModules\MobileConfig;
use Psr\Log\NullLogger;

/**
 * @group MobileFrontend
 * @covers \MobileFrontend\ResourceLoaderModules\MobileConfig
 */
class MobileConfigTest extends MediaWikiIntegrationTestCase {

	/** @return Context */
	private function createContext(): Context {
		$rl = $this->createNoOpMock( ResourceLoader::class, [ 'getLogger' ] );
		$rl->method( 'getLogger' )->willReturn( new NullLogger() );

		return new Context( $rl, new FauxRequest( [] ) );
	}

	public function testMakeScript() {
		$script = MobileConfig::makeScript( $this->createContext() );

		$this->assertIsString( $script );
		$this->assertStringContainsString( 'mw.config.set', $script );
		// Assert that we have some configs in the string. "wg" is a good indicator.
		$this->assertStringContainsString( 'wg', $script );
	}

}
