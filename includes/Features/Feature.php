<?php

namespace MobileFrontend\Features;

/**
 * @package MobileFrontend\Features
 */
class Feature implements IFeature {

	private const DEFAULT_ENABLED_MODE = false;

	private string $name;
	/**
	 * Feature group (mobile-frontend, minerva, ...)
	 */
	private string $group;
	private array $options;

	/**
	 * @param string $name feature name (used as an ID)
	 * @param string $group feature group (used as a translation prefix)
	 * @param array $options Feature options
	 */
	public function __construct( $name, $group = 'mobile-frontend', array $options = [] ) {
		$this->name = $name;
		$this->group = $group;
		$this->options = $options;
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

	/**
	 * @inheritDoc
	 */
	public function getNameKey() {
		return $this->group . '-mobile-option-' . $this->name;
	}

	/**
	 * @inheritDoc
	 */
	public function getDescriptionKey() {
		return $this->group . '-mobile-option-' . $this->name . '-description';
	}
}
