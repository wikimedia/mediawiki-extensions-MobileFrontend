<?php
namespace MobileFrontend\Features;

interface IFeature {

	/**
	 * Get the feature id
	 * Used as a identifier in forms, database etc. Should be unique
	 *
	 * @return string
	 */
	public function getId();

	/**
	 * Check feature availability in given mode ( Stable, beta, alpha etc )
	 * @param string $mode Mode
	 * @return bool
	 */
	public function isAvailable( $mode );
	/**
	 * The feature name defined as a translation tag
	 * ex: mobile-frontend-mobile-option-MFLazyLoadReferences
	 * @return string
	 */
	public function getNameKey();

	/**
	 * The feature name defined as a translation tag,
	 * ex: mobile-frontend-mobile-option-MFLazyLoadReferences-description
	 * @return string
	 */
	public function getDescriptionKey();

}
