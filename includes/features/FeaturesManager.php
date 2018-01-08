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
		if ( array_key_exists( $feature->getId(), $this->features ) ) {
			throw new \RuntimeException( 'Feature ' . $feature->getId() . ' is already defined.' );
		}
		$this->features[ $feature->getId() ] = $feature;
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

	/**
	 * Get feature
	 * @param string $id Feature id
	 * @return IFeature
	 */
	public function getFeature( $id ) {
		if ( !array_key_exists( $id, $this->features ) ) {
			throw new \RuntimeException( 'Feature ' . $id . ' is not defined.' );
		}
		return $this->features[ $id ];
	}

}
