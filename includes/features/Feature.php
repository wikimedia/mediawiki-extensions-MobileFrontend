<?php
namespace MobileFrontend\Features;

/**
 * Class Feature
 * @package MobileFrontend\Features
 */
class Feature implements IFeature {

	const DEFAULT_ENABLED_MODE = false;
	/**
	 * @var string
	 */
	private $name;
	/**
	 * @var array
	 */
	private $options;

	/**
	 * Feature constructor.
	 * @param string $name feature name (used as an ID)
	 * @param array $options Feature options
	 */
	public function __construct( $name, $options ) {
		$this->name = $name;
		$this->options = $options;
	}

	/**
	 * @inheritDoc
	 */
	public function isAvailable( $mode ) {
		return array_key_exists( $mode, $this->options ) ?
			$this->options[ $mode ] : self::DEFAULT_ENABLED_MODE;
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
	public function getNameKey() {
		return 'mobile-frontend-mobile-option-' . $this->name;
	}

	/**
	 * @inheritDoc
	 */
	public function getDescriptionKey() {
		return 'mobile-frontend-mobile-option-' . $this->name . '-description';
	}

}
