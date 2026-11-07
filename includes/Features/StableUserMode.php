<?php

namespace MobileFrontend\Features;

/**
 * This class defines the "stable" user mode for theMobileFrontend feature
 * @package MobileFrontend\Features
 */
class StableUserMode implements IUserMode {

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
