<?php

namespace MobileFrontend\Features;

use MobileContext;
use Hooks;

/**
 * A wrapper for all available mobile frontend features.
 *
 * @package MobileFrontend\Features
 */
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
	 * @var UserModes
	 */
	private $userModes;

	/**
	 * @param UserModes $userModes
	 */
	public function __construct( UserModes $userModes ) {
		$this->userModes = $userModes;
	}

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
	 * @throws \RuntimeException
	 */
	public function registerFeature( IFeature $feature ) {
		if ( array_key_exists( $feature->getId(), $this->features ) ) {
			throw new \RuntimeException( 'Feature ' . $feature->getId() . ' is already defined.' );
		}
		$this->features[ $feature->getId() ] = $feature;
	}

	/**
	 * List all features that are available in given mode.
	 * This function do not check if user enabled given mode.
	 *
	 * @param IUserMode $mode User Mode
	 * @return array<IFeature>
	 */
	public function getAvailableForMode( IUserMode $mode ) {
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
	 * Check if given feature is available for currently logged in user
	 *
	 * @param string $featureId Feature identifier
	 * @return bool
	 */
	public function isFeatureAvailableForCurrentUser( $featureId ) {
		$feature = $this->getFeature( $featureId );

		/** @var IUserMode $userMode */
		foreach ( $this->userModes as $userMode ) {
			if ( $userMode->isEnabled() && $feature->isAvailable( $userMode ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Verify that feature $featureId is available to the current user.
	 *
	 * @param string $featureId Feature id to verify
	 * @param MobileContext $context Mobile context to check
	 * @deprecated Use FeaturesManager::isFeatureAvailableForCurrentUser() instead
	 * @return bool
	 */
	public function isFeatureAvailableInContext( $featureId, MobileContext $context ) {
		// ignore $context, user is retrieved from the current session
		return $this->isFeatureAvailableForCurrentUser( $featureId );
	}
}
