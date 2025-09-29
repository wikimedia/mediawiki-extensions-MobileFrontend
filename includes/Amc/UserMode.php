<?php

namespace MobileFrontend\Amc;

use MediaWiki\MediaWikiServices;
use MediaWiki\User\Options\UserOptionsManager;
use MediaWiki\User\UserIdentity;
use MobileFrontend\Features\IUserMode;
use MobileFrontend\Features\IUserSelectableMode;
use RuntimeException;

class UserMode implements IUserMode, IUserSelectableMode {

	public const USER_OPTION_MODE_AMC = 'mf_amc_optin';

	/**
	 * Value in the user options when AMC is enabled
	 */
	public const OPTION_ENABLED = '1';

	/**
	 * Value in the user options when AMC is disabled (default state)
	 */
	public const OPTION_DISABLED = '0';

	public function __construct(
		private readonly Manager $amc,
		private readonly UserIdentity $userIdentity,
		private readonly UserOptionsManager $userOptionsManager,
	) {
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
		$userOption = $this->userOptionsManager->getOption(
			$this->userIdentity,
			self::USER_OPTION_MODE_AMC,
			self::OPTION_DISABLED
		);
		return $this->amc->isAvailable() &&
			 $userOption === self::OPTION_ENABLED;
	}

	/**
	 * Set Advanced Mobile Contributions mode to enabled or disabled.
	 *
	 * WARNING: Does not persist the updated user preference to the database.
	 * The caller must handle this by calling User::saveSettings() after all
	 * preference updates associated with this web request are made.
	 * @param bool $isEnabled
	 * @throws RuntimeException when mode is disabled
	 */
	public function setEnabled( bool $isEnabled ) {
		if ( !$this->amc->isAvailable() ) {
			throw new RuntimeException( 'AMC Mode is not available' );
		}
		$this->userOptionsManager->setOption(
			$this->userIdentity,
			self::USER_OPTION_MODE_AMC,
			$isEnabled ? self::OPTION_ENABLED : self::OPTION_DISABLED
		);
	}

	/**
	 * Create UserMode for given user
	 * NamedConstructor used by hooks system
	 *
	 * @param UserIdentity $userIdentity
	 * @return self
	 */
	public static function newForUser( UserIdentity $userIdentity ) {
		$services = MediaWikiServices::getInstance();
		return new self(
			$services->getService( 'MobileFrontend.AMC.Manager' ),
			$userIdentity,
			$services->getUserOptionsManager()
		);
	}

}
