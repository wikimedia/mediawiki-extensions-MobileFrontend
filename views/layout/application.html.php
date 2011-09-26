<?php
global $wgExtensionAssetsPath, $wgAppleTouchIcon;

$dir = self::$dir;
$code = self::$code;

if ( $wgAppleTouchIcon !== false ) {
	$appleTouchIconTag = Html::element( 'link', array( 'rel' => 'apple-touch-icon', 'href' => $wgAppleTouchIcon ) );
} else {
	$appleTouchIconTag = "";
}

$noticeHtml = empty( $noticeHtml ) ? '' : $noticeHtml;

$cssFileName = ( isset( self::$device['css_file_name'] ) ) ? self::$device['css_file_name'] : 'default';

$applicationHtml = <<<EOT
<!DOCTYPE html PUBLIC
  "-//WAPFORUM//DTD XHTML Mobile 1.2//EN"
  "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">
<html lang='{$code}' dir='{$dir}' xml:lang='{$code}' xmlns='http://www.w3.org/1999/xhtml'>
  <head>
	<title>{$htmlTitle}</title>
	<meta http-equiv="content-type" content="application/xhtml+xml; charset=utf-8" />
	<link href='{$wgExtensionAssetsPath}/MobileFrontend/stylesheets/{$cssFileName}.css' media='all' rel='Stylesheet' type='text/css' />
	<meta name="ROBOTS" content="NOINDEX, NOFOLLOW" />
	<meta name = "viewport" content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
	${appleTouchIconTag}
	<script type='text/javascript'>
	  //<![CDATA[
		var title = "{$htmlTitle}";
		function shouldCache() {
		  return true;
		}
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
	 <script type="text/javascript" language="javascript" src="{$wgExtensionAssetsPath}/MobileFrontend/javascripts/application.js?version=20110920T172820Z"></script>
  </body>
</html>
EOT;
