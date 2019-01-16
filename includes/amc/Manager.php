<?php
namespace MobileFrontend\AMC;

use Config;
use IContextSource;

/**
 * Advanced Mobile Contributions Manager
 *
 * @package MobileFrontend\AMC
 */
final class Manager {
	/**
	 * A config name used to enable/disable the AMC mode
	 */
	const AMC_MODE_CONFIG_NAME = 'MFAdvancedMobileContributions';

	/**
	 * Mode identifier used in feature configs
	 * @var string
	 */
	const AMC_MODE_IDENTIFIER = 'amc';

	/**
	 * Change tag
	 * All edits when has AMC enabled will be tagged with AMC_EDIT_TAG
	 */
	const AMC_EDIT_TAG = 'advanced mobile edit';

	/**
	 * Request context, used to retrieve user information
	 * @var IContextSource
	 */
	private $context;

	/**
	 * System config
	 * @var \Config
	 */
	private $config;

	/**
	 * Is Mobile mode active for current session
	 * @var bool
	 */
	private $usingMobileMode;

	/**
	 * @param Config $config Config object
	 * @param IContextSource $context Request context
	 * @param bool $usingMobileMode Flag whether user is browsing in the mobile version
	 */
	public function __construct( Config $config, IContextSource $context, $usingMobileMode ) {
		$this->config = $config;
		$this->context = $context;
		$this->usingMobileMode = $usingMobileMode;
	}

	/**
	 * Returns information if the AMC mode is available for current session
	 * @return bool
	 * @throws \ConfigException
	 */
	public function isAvailable() {
		return $this->usingMobileMode
			&& $this->config->get( self::AMC_MODE_CONFIG_NAME )
			&& !$this->context->getUser()->isAnon();
	}

	/**
	 * Get the mode identifier (used in configs)
	 *
	 * @return string
	 */
	public function getModeIdentifier() {
		return self::AMC_MODE_IDENTIFIER;
	}
}
