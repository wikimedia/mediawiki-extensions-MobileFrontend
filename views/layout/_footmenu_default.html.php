<?php

$regularSite = self::$messages['mobile-frontend-regular-site'];
$permStopRedirect = self::$messages['mobile-frontend-perm-stop-redirect'];
$copyright = self::$messages['mobile-frontend-copyright'];
$disableImages = self::$messages['mobile-frontend-disable-images'];
$enableImages = self::$messages['mobile-frontend-enable-images'];
$leaveFeedback = self::$messages['mobile-frontend-leave-feedback'];

$leaveFeedbackURL = self::$leaveFeedbackURL;
$disableMobileSiteURL = self::$disableMobileSiteURL;
$viewNormalSiteURL = self::$viewNormalSiteURL;

if ( self::$disableImages == 0 ) {
	$imagesToggle = $disableImages;
	$imagesURL = self::$disableImagesURL;
} else {
	$imagesToggle = $enableImages;
	$imagesURL = self::$enableImagesURL;
}

$logoutLink = ( !empty( $logoutHtml ) ) ? ' | ' . $logoutHtml : '';

$feedbackLink = ( self::$code == 'en' && self::$isBetaGroupMember ) ? "| <a href=\"{$leaveFeedbackURL}\">{$leaveFeedback}</a>" : '';

$footerHtml = <<<EOD
	<div id='footer'>
	  <div class='nav' id='footmenu'>
		<div class='mwm-notice'>
		  <a href="{$viewNormalSiteURL}">{$regularSite}</a> | <a href="{$imagesURL}">{$imagesToggle}</a> {$feedbackLink} {$logoutLink}
			<div id="perm">
				<a href="{$disableMobileSiteURL}">{$permStopRedirect}</a>
			</div>
		</div>
	  </div>
	  <div id='copyright'>{$copyright}</div>
	</div>

EOD;
