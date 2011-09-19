<?php
global $wgExtensionAssetsPath, $wgMobileFrontendLogo;

$searchField = htmlspecialchars( self::$searchField );
$mainPageUrl = self::$mainPageUrl;
$randomPageUrl = self::$randomPageUrl;
$homeButton = self::$messages['mobile-frontend-home-button'];
$randomButton = self::$messages['mobile-frontend-random-button'];

$scriptUrl = wfScript();

$searchWebkitHtml = <<<EOD
<div id='header'>
  <div id='searchbox'>
	<img width="35" height="22" alt='Logo' id='logo' src='{$wgMobileFrontendLogo}' />
    <form action='{$scriptUrl}' class='search_bar' method='get'>
      <input type="hidden" value="Special:Search" name="title" />
		<div id="sq" class="divclearable">
		    <input type="text" name="search" id="search" size="28" value="{$searchField}" />
		    <div class="clearlink" id="clearsearch"></div>
		</div>
      <button id='goButton' type='submit'></button>
    </form>
  </div>
  <div class='nav' id='nav'>
    <form method="get" action="{$mainPageUrl}"><button type="submit" id="homeButton">{$homeButton}</button></form>
    <form method="get" action="{$randomPageUrl}"><button type="submit" id="randomButton">{$randomButton}</button></form>
  </div>
</div>
EOD;
