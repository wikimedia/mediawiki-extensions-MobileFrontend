<?php
$applicationHtml = <<<EOT
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 
<html lang='{$code}' dir='{$dir}' xml:lang='en' xmlns='http://www.w3.org/1999/xhtml'> 
  <head> 
    <title>{$title}</title> 
    <meta http-equiv="content-type" content="text/html; charset=utf-8" /> 
    <link href='/extensions/PatchOutputMobile/stylesheets/{$cssFileName}.css' media='all' rel='Stylesheet' type='text/css' /> 
    <meta name="ROBOTS" content="NOINDEX, NOFOLLOW" /> 
    <meta name = "viewport" content = "width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" /> 
    <link rel="apple-touch-icon" href="http://en.m.wikipedia.org/apple-touch-icon.png" /> 
    <script type='text/javascript'> 
      //<![CDATA[
        var title = "{$title}";
        var server = "http://en.wikipedia.org";
        function shouldCache() {
          return true;
        }
      //]]>
    </script> 
    <script type="text/javascript" language="javascript" SRC="/extensions/PatchOutputMobile/javascripts/jquery.js"></script> 
    <script type="text/javascript" language="javascript" SRC="/extensions/PatchOutputMobile/javascripts/application.js"></script> 
  </head>
  <body>
	{$searchWebkitHtml}
	<div class='show' id='content_wrapper'>
	{$donateHtml}
	{$contentHtml}
	</div>
	{$footerHtml}
  </body>
</html>
EOT;
