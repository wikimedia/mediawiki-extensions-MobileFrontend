<?php

namespace MobileFrontend\Tests;

/**
 * Class with utility methods for MF tests.
 */
class Utils {
	/**
	 * Used as test value for $wgMobileUrlCallback in MobileContextTest and MobileFrontendHooksTest.
	 *
	 * This is a copy of Wikimedia's mobile URL callback, but the logic of the callback
	 * itself is tested in the operations/mediawiki-config repo so the tests here don't
	 * need to cover that.
	 *
	 * @param string $domain
	 * @return string
	 */
	public static function mobileUrlCallback( string $domain ): string {
		switch ( $domain ) {
			case 'wikisource.org':
				return 'm.wikisource.org';
			case 'wikitech.wikimedia.org':
				return 'wikitech.wikimedia.org';
			case 'wikidata.beta.wmflabs.org':
				return 'm.wikidata.beta.wmflabs.org';
			case 'wikifunctions.beta.wmflabs.org':
				return 'm.wikifunctions.beta.wmflabs.org';
		}

		$domainParts = explode( '.', $domain );
		if ( $domainParts[0] === 'www' ) {
			$domainParts[0] = 'm';
		} else {
			array_splice( $domainParts, 1, 0, [ 'm' ] );
		}
		return implode( '.', $domainParts );
	}
}
