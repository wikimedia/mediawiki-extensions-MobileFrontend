<?php
global $wgExtensionAssetsPath, $wgAppleTouchIcon, $wgScriptPath;

$dir = self::$dir;
$code = self::$code;
$placeholder = self::$messages['mobile-frontend-placeholder'];

if ( $wgAppleTouchIcon !== false ) {
	$appleTouchIconTag = Html::element( 'link', array( 'rel' => 'apple-touch-icon', 'href' => $wgAppleTouchIcon ) );
} else {
	$appleTouchIconTag = "";
}

$betaPrefix = ( self::$isBetaGroupMember ) ? 'beta_' : '';

$noticeHtml = empty( $noticeHtml ) ? '' : $noticeHtml;

$cssFileName = ( isset( self::$device['css_file_name'] ) ) ? self::$device['css_file_name'] : 'default';

$startScriptTag = '<script type="text/javascript" language="javascript" src="';
$endScriptTag = '"></script>';
$javaScriptPath = $wgExtensionAssetsPath . '/MobileFrontend/javascripts/';

$openSearchScript = $startScriptTag . $javaScriptPath . $betaPrefix . 'opensearch.js?version=12012011126437' . $endScriptTag;
$jQueryScript = ( self::$device['supports_jquery'] ) ? $startScriptTag . $javaScriptPath . 'jquery-1.7.1.min.js' . $endScriptTag : '';

$applicationHtml = <<<HTML
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang='{$code}' dir='{$dir}' xml:lang='{$code}' xmlns='http://www.w3.org/1999/xhtml'>
  <head>
	<title>{$htmlTitle}</title>
	<meta http-equiv="content-type" content="application/xhtml+xml; charset=utf-8" />
	<link href='{$wgExtensionAssetsPath}/MobileFrontend/stylesheets/{$betaPrefix}common.css?version=12012011121954' media='all' rel='Stylesheet' type='text/css' />
	<link href='{$wgExtensionAssetsPath}/MobileFrontend/stylesheets/{$cssFileName}.css?version=12012011120715' media='all' rel='Stylesheet' type='text/css' />
	<meta name="ROBOTS" content="NOINDEX, NOFOLLOW" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	{$appleTouchIconTag}
	{$jQueryScript}
	<script type='text/javascript'>
	  //<![CDATA[
		var title = "{$htmlTitle}";
		var scriptPath = "{$wgScriptPath}";
		var placeholder = "{$placeholder}";
	  //]]>
	</script>
  </head>
  <body>
	{$searchWebkitHtml}
	<div class='show' id='content_wrapper'>
	{$noticeHtml}
	{$contentHtml}
	</div>
	{$footerHtml}
	 {$startScriptTag}{$javaScriptPath}{$betaPrefix}application.js?version=12012011120915{$endScriptTag}
	 {$openSearchScript}
  </body>
</html>
HTML;
