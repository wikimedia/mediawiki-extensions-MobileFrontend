<?php

class ExtMobileFrontend extends ContextSource {

	public function __construct( IContextSource $context ) {
		$this->setContext( $context );
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
		wfProfileOut( __METHOD__ . '-formatter-init' );

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
