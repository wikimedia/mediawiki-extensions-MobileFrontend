<?php

namespace MobileFrontend\AMC;

use \DeferredUpdates;
use MediaWiki\MediaWikiServices;
use MobileFrontend\Features\IUserMode;
use \RuntimeException;
use Wikimedia\Assert\Assert;

class UserMode implements IUserMode {

	const USER_OPTION_MODE_AMC = 'mf_amc_optin';

	/**
	 * Value in the user options when AMC is enabled
	 */
	const OPTION_ENABLED = '1';

	/**
	 * Value in the user options when AMC is disabled (default state)
	 */
	const OPTION_DISABLED = '0';

	/**
	 * @var \User
	 */
	private $user;
	/**
	 * @var Manager
	 */
	private $amc;

	/**
	 * @param Manager $amcManager
	 * @param \User $user
	 * @throws \RuntimeException When AMC mode is not available
	 */
	public function __construct( Manager $amcManager, \User $user ) {
		$this->amc = $amcManager;
		$this->user = $user;
	}

	/**
	 * @return string
	 */
	public function getModeIdentifier() {
		return $this->amc->getModeIdentifier();
	}

	/**
	 * Return information if the AMC mode is enabled by user
	 * @return bool
	 */
	public function isEnabled() {
		return $this->amc->isAvailable() &&
			$this->user->getOption( self::USER_OPTION_MODE_AMC,
				self::OPTION_DISABLED ) === self::OPTION_ENABLED;
	}

	/**
	 * @param bool $isEnabled
	 * @throws RuntimeException when mode is disabled
	 */
	public function setEnabled( $isEnabled ) {
		$toSet = $isEnabled ? self::OPTION_ENABLED : self::OPTION_DISABLED;
		if ( !$this->amc->isAvailable() ) {
			throw new RuntimeException( 'AMC Mode is not available' );
		}
		Assert::parameterType( 'boolean', $isEnabled, 'isEnabled' );
		$user = $this->user;

		$user->setOption( self::USER_OPTION_MODE_AMC, $toSet );
		DeferredUpdates::addCallableUpdate( function () use ( $user, $toSet ) {
			if ( wfReadOnly() ) {
				return;
			}

			$latestUser = $user->getInstanceForUpdate();
			if ( $latestUser === null ) {
				throw new \InvalidArgumentException(
					"User not found, so can't enable AMC mode"
				);
			}
			$latestUser->setOption( self::USER_OPTION_MODE_AMC, $toSet );
			$latestUser->saveSettings();
		}, DeferredUpdates::PRESEND );
	}

	/**
	 * Create UserMode for given user
	 * NamedConstructor used by hooks system
	 *
	 * @param \User $user
	 * @return UserMode
	 */
	public static function newForUser( \User $user ) {
		return new UserMode(
			MediaWikiServices::getInstance()->getService( 'MobileFrontend.AMC.Manager' ),
			$user
		);
	}

}
