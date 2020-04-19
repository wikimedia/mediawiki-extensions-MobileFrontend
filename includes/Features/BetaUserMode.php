<?php

namespace MobileFrontend\Features;

/**
 * Temporary class to provide a bridge between old Beta mode handling and new Feature management
 * system.
 *
 * Beta mode will be refactored properly in T212802, for now we need an easy way to retrieve
 * information about beta mode.
 *
 * IMPORTANT: This class provides read-only state, if you want to enable/disable beta mode
 * please use MobileContext classes
 *
 * @package MobileFrontend\Features
 */
class BetaUserMode implements IUserMode {

	/**
	 * @var \MobileContext
	 */
	private $context;

	/**
	 * @param \MobileContext $context Mobile context
	 */
	public function __construct( \MobileContext $context ) {
		$this->context = $context;
	}

	/**
	 * @inheritDoc
	 */
	public function isEnabled() {
		return $this->context->isBetaGroupMember();
	}

	/**
	 * @inheritDoc
	 */
	public function getModeIdentifier() {
		return IFeature::CONFIG_BETA;
	}
}
