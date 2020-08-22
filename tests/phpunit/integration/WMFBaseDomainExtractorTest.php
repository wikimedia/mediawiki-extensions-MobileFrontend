<?php

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontend\WMFBaseDomainExtractor
 */
class WMFBaseDomainExtractorTest extends \PHPUnit\Framework\TestCase {
	/**
	 * @covers ::getCookieDomain
	 * @covers ::matchBaseHostname
	 * @covers ::extractSubdomain
	 * @covers ::endsWith
	 * @dataProvider getBaseDomainProvider
	 */
	public function testGetBaseDomain( $server, $baseDomain ) {
		$extractor = new \MobileFrontend\WMFBaseDomainExtractor();
		$this->assertEquals( $baseDomain, $extractor->getCookieDomain( $server ) );
	}

	public function getBaseDomainProvider() {
		return [
			// Production wikis
			[ 'http://wikipedia.org', '.wikipedia.org' ],
			[ 'https://en.wikipedia.org', '.wikipedia.org' ],
			[ 'http://en.m.wikipedia.org', '.wikipedia.org' ],
			[ '//en.m.wikipedia.org', '.wikipedia.org' ],
			[ 'http://wikiversity.org', '.wikiversity.org' ],
			[ 'https://office.wikimedia.org', '.office.wikimedia.org' ],
			[ 'https://commons.wikimedia.org', '.commons.wikimedia.org' ],
			[ 'https://mediawiki.org', '.mediawiki.org' ],
			// Beta cluster
			[ 'http://en.wikipedia.beta.wmflabs.org', '.wikipedia.beta.wmflabs.org' ],
			[ 'https://en.m.wikipedia.beta.wmflabs.org', '.wikipedia.beta.wmflabs.org' ],
			[ 'http://en.wikiversity.beta.wmflabs.org', '.wikiversity.beta.wmflabs.org' ],
			[ 'http://en.m.wikiversity.beta.wmflabs.org', '.wikiversity.beta.wmflabs.org' ],
			// IP address
			[ 'http://127.0.0.1', '127.0.0.1' ],
			[ 'http://127.0.0.1:8080', '127.0.0.1' ],
			// Other possible domains/client instances
			[ 'http://localhost', 'localhost' ],
			[ 'http://mediawiki.dev', 'mediawiki.dev' ],
			[ 'http://test.co.uk', 'test.co.uk' ],
			[ 'http://wiki.test.com.pl', 'wiki.test.com.pl' ],
			// Vagrant instances
			[ 'http://php5.local.wmftest.net:8080/', '.local.wmftest.net' ],
			[ 'https://wiki.local.wmftest.net:8080/', '.local.wmftest.net' ],
			// Edge cases
			[ 'mediawiki.org', null ],
			[ 'TestString', null ],
			[ '', '' ],
			[ null, null ]
		];
	}
}
