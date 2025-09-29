<?php

namespace MobileFrontend\Features;

/**
 * @package MobileFrontend\Features
 */
class Feature implements IFeature {

	private const DEFAULT_ENABLED_MODE = false;

	/**
	 * @param string $name feature name (used as an ID)
	 * @param string $group feature group (mobile-frontend, minerva, ..., used as a translation prefix)
	 * @param array $options Feature options
	 */
	public function __construct(
		private readonly string $name,
		private readonly string $group = 'mobile-frontend',
		private readonly array $options = [],
	) {
	}

	/**
	 * @inheritDoc
	 */
	public function __toString() {
		return $this->name;
	}

	/**
	 * @inheritDoc
	 */
	public function isAvailable( IUserMode $userMode ) {
		return $this->options[ $userMode->getModeIdentifier() ] ?? self::DEFAULT_ENABLED_MODE;
	}

	/**
	 * @inheritDoc
	 */
	public function getId() {
		return $this->name;
	}

	/**
	 * @inheritDoc
	 */
	public function getGroup() {
		return $this->group;
	}

}
