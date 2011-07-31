<?php
global $wgExtensionAssetsPath, $wgAppleTouchIcon;

if( $wgAppleTouchIcon !== false ) {
	$appleTouchIconTag = Html::element( 'link', array( 'rel' => 'apple-touch-icon', 'href' => $wgAppleTouchIcon ) );;
} else {
	$appleTouchIconTag = "";
}

$applicationHtml = <<<EOT
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 
<html lang='{$code}' dir='{$dir}' xml:lang='{$code}' xmlns='http://www.w3.org/1999/xhtml'> 
  <head> 
    <title>{$title}</title> 
    <meta http-equiv="content-type" content="text/html; charset=utf-8" /> 
    <link href='{$wgExtensionAssetsPath}/MobileFrontend/stylesheets/{$cssFileName}.css' media='all' rel='Stylesheet' type='text/css' /> 
    <meta name="ROBOTS" content="NOINDEX, NOFOLLOW" /> 
    <meta name = "viewport" content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" /> 
    ${wgAppleTouchIconTag} 
    <script type='text/javascript'> 
      //<![CDATA[
        var title = "{$title}";
        function shouldCache() {
          return true;
        }
      //]]>
    </script> 
    <script type="text/javascript" language="javascript" SRC="{$wgExtensionAssetsPath}/MobileFrontend/javascripts/jquery.js"></script> 
    <script type="text/javascript" language="javascript" SRC="{$wgExtensionAssetsPath}/MobileFrontend/javascripts/application.js"></script> 
  </head>
  <body>
	{$searchWebkitHtml}
	<div class='show' id='content_wrapper'>
	{$contentHtml}
	</div>
	{$footerHtml}
  </body>
</html>
EOT;
