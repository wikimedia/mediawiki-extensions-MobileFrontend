<?php

namespace MobileFrontend\Amc;

use Config;
use User;

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

	/**
	 * @var UserMode
	 */
	private $userMode;
	/**
	 * @var User
	 */
	private $user;
	/**
	 * @var Manager
	 */
	private $amc;

	/**
	 * System config
	 * @var Config
	 */
	private $config;

	/**
	 * @param UserMode $userMode
	 * @param Manager $amcManager
	 * @param User $user
	 * @param Config $config
	 */
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
	 * @throws \ConfigException
	 */
	public function isUserEligible() {
		return $this->isCampaignActive() &&
			!$this->userMode->isEnabled() &&
			$this->user->getEditCount() >= $this->config->get( self::MIN_EDIT_COUNT_CONFIG_NAME ) &&
			// T231057: Don't show drawer during browser tests
			!$this->user->isBot();
	}
}
