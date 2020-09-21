<?php

namespace MobileFrontend\Features;

/**
 * Represents single mobile feature
 *
 * @package MobileFrontend\Features
 */
interface IFeature {

	/**
	 * Beta mode defined in config
	 */
	public const CONFIG_BETA = 'beta';

	/**
	 * Stable mode defined in config
	 */
	public const CONFIG_STABLE = 'base';

	/**
	 * Get the feature id
	 * Used as a identifier in forms, database etc. Should be unique
	 *
	 * @return string
	 */
	public function getId();

	/**
	 * Get the feature group
	 * @return string
	 */
	public function getGroup();

	/**
	 * Serialise the feature as a string so that the feature manager can perform array_diff
	 * and array_intersect on results and identify where features are available and where they are not.
	 * This should return the value of getId.
	 * @return string
	 */
	public function __toString();

	/**
	 * Check feature availability in given user mode ( base, beta, alpha etc )
	 * @param IUserMode $mode UserMode
	 * @return bool
	 */
	public function isAvailable( IUserMode $mode );

	/**
	 * The feature name defined as a translation tag
	 * ex: mobile-frontend-mobile-option-MFConfigFlag
	 * @return string
	 */
	public function getNameKey();

	/**
	 * The feature name defined as a translation tag,
	 * ex: mobile-frontend-mobile-option-MFConfigFlag-description
	 * @return string
	 */
	public function getDescriptionKey();

}
