<?php

if ( !defined( 'MEDIAWIKI' ) ) {
	die( -1 );
}

class ApplicationTemplate extends MobileFrontendTemplate {

	public function getHTML() {

		if ( $this->data['wgAppleTouchIcon'] !== false ) {
			$appleTouchIconTag = Html::element( 'link', array( 'rel' => 'apple-touch-icon', 'href' => $this->data['wgAppleTouchIcon'] ) );
		} else {
			$appleTouchIconTag = '';
		}

		$zeroRatedBanner = ( isset( $this->data['zeroRatedBanner'] ) ) ? str_replace( 'style="display:none;"', '', $this->data['zeroRatedBanner'] ) : '';

		if ( $zeroRatedBanner ) {
			if ( strstr( $zeroRatedBanner, 'id="zero-rated-banner"><span' ) ) {
				$dismissNotification = ( isset( $this->data['dismissNotification'] )) ? $this->data['dismissNotification'] : ''; 
				$zeroRatedBanner = str_replace( 'id="zero-rated-banner"><span', 'id="zero-rated-banner"><span class="notify-close"><a id="dismiss-notification" title="' . $dismissNotification . '">×</a></span><span', $zeroRatedBanner );
			}
		}

		$resourceSuffix = ( $this->data['minifyJS'] ) ? 'min.' : '';
		$betaPrefix = ( $this->data['isBetaGroupMember'] ) ? 'beta_' : '';

		$noticeHtml = ( isset( $this->data['noticeHtml'] ) ) ? $this->data['noticeHtml'] : '';

		$cssFileName = ( isset( $this->data['device']['css_file_name'] ) ) ? $this->data['device']['css_file_name'] : 'default';

		$startScriptTag = '<script type="text/javascript" language="javascript" src="';
		$endScriptTag = '"></script>';
		$javaScriptPath =  $this->data['wgExtensionAssetsPath'] . '/MobileFrontend/javascripts/';

		$jQueryScript = ( $this->data['device']['supports_jquery'] ) ? $startScriptTag . $javaScriptPath . 'jquery-1.7.1.min.js' . $endScriptTag : '';
		$filePageScript = ( $this->data['isFilePage'] ) ? $startScriptTag . $javaScriptPath . 'filepage.js?version=122920111241' . $endScriptTag : '';

		$startLinkTag = "<link href='{$this->data['wgExtensionAssetsPath']}/MobileFrontend/stylesheets/";
		$endLinkTag = "' media='all' rel='Stylesheet' type='text/css' />";
		$filePageStyle = ( $this->data['isFilePage'] ) ? $startLinkTag . 'filepage.css' . $endLinkTag : '';

		$applicationHtml = <<<HTML
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
		"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html lang='{$this->data['code']}' dir='{$this->data['dir']}' xml:lang='{$this->data['code']}' xmlns='http://www.w3.org/1999/xhtml'>
		  <head>
			<title>{$this->data['htmlTitle']}</title>
			<meta http-equiv="content-type" content="application/xhtml+xml; charset=utf-8" />
			<link href='{$this->data['wgExtensionAssetsPath']}/MobileFrontend/stylesheets/{$betaPrefix}common.css?version=1331255385' media='all' rel='Stylesheet' type='text/css' />
			<link href='{$this->data['wgExtensionAssetsPath']}/MobileFrontend/stylesheets/{$cssFileName}.css?version=1331255385' media='all' rel='Stylesheet' type='text/css' />
			{$filePageStyle}
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			{$appleTouchIconTag}
			{$jQueryScript}
			<script type='text/javascript'>
			  //<![CDATA[
				var title = "{$this->data['htmlTitle']}";
				var scriptPath = "{$this->data['wgScriptPath']}";
				var placeholder = "{$this->data['placeholder']}";
				var showText = "{$this->data['showText']}";
				var hideText = "{$this->data['hideText']}";
			  //]]>
			</script>
		  </head>
		  <body>
			{$zeroRatedBanner}
			{$this->data['searchWebkitHtml']}
			<div class='show' id='content_wrapper'>
			{$noticeHtml}
			{$this->data['contentHtml']}
			</div>
			{$this->data['footerHtml']}
			<!--[if gt IE 9]><!-->
			{$startScriptTag}{$javaScriptPath}{$betaPrefix}application.{$resourceSuffix}js?version=1331255385{$endScriptTag}
			{$startScriptTag}{$javaScriptPath}banner.{$resourceSuffix}js?version=1331255385{$endScriptTag}
			{$startScriptTag}{$javaScriptPath}{$betaPrefix}opensearch.{$resourceSuffix}js?version=1331250599{$endScriptTag}
			{$filePageScript}
			<!--[endif]-->
		  </body>
		</html>
HTML;
		return $applicationHtml;
	}
}
