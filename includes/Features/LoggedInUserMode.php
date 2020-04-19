<?php

namespace MobileFrontend\Features;

/**
 * An easy way to enable features only for logged in users.
 * This class is an Adapter for the User object to fulfill FeatureManager requirements.
 * Instead of hardcoding ` if ( $user->isLoggedIn() ) { ` logic in each feature code,
 * we can re-use this mode and have `isLoggedIn` check only in one place for all features.
 *
 * To use it please define feature like that:
 *
 * $wgMFMyNewFeature => [
 *    ...
 *    'loggedin' => true,
 * ];
 *
 * @package MobileFrontend\Features
 */
class LoggedInUserMode implements IUserMode {

	/**
	 * @var \User
	 */
	private $user;

	/**
	 * @param \User $user
	 */
	public function __construct( \User $user ) {
		$this->user = $user;
	}

	/**
	 * @inheritDoc
	 */
	public function isEnabled() {
		return $this->user->isSafeToLoad() ? $this->user->isLoggedIn() : false;
	}

	/**
	 * @inheritDoc
	 */
	public function getModeIdentifier() {
		return 'loggedin';
	}
}
