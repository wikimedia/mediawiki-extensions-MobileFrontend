<?php

if ( !defined( 'MEDIAWIKI' ) ) {
	die( -1 );
}

class ApplicationTemplate extends MobileFrontendTemplate {

	public function getHTML() {
		global $wgMobileResourceVersion;
		if ( $this->data['wgAppleTouchIcon'] !== false ) {
			$appleTouchIconTag = Html::element( 'link', array( 'rel' => 'apple-touch-icon', 'href' => $this->data['wgAppleTouchIcon'] ) );
		} else {
			$appleTouchIconTag = '';
		}

		$htmlTitle = htmlspecialchars( $this->data['htmlTitle'] );
		$zeroRatedBanner = ( isset( $this->data['zeroRatedBanner'] ) ) ? str_replace( 'style="display:none;"', '', $this->data['zeroRatedBanner'] ) : '';

		if ( $zeroRatedBanner ) {
			if ( strstr( $zeroRatedBanner, 'id="zero-rated-banner"><span' ) ) {
				$dismissNotification = ( isset( $this->data['dismissNotification'] )) ? $this->data['dismissNotification'] : ''; 
				$zeroRatedBanner = str_replace( 'id="zero-rated-banner"><span', 'id="zero-rated-banner"><span', $zeroRatedBanner );
			}
		}

		$resourceSuffix = ( $this->data['minifyJS'] ) ? 'min.' : '';
		$betaPrefix = ( $this->data['isBetaGroupMember'] ) ? 'beta_' : '';

		$noticeHtml = ( isset( $this->data['noticeHtml'] ) ) ? $this->data['noticeHtml'] : '';

		$startScriptTag = '<script type="text/javascript" src="';
		$endScriptTag = "?version={$wgMobileResourceVersion}\"></script>";
		$javaScriptPath =  $this->data['wgExtensionAssetsPath'] . '/MobileFrontend/javascripts/';

		$jQuerySupport = $this->data['device']['supports_jquery'];
		$jQueryScript = $jQuerySupport ? "{$startScriptTag}{$javaScriptPath}jquery-1.7.2.min.js{$endScriptTag}" : '';
		$filePageScript = ( $this->data['isFilePage'] ) ? $startScriptTag . $javaScriptPath . 'filepage.js?version=' . $wgMobileResourceVersion . $endScriptTag : '';

		$robots = isset( $this->data['robots'] ) ? "\n			{$this->data['robots']}" : '';

		$jsconfig = array(
			'messages' => array(
				'expand-section' => wfMsg( 'mobile-frontend-show-button' ),
				'collapse-section' => wfMsg( 'mobile-frontend-hide-button' ),
				'remove-results' => wfMsg( 'mobile-frontend-wml-back' ),
				),
			'settings' => array(
				'scriptPath' => ( $this->data['wgScriptPath'] ),
				'useFormatCookieName' => ( $this->data['useFormatCookieName'] ),
				'useFormatCookieDuration' => ( $this->data['useFormatCookieDuration'] ),
				'useFormatCookieDomain' => ( $this->data['useFormatCookieDomain'] ),
				'useFormatCookiePath' => ( $this->data['useFormatCookiePath'] ),
				'stopMobileRedirectCookieName' => ( $this->data['stopMobileRedirectCookieName'] ),
				'stopMobileRedirectCookieDuration' => ( $this->data['stopMobileRedirectCookieDuration'] ),
				'stopMobileRedirectCookieDomain' => ( $this->data['stopMobileRedirectCookieDomain'] ),
			),
		);
		if ( $this->data['title']->isMainPage() ) {
			$jsconfig['messages']['empty-homepage'] = wfMsg( 'mobile-frontend-empty-homepage' );
			$firstHeading = Html::element( 'h1', array( 'id' => 'firstHeading' ),
				$this->data['pageTitle']
			);
		} else {
			$firstHeading = '';
		}
		$configuration = FormatJSON::encode( $jsconfig );

		if( $this->data['isBetaGroupMember'] && $jQuerySupport ) {
			$betajs = <<<HTML
			{$startScriptTag}{$javaScriptPath}references.{$resourceSuffix}js{$endScriptTag}
HTML;
		} else {
			$betajs = "";
		}
		$applicationHtml = <<<HTML
		<!DOCTYPE html>
		<html lang='{$this->data['code']}' dir='{$this->data['dir']}' xml:lang='{$this->data['code']}' xmlns='http://www.w3.org/1999/xhtml'>
		  <head>
			<title>{$htmlTitle}</title>
			<meta http-equiv="content-type" content="text/html; charset=utf-8" />{$robots}
			{$this->data['cssLinks']}
			<meta name="viewport" content="initial-scale=1.0, user-scalable=yes">
			{$appleTouchIconTag}
			{$jQueryScript}
			<script type="text/javascript">
			var mwMobileFrontendConfig = {$configuration};
			</script>
		  </head>
		  <body class="mobile">
			{$zeroRatedBanner}
			{$this->data['searchWebkitHtml']}
			<div class='show' id='content_wrapper'>
			{$noticeHtml}
			<div id="content">
			{$firstHeading}
			{$this->data['contentHtml']}
			</div>
			</div>
			{$this->data['footerHtml']}
			<!--[if gt IE 9]><!-->
			{$startScriptTag}{$javaScriptPath}application.{$resourceSuffix}js{$endScriptTag}
			{$startScriptTag}{$javaScriptPath}toggle.{$resourceSuffix}js{$endScriptTag}
			{$startScriptTag}{$javaScriptPath}banner.{$resourceSuffix}js{$endScriptTag}
			{$startScriptTag}{$javaScriptPath}{$betaPrefix}opensearch.{$resourceSuffix}js{$endScriptTag}
			{$betajs}
			{$filePageScript}
			<!--[endif]-->
		  </body>
		</html>
HTML;
		return $applicationHtml;
	}
}
