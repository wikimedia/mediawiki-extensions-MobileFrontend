<?php

$regularSite = self::$messages['mobile-frontend-regular-site'];
$permStopRedirect = self::$messages['mobile-frontend-perm-stop-redirect'];
$copyright = self::$messages['mobile-frontend-copyright'];
$disableImages = self::$messages['mobile-frontend-disable-images'];
$enableImages = self::$messages['mobile-frontend-enable-images'];

if ( self::$disableImages == 0 ) {
	$imagesToggle = $disableImages;
	$imagesURL = '?disableImages=1';
} else {
	$imagesToggle = $enableImages;
	$imagesURL = '?enableImages=1';
}

$footerHtml = <<<EOD
    <div id='footer'> 
      <div class='nav' id='footmenu'> 
        <div class='mwm-notice'> 
          <a href="?mobileaction=view_normal_site">{$regularSite}</a> | <a href="{$imagesURL}">{$imagesToggle}</a>
            <div id="perm"> 
              <a href="?mobileaction=disable_mobile_site">{$permStopRedirect}</a> 
            </div> 
        </div> 
      </div> 
      <div id='copyright'>{$copyright}</div> 
    </div>

EOD;
