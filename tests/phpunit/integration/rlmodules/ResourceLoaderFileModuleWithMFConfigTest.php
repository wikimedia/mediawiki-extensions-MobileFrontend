<?php

use MediaWiki\ResourceLoader\Context;
use MobileFrontend\ResourceLoaderModules\ResourceLoaderFileModuleWithMFConfig;
use Psr\Log\NullLogger;

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontend\ResourceLoaderModules\ResourceLoaderFileModuleWithMFConfig
 */
class ResourceLoaderFileModuleWithMFConfigTest extends MediaWikiIntegrationTestCase {

	/** @return Context */
	private function createContext(): Context {
		$rl = $this->createNoOpMock( ResourceLoader::class, [ 'getLogger' ] );
		$rl->method( 'getLogger' )->willReturn( new NullLogger() );

		return new Context( $rl, new FauxRequest( [] ) );
	}

	/**
	 * @covers ::getConfigData
	 * @covers ::getScript
	 */
	public function testGetScript() {
		$module = new ResourceLoaderFileModuleWithMFConfig();
		$script = $module->getScript( $this->createContext() );

		$this->assertIsString( $script );
		$this->assertStringContainsString( 'mw.config.set', $script );
		// Assert that we have some configs in the string. "wg" is a good indicator.
		$this->assertStringContainsString( 'wg', $script );
	}

	/**
	 * @covers ::getConfigData
	 * @covers ::getDefinitionSummary
	 */
	public function testGetDefinitionSummary() {
		$module = new ResourceLoaderFileModuleWithMFConfig();
		$defSummary = $module->getDefinitionSummary( $this->createContext() );

		$this->assertIsArray( $defSummary );

		$this->assertArrayHasKey( 'options', $defSummary[0] );
		$this->assertArrayHasKey( 'packageFiles', $defSummary[0] );
		$this->assertArrayHasKey( 'fileHashes', $defSummary[0] );
		$this->assertArrayHasKey( 'messageBlob', $defSummary[0] );

		$this->assertArrayHasKey( 'configData', $defSummary[1] );
	}

	/**
	 * @covers ::supportsURLLoading
	 */
	public function testSupportsURLLoading() {
		$module = new ResourceLoaderFileModuleWithMFConfig();
		$supportsUrlLoading = $module->supportsURLLoading();

		$this->assertFalse( $supportsUrlLoading );
	}

}
