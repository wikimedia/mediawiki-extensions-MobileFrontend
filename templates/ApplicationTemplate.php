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

		$cssFileName = ( isset( $this->data['device']['css_file_name'] ) ) ? $this->data['device']['css_file_name'] : 'default';

		$startScriptTag = '<script type="text/javascript" src="';
		$endScriptTag = '"></script>';
		$javaScriptPath =  $this->data['wgExtensionAssetsPath'] . '/MobileFrontend/javascripts/';

		$jQuerySupport = $this->data['device']['supports_jquery'];
		$jQueryScript = $jQuerySupport ? $startScriptTag . $javaScriptPath . 'jquery-1.7.1.min.js' . $endScriptTag : '';
		$filePageScript = ( $this->data['isFilePage'] ) ? $startScriptTag . $javaScriptPath . 'filepage.js?version=' . $wgMobileResourceVersion . $endScriptTag : '';

		$startLinkTag = "<link href='{$this->data['wgExtensionAssetsPath']}/MobileFrontend/stylesheets/";
		$endLinkTag = "' media='all' rel='Stylesheet' type='text/css' />";
		$filePageStyle = ( $this->data['isFilePage'] ) ? $startLinkTag . 'filepage.css' . $endLinkTag : '';
		$buttonHideText = Xml::escapeJsString( $this->data['hideText'] );
		$buttonShowText = Xml::escapeJsString( $this->data['showText'] );
		$configureHomepage = $this->data['configure-empty-homepage'];
		$robots = isset( $this->data['robots'] ) ? "\n			{$this->data['robots']}" : '';

		$jsconfig = array(
			'messages' => array(
				'expand-section' => $buttonShowText,
				'collapse-section' => $buttonHideText,
				'empty-homepage' => $configureHomepage,
				),
			'settings' => array(
				'scriptPath' => ( $this->data['wgScriptPath'] ),
				'useFormatCookieName' => ( $this->data['useFormatCookieName'] ),
				'useFormatCookieDuration' => ( $this->data['useFormatCookieDuration'] ),
				'useFormatCookieDomain' => ( $this->data['useFormatCookieDomain'] ),
				'useFormatCookiePath' => ( $this->data['useFormatCookiePath'] ),
			),
		);
		$configuration = FormatJSON::encode( $jsconfig );

		if( $this->data['isBetaGroupMember'] && $jQuerySupport ) {
			$betajs = <<<HTML
			{$startScriptTag}{$javaScriptPath}references.{$resourceSuffix}js?version={$wgMobileResourceVersion}{$endScriptTag}
HTML;
		} else {
			$betajs = "";
		}
		$applicationHtml = <<<HTML
		<!DOCTYPE html>
		<html lang='{$this->data['code']}' dir='{$this->data['dir']}' xml:lang='{$this->data['code']}' xmlns='http://www.w3.org/1999/xhtml'>
		  <head>
			<title>{$this->data['htmlTitle']}</title>
			<meta http-equiv="content-type" content="text/html; charset=utf-8" />{$robots}
			{$this->data['cssLinks']}
			<link href='{$this->data['wgExtensionAssetsPath']}/MobileFrontend/stylesheets/{$cssFileName}.css?version={$wgMobileResourceVersion}' media='all' rel='Stylesheet' type='text/css' />
			{$filePageStyle}
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
			{$this->data['contentHtml']}
			</div>
			{$this->data['footerHtml']}
			<!--[if gt IE 9]><!-->
			{$startScriptTag}{$javaScriptPath}application.{$resourceSuffix}js?version={$wgMobileResourceVersion}{$endScriptTag}
			{$startScriptTag}{$javaScriptPath}toggle.{$resourceSuffix}js?version={$wgMobileResourceVersion}{$endScriptTag}
			{$startScriptTag}{$javaScriptPath}banner.{$resourceSuffix}js?version={$wgMobileResourceVersion}{$endScriptTag}
			{$startScriptTag}{$javaScriptPath}{$betaPrefix}opensearch.{$resourceSuffix}js?version={$wgMobileResourceVersion}{$endScriptTag}
			{$betajs}
			{$filePageScript}
			<!--[endif]-->
		  </body>
		</html>
HTML;
		return $applicationHtml;
	}
}
