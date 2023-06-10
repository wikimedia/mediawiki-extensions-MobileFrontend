<?php

namespace MobileFrontend\Tests\Unit;

use MediaWiki\Tests\HookContainer\HookRunnerTestBase;
use MobileFrontend\Hooks\HookRunner;

/**
 * @covers \MobileFrontend\Hooks\HookRunner
 */
class HookRunnerTest extends HookRunnerTestBase {

	public static function provideHookRunners() {
		yield HookRunner::class => [ HookRunner::class ];
	}
}
