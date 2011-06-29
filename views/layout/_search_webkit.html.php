<?php
global $wgExtensionAssetsPath;

$searchField = (!empty($_GET['search'])) ? $_GET['search'] : '';

$mainPageUrl = self::$mainPageUrl;
$randomPageUrl = self::$randomPageUrl;

$searchWebkitHtml = <<<EOD
<div id='header'> 
  <div id='searchbox'> 
    <img alt='W logo' id='logo' src='{$wgExtensionAssetsPath}/MobileFrontend/stylesheets/images/w.gif' />
    <form action='/index.php' class='search_bar' method='get'> 
	  <input type="hidden" value="Special:Search" name="title" /> 
	  <input type="hidden" value="Search" name="fulltext" /> 
	  <input type="hidden" value="0" name="redirs" />
      <input id='searchField' name='search' size='28' type='text' value='{$searchField}' /> 
      <button id='goButton' type='submit'></button>
    </form>
  </div> 
  <div class='nav' id='nav'> 
    <form method="get" action="{$mainPageUrl}"><button type="submit" id="homeButton">{$homeButton}</button></form> 
    <form method="get" action="{$randomPageUrl}"><button type="submit" id="randomButton">{$randomButton}</button></form> 
  </div>
</div>
EOD;
