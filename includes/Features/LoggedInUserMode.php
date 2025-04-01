<?php

namespace MobileFrontend\Features;

use MediaWiki\User\User;

/**
 * An easy way to enable features only for logged in users.
 * This class is an Adapter for the User object to fulfill FeaturesManager requirements.
 * Instead of hardcoding ` if ( $user->isRegistered() ) { ` logic in each feature code,
 * we can re-use this mode and have `isRegistered` check only in one place for all features.
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

	private User $user;

	public function __construct( User $user ) {
		$this->user = $user;
	}

	/**
	 * @inheritDoc
	 */
	public function isEnabled() {
		return $this->user->isSafeToLoad() && $this->user->isRegistered();
	}

	/**
	 * @inheritDoc
	 */
	public function getModeIdentifier() {
		return 'loggedin';
	}
}
