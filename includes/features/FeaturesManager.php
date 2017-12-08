<?php

namespace MobileFrontend\Features;

class FeaturesManager {
	/**
	 * A collection of available features
	 *
	 * @var array<IFeature>
	 */
	private $features = [];

	/**
	 * Register a new MobileFronted feature
	 * @param IFeature $feature Feature to register
	 */
	public function registerFeature( IFeature $feature ) {
		$this->features[] = $feature;
	}

	/**
	 * @param string $mode Mode
	 * @return array<IFeature>
	 */
	public function getAvailable( $mode ) {
		return array_filter( $this->features, function ( IFeature $feature ) use ( $mode ) {
			return $feature->isAvailable( $mode );
		} );
	}

}
