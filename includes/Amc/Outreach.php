<?php

namespace MobileFrontend\Amc;

use MediaWiki\Config\Config;
use MediaWiki\Config\ConfigException;
use MediaWiki\User\User;

final class Outreach {
	/**
	 * Config name used to enable/disable the AMC Outreach feature
	 */
	private const CONFIG_NAME = 'MFAmcOutreach';

	/**
	 * Config name used to set the minimum number of edits a user must make before
	 * they will be eligible for AMC Outreach
	 */
	private const MIN_EDIT_COUNT_CONFIG_NAME = 'MFAmcOutreachMinEditCount';

	private UserMode $userMode;
	private User $user;
	private Manager $amc;

	/**
	 * System config
	 */
	private Config $config;

	public function __construct(
		UserMode $userMode, Manager $amcManager, User $user, Config $config
	) {
		$this->userMode = $userMode;
		$this->amc = $amcManager;
		$this->user = $user;
		$this->config = $config;
	}

	/**
	 * Whether or not the outreach campaign is turned on and amc is available
	 *
	 * @return bool
	 */
	public function isCampaignActive() {
		return $this->config->get( self::CONFIG_NAME ) &&
			$this->amc->isAvailable();
	}

	/**
	 * Whether or not the current user is eligible to see the outreach campaign
	 *
	 * @return bool
	 * @throws ConfigException
	 */
	public function isUserEligible() {
		return $this->isCampaignActive() &&
			!$this->userMode->isEnabled() &&
			$this->user->getEditCount() >= $this->config->get( self::MIN_EDIT_COUNT_CONFIG_NAME ) &&
			// T231057: Don't show drawer during browser tests
			!$this->user->isBot();
	}
}
