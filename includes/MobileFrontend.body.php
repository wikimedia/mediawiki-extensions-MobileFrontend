<?php

class ExtMobileFrontend extends ContextSource {
	/**
	 * @param OutputPage $out
	 *
	 * @return string
	 */
	public static function DOMParse( OutputPage $out ) {
		// Debug logging: we need a list of Accept: headers to make some WAP detection decisions
		// Done here to make sure that only mobile view requests are logged
		if ( mt_rand( 0, 100 ) == 0 ) {
			$req = $out->getRequest();
			$ua = $req->getHeader( 'User-Agent' );
			$accept = $req->getHeader( 'Accept' );
			$wap = $req->getHeader( 'X-WAP' );
			$subdomain = $req->getHeader( 'X-Subdomain' );
			$cs = $req->getHeader( 'X-CS' );
			wfDebugLog( 'wap', "User-agent: '$ua', Accept: '$accept', X-WAP: '$wap', X-Subdomain: '$subdomain', X-CS: '$cs'" );
		}

		wfProfileIn( __METHOD__ );

		$html = $out->getHTML();

		wfProfileIn( __METHOD__ . '-formatter-init' );
		$context = MobileContext::singleton();

		$formatter = MobileFormatter::newFromContext( $context, $html );
		wfProfileOut( __METHOD__ . '-formatter-init' );

		wfRunHooks( 'MobileFrontendBeforeDOM', array( $context, $formatter ) );

		wfProfileIn( __METHOD__ . '-filter' );
		$specialPage = $out->getTitle()->isSpecialPage();
		if ( $context->getContentTransformations() ) {
			// Remove images if they're disabled from special pages, but don't transform otherwise
			$formatter->filterContent( /* remove defaults */ !$specialPage );
		}
		wfProfileOut( __METHOD__ . '-filter' );

		wfProfileIn( __METHOD__ . '-getText' );
		$contentHtml = $formatter->getText();
		wfProfileOut( __METHOD__ . '-getText' );

		wfProfileOut( __METHOD__ );
		return $contentHtml;
	}
}
