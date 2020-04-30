<?php

namespace MobileFrontend\Features;

use MediaWiki\MediaWikiServices;

/**
 * A facade for UserModes and MobileFrontend Features system.
 *
 * FeaturesManager takes care about all available user modes and features
 * It handles relations between mode and features (one to many relation)
 * and allows an easy acecss to single mode/feature so there is no need
 * to retrieve objects from the MediaWikiServices.
 *
 * @package MobileFrontend\Features
 */
class FeaturesManager {

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
	 * Allow other extensions to register features
	 */
	public function useHookToRegisterExtensionOrSkinFeatures() {
		$hookContainer = MediaWikiServices::getInstance()->getHookContainer();
		$hookContainer->run( 'MobileFrontendFeaturesRegistration', [ $this ] );
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
	 * Check if given feature is available for current user
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
	 * Retrieve the current mode
	 *
	 * @param string $modeIdentifier Mode identifier
	 * @return IUserMode
	 */
	public function getMode( $modeIdentifier ) {
		return $this->userModes->getMode( $modeIdentifier );
	}
}
