<?php
if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

/**
 * Pages with smaller parsed HTML size are not cached
 * Set to 0 to cache everything or to some large value to disable caching completely
 */
$wgMFMinCachedPageSize = 64 * 1024;

/**
 * Set this to true to automatically show mobile view depending on people's user-agent.
 * WARNING: Make sure that your caching infrastructure is configured appropriately, to avoid
 * people receiving cached versions of pages intended for someone else's devices.
 */
$wgMFAutodetectMobileView = false;


/**
 * Controls whether tablets should be shown the mobile site. Works only if
 * $wgMFAutodetectMobileView is true.
 */
$wgMFShowMobileViewToTablets = true;

/**
 * Devices with available screen of this value and less will have some styles
 * adapted for improved reading on small screens.
 */
$wgMFDeviceWidthMobileSmall = 280;

/**
 * Minimum available screen width at which a device can be considered a tablet/desktop
 * The number is currently based on the device width of a Samsung Galaxy S5 mini.
 */
$wgMFDeviceWidthTablet = 720;

/**
 * Template for mobile URLs.
 *
 * This will be used to transcode regular URLs into mobile URLs for the
 * mobile view.
 *
 * It's possible to specify the 'mobileness' of the URL in the host portion of
 * the URL.
 *
 * You can either statically or dynamically create the host-portion of your
 * mobile URL. To statically create it, just set $wgMobileUrlTemplate to
 * the static hostname. For example:
 *		$wgMobileUrlTemplate = "mobile.mydomain.com";
 *
 * Alternatively, the host definition can include placeholders for different
 * parts of the 'host' section of a URL. The placeholders are denoted by '%h'
 * and followed with a digit that maps to the position of a host-part of the
 * original, non-mobile URL. Take the host 'en.wikipedia.org' for example.
 * '%h0' maps to 'en', '%h1' maps to 'wikipedia', and '%h2' maps to 'org'.
 * So, if you wanted a mobile URL scheme that turned "en.wikipedia.org" into
 * "en.m.wikipedia.org", your URL template would look like:
 * 		%h0.m.%h1.%h2
 */
$wgMobileUrlTemplate = '';

/**
 * The number of seconds the 'useformat' cookie should be valid
 *
 * The useformat cookie gets set when a user manually elects to view
 * either the mobile or desktop view of the site.
 *
 * If this value is not set, it will default to $wgCookieExpiration
 */
$wgMobileFrontendFormatCookieExpiry = null;

/**
 * Set to false to allow search engines to index your mobile pages. So far, Google seems
 * to mix mobile and non-mobile pages in its search results, creating confusion.
 */
$wgMFNoindexPages = true;

/**
 * Set the domain of the stopMobileRedirect cookie
 *
 * If this value is not set, it will default to the top domain of the host name
 * (eg en.wikipedia.org = .wikipedia.org)
 * If you want to set this to a top domain (to cover all subdomains), be sure
 * to include the preceding '.' (eg .wikipedia.org NOT wikipedia.org)
 */
$wgMFStopRedirectCookieHost = null;

/**
 * Make the logos configurable.
 *
 * Currently, 'copyright', 'copyright-width', and 'copyright-height' elements are supported.
 * 'copyright' is the URL of the logo displayed in the footer
 * 'copyright-width' (optional) is the width in pixels of the copyright image you want to display
 * 'copyright-height' (optional) is the height in pixels of the copyright image you want to display
 * If the actual 'copyright' dimensions are 200x30, then you may want to set the width and height
 * to 100 and 15 respectively (in order to support retina screens).
 *
 * Example: array(
 *	'copyright' => '/images/mysite_copyright_logo.png',
 *	'copyright-width' => 100,
 *	'copyright-height' => 15,
 *	);
 */
$wgMFCustomLogos = array();

/**
 * Path to the logo used in the login/signup form
 * The standard height is 72px
 * FIXME: Merge with $wgMFCustomLogos
 */
$wgMobileFrontendLogo = false;

/**
 * Whether to append a trademark notice to the sitename in the page footer.
 *
 * If set to true or 'unregistered', adds a ™ to the sitename.
 * If set to 'registered' adds a ® to the sitename.
 * If set to false, adds nothing (the default).
 *
 * You can also edit the 'mobile-frontend-footer-sitename' message directly.
 */
$wgMFTrademarkSitename = false;

/**
 * Name of the class used for mobile device detection, must be inherited from
 * IDeviceDetector.
 */
$wgDeviceDetectionClass = 'DeviceDetection';

/**
 * Whether beta mode is enabled
 */
$wgMFEnableBeta = false;

/**
 * Optional string to mobile friendly url for donation page.
 */
$wgMFDonationUrl = false;

/**
 * The content namespace(s) that Special:Nearby and Special:Random should use.
 * Should be one or more of NS_* constants, pipe-separated.
 * @var int|string
 */
$wgMFContentNamespace = NS_MAIN;

/**
 * Sets RSS feed <link> being outputted or not.
 * @var bool
 */
$wgMFRSSFeedLink = false;
