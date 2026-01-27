<?php

namespace MobileFrontend\Tests;

use MediaWiki\Tests\Structure\OwnersStructureTestBase;

/**
 * @coversNothing
 */
class OwnersStructureTest extends OwnersStructureTestBase {
	/**
	 * @inheritDoc
	 */
	public function getOwnersFile(): string {
		return __DIR__ . '/../../../OWNERS.md';
	}

	/**
	 * @inheritDoc
	 */
	public function getFolders(): array {
		return [ 'tests', 'includes', 'src' ];
	}
}
