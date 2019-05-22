<?php

namespace MobileFrontend;

/**
 * Helper for operations on domain names
 *
 * Interface DomainExtractorInterface
 */
interface BaseDomainExtractorInterface {

	/**
	 * Try to extract the base domain from $server
	 * Returns $server if no base domain is found.
	 *
	 * @param string $server URL
	 * @return string|null Hostname
	 */
	public function getCookieDomain( $server );
}
