<?php

namespace MobileFrontend\Features;

use MobileContext;

/**
 * This class defines the "stable" user mode for theMobileFrontend feature
 * @package MobileFrontend\Features
 */
class StableUserMode implements IUserMode {

	private MobileContext $context;

	public function __construct( MobileContext $context ) {
		$this->context = $context;
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
