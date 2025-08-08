<?php

namespace MobileFrontend;

use MediaWiki\MediaWikiServices;

/**
 * Utility class to find base domain for given host.
 *
 * This class contains a hardcoded list of all WMF hosts and WMF specific domain logic. As we never
 * experienced any bug requests from users and we do not change domains too often there is no need
 * to put that hosts list into settings.
 *
 * @see T148975
 */
class WMFBaseDomainExtractor implements BaseDomainExtractorInterface {
	/**
	 * @var string[]
	 */
	private array $wmfWikiHosts = [
		'wikipedia.org',
		'wikibooks.org',
		'wikiversity.org',
		'wikinews.org',
		'wiktionary.org',
		'wikisource.org',
		'wikiquote.org',
		'wikivoyage.org',
		'wikidata.org',
		'mediawiki.org',
		// local vagrant instances
		'local.wmftest.net'
	];
	/**
	 * @var string[]
	 */
	private array $wmfMultiDomainWikiHosts = [
		// commons, office, meta, outreach, wikimania, incubator, etc...
		'.wikimedia.org',
		// beta cluster
		'.beta.wmflabs.org',
		// all other labs
		'.wmflabs.org'
	];

	/**
	 * Although some browsers will accept cookies without the initial . in domain
	 * RFC 2109 requires it to be included.
	 *
	 * $server must be a valid URL (i.e. with the scheme included, http or https
	 * or protocol-relative e.g. //en.m.wikipedia.org'). NULL and empty strings
	 * can also be taken but will return NULL or empty string respectively.
	 *
	 * @inheritDoc
	 */
	public function getCookieDomain( $server ) {
		// Per http://php.net/manual/en/function.parse-url.php,
		// If the requested component doesn't exist within the given
		// URL, NULL will be returned. So UrlUtils::parse() will return
		// null as it calls parse_url() if a valid server URL is not
		// given except it's an empty string.
		$services = MediaWikiServices::getInstance();
		$urlUtils = $services->getUrlUtils();
		$host = $urlUtils->parse( (string)$server )['host'] ?? '';

		$wikiHost = $this->matchBaseHostname( $host, $this->wmfWikiHosts );
		if ( $wikiHost !== false ) {
			return '.' . $wikiHost;
		}

		$multiWikiHost = $this->matchBaseHostname( $host, $this->wmfMultiDomainWikiHosts );
		if ( $multiWikiHost !== false ) {
			return '.' . $this->extractSubdomain( $host, $multiWikiHost );
		}
		return $host;
	}

	/**
	 * Find out whether $hostname matches or is subdomain of any host from $hosts array
	 *
	 * @param string|null $hostname Visited host
	 * @param string[] $hosts Array of all wikimedia hosts
	 * @return bool|string Returns wikimedia host base domain, false when not found
	 */
	private function matchBaseHostname( $hostname, array $hosts ) {
		if ( $hostname === null ) {
			return false;
		}
		foreach ( $hosts as $wmfHost ) {
			if ( str_ends_with( $hostname, $wmfHost ) ) {
				return $wmfHost;
			}
		}
		return false;
	}

	/**
	 * Parse $host and return $baseDomain with first subdomain
	 * ex: extractSubdomain('en.commons.wikimedia.org', '.wikimedia.org') => 'commons.wikimedia.org'
	 *
	 * This function assumes that $fullHostname is a subdomain of $baseDomain. Please
	 * do the str_ends_with() check first before calling this function
	 *
	 * @param string $fullHostname
	 * @param string $baseDomain
	 * @return string
	 */
	private function extractSubdomain( $fullHostname, $baseDomain ) {
		$length = strlen( $baseDomain );

		$subdomains = explode( '.', substr( $fullHostname, 0, -$length ) );
		$subdomain = array_pop( $subdomains );
		return $subdomain . $baseDomain;
	}

}
