<?php

namespace MobileFrontend\Features;

use MobileContext;

/**
 * This class defines the "stable" user mode for theMobileFrontend feature
 * @package MobileFrontend\Features
 */
class StableUserMode implements IUserMode {

	public function __construct(
		private readonly MobileContext $context,
	) {
	}

	/**
	 * @inheritDoc
	 */
	public function isEnabled() {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public function getModeIdentifier() {
		return IFeature::CONFIG_STABLE;
	}
}
