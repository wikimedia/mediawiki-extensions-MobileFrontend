<?php

namespace MobileFrontend\Features;

use MobileContext;
use Hooks;

class FeaturesManager {

	/**
	 * @var bool
	 */
	private $initialized = false;

	/**
	 * A collection of available features
	 *
	 * @var array<IFeature>
	 */
	private $features = [];

	/**
	 * Setup the Features Manager and register all 3rd party features
	 * The $initialized lock is required due to bug T165068
	 * There is no other way to register feature other than on onRequestContextCreateSkin
	 * hook, but this hook might be called more than once due to special pages transclusion.
	 *
	 * @see https://phabricator.wikimedia.org/T165068
	 */
	public function setup() {
		if ( !$this->initialized ) {
			Hooks::run( 'MobileFrontendFeaturesRegistration', [ $this ] );
			$this->initialized = true;
		}
	}

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

	/**
	 * Verify that feature $featureId is available in $context
	 *
	 * @param string $featureId Feature id to verify
	 * @param MobileContext $context Mobile context to check
	 * @return bool
	 */
	public function isFeatureAvailableInContext( $featureId, MobileContext $context ) {
		$mode = $context->isBetaGroupMember() ? IFeature::CONFIG_BETA : IFeature::CONFIG_STABLE;
		return $this->getFeature( $featureId )->isAvailable( $mode );
	}
}
