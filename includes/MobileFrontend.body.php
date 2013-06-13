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

		$this->sendHeaders();

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
}
