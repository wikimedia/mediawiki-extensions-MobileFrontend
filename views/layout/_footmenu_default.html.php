<?php

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
