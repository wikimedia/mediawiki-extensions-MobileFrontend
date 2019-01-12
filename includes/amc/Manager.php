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
	const AMC_MODE_CONFIG_NAME = 'MFAdvancedMobileContributions';

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
	 * @param \Config $config Config object
	 * @param \IContextSource $context
	 */
	public function __construct( Config $config, IContextSource $context ) {
		$this->config = $config;
		$this->context = $context;
	}

	/**
	 * Returns information if the AMC mode is available for current session
	 * @return bool
	 * @throws \ConfigException
	 */
	public function isAvailable() {
		return $this->config->get( self::AMC_MODE_CONFIG_NAME )
			&& !$this->context->getUser()->isAnon();
	}

}
