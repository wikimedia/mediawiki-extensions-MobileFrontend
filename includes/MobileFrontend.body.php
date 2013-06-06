<?php

class ExtMobileFrontend extends ContextSource {

	protected $zeroRatedBanner;

	public function __construct( IContextSource $context ) {
		$this->setContext( $context );
	}

	/**
	 * FIXME: Move to ZeroRatedMobileAccess extension
	 * @return string
	 */
	public function getZeroRatedBanner() {
		$zeroRatedBanner = $this->zeroRatedBanner ? str_replace( 'display:none;', '', $this->zeroRatedBanner ) : '';

		if ( $zeroRatedBanner ) {
			if ( strstr( $zeroRatedBanner, 'id="zero-rated-banner"><span' ) ) {
				$zeroRatedBanner = str_replace( 'id="zero-rated-banner"><span', 'id="zero-rated-banner"><span', $zeroRatedBanner );
			}
		}
		return $zeroRatedBanner;
	}

	/**
	 * @param $out OutputPage
	 */
	protected function beforePageDisplay( $out ) {
		wfProfileIn( __METHOD__ );

		$this->setDefaultLogo();

		$this->disableCaching();
		$this->sendHeaders();

		wfProfileOut( __METHOD__ );
	}

	/**
	 * Disables caching if the request is coming from a trusted proxy
	 */
	private function disableCaching() {
		wfProfileIn( __METHOD__ );

		// Fetch the REMOTE_ADDR and check if it's a trusted proxy.
		// Is this enough, or should we actually step through the entire
		// X-FORWARDED-FOR chain?
		if ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
			$ip = IP::canonicalize( $_SERVER['REMOTE_ADDR'] );
		} else {
			$ip = null;
		}

		$request = $this->getRequest();
		if ( wfIsConfiguredProxy( $ip ) ) {
			$request->response()->header( 'Cache-Control: no-cache, must-revalidate' );
			$request->response()->header( 'Expires: Sat, 26 Jul 1997 05:00:00 GMT' );
			$request->response()->header( 'Pragma: no-cache' );
		}

		wfProfileOut( __METHOD__ );
	}

	private function sendHeaders() {
		global $wgMFVaryResources;

		wfProfileIn( __METHOD__ );
		$out = $this->getOutput();
		$xDevice = MobileContext::singleton()->getXDevice();
		$request = $this->getRequest();
		$xWap = $request->getHeader( 'X-WAP' );
		if ( $xDevice !== '' && !$wgMFVaryResources ) {
			$request->response()->header( "X-Device: {$xDevice}" );
			$out->addVaryHeader( 'X-Device' );
		} elseif ( $xWap ) {
			$out->addVaryHeader( 'X-WAP' );
			$request->response()->header( "X-WAP: $xWap" );
		}
		$out->addVaryHeader( 'Cookie' );
		// @todo: these should be set by Zero
		$out->addVaryHeader( 'X-CS' );
		$out->addVaryHeader( 'X-Subdomain' );
		$out->addVaryHeader( 'X-Images' );
		wfProfileOut( __METHOD__ );
	}

	/**
	 * @param OutputPage $out
	 *
	 * @return string
	 */
	public function DOMParse( OutputPage $out ) {
		wfProfileIn( __METHOD__ );

		$this->beforePageDisplay( $out );
		$html = $out->getHTML();

		wfProfileIn( __METHOD__ . '-formatter-init' );
		$context = MobileContext::singleton();
		$formatter = MobileFormatter::newFromContext( $context, $html );
		$doc = $formatter->getDoc();
		wfProfileOut( __METHOD__ . '-formatter-init' );

		wfProfileIn( __METHOD__ . '-zero' );
		$zeroRatedBannerElement = $doc->getElementById( 'zero-rated-banner' );

		if ( !$zeroRatedBannerElement ) {
			$zeroRatedBannerElement = $doc->getElementById( 'zero-rated-banner-red' );
		}

		if ( $zeroRatedBannerElement ) {
			$this->zeroRatedBanner = $doc->saveXML( $zeroRatedBannerElement, LIBXML_NOEMPTYTAG );
		}
		wfProfileOut( __METHOD__ . '-zero' );

		wfProfileIn( __METHOD__ . '-filter' );
		if ( $context->getContentTransformations() ) {
			$formatter->filterContent();
		}
		wfProfileOut( __METHOD__ . '-filter' );

		wfProfileIn( __METHOD__ . '-getText' );
		$contentHtml = $formatter->getText();
		wfProfileOut( __METHOD__ . '-getText' );

		wfProfileOut( __METHOD__ );
		return $contentHtml;
	}

	/**
	 * Sets up the default logo image used in mobile view if none is set
	 */
	public function setDefaultLogo() {
		global $wgMobileFrontendLogo, $wgExtensionAssetsPath, $wgMFCustomLogos;
		wfProfileIn( __METHOD__ );
		if ( $wgMobileFrontendLogo === false ) {
			$wgMobileFrontendLogo = $wgExtensionAssetsPath . '/MobileFrontend/images/mw.png';
		}

		if ( MobileContext::singleton()->isBetaGroupMember() && isset( $wgMFCustomLogos['logo'] ) ) {
			$wgMobileFrontendLogo = $wgMFCustomLogos['logo'];
		}
		wfProfileOut( __METHOD__ );
	}
}
