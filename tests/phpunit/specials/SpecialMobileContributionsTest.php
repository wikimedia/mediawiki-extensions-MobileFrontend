<?php

/**
 * @group MobileFrontend
 */
class SpecialMobileContributionsTest extends SpecialPageTestBase {

	public function newSpecialPage(): SpecialMobileContributions {
		$services = $this->getServiceContainer();
		return new SpecialMobileContributions(
			$services->getNamespaceInfo(),
			$services->getRevisionFactory()
		);
	}

	/** @covers SpecialMobileContributions::executeWhenAvailable */
	public function testInvalidIpAddress(): void {
		// T291519
		$this->executeSpecialPage( '127.0.0.1/8' );

		// did not fail
		$this->addToAssertionCount( 1 );
	}

}
