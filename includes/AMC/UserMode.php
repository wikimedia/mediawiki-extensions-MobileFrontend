<?php

namespace MobileFrontend\AMC;

use DeferredUpdates;
use MediaWiki\MediaWikiServices;
use MediaWiki\User\UserOptionsLookup;
use MediaWiki\User\UserOptionsManager;
use MobileFrontend\Features\IUserMode;
use MobileFrontend\Features\IUserSelectableMode;
use RuntimeException;
use Wikimedia\Assert\Assert;

class UserMode implements IUserMode, IUserSelectableMode {

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
	 * @var UserOptionsLookup
	 */
	private $userOptionsLookup;

	/**
	 * @var UserOptionsManager
	 */
	private $userOptionsManager;

	/**
	 * @param Manager $amcManager
	 * @param \User $user
	 * @param UserOptionsLookup $userOptionsLookup
	 * @param UserOptionsManager $userOptionsManager
	 * @throws \RuntimeException When AMC mode is not available
	 */
	public function __construct(
		Manager $amcManager,
		\User $user,
		UserOptionsLookup $userOptionsLookup,
		UserOptionsManager $userOptionsManager
	) {
		$this->amc = $amcManager;
		$this->user = $user;
		$this->userOptionsLookup = $userOptionsLookup;
		$this->userOptionsManager = $userOptionsManager;
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
		$userOption = $this->userOptionsLookup->getOption(
			$this->user,
			self::USER_OPTION_MODE_AMC,
			self::OPTION_DISABLED
		);
		return $this->amc->isAvailable() &&
			 $userOption === self::OPTION_ENABLED;
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
		$userOptionsManager = $this->userOptionsManager;

		$userOptionsManager->setOption(
			$user,
			self::USER_OPTION_MODE_AMC,
			$toSet
		);
		DeferredUpdates::addCallableUpdate( function () use ( $user, $toSet, $userOptionsManager ) {
			if ( wfReadOnly() ) {
				return;
			}

			$latestUser = $user->getInstanceForUpdate();
			if ( $latestUser === null ) {
				throw new \InvalidArgumentException(
					"User not found, so can't enable AMC mode"
				);
			}
			$userOptionsManager->setOption(
				$latestUser,
				self::USER_OPTION_MODE_AMC,
				$toSet
			);
			$latestUser->saveSettings();
		}, DeferredUpdates::PRESEND );
	}

	/**
	 * Create UserMode for given user
	 * NamedConstructor used by hooks system
	 *
	 * @param \User $user
	 * @return self
	 */
	public static function newForUser( \User $user ) {
		$services = MediaWikiServices::getInstance();
		return new self(
			$services->getService( 'MobileFrontend.AMC.Manager' ),
			$user,
			$services->getUserOptionsLookup(),
			$services->getUserOptionsManager()
		);
	}

}
