<?php

$lang = self::$code;
$currentURL = self::$currentURL;
$currentURL = str_replace('&mobileaction=disable_mobile_site', '', $currentURL);

$disableHtml = <<<EOT
 <h1>
		  {$areYouSure}
		</h1>
		<p>
		  {$explainDisable}
		</p>
		<div id='disableButtons'>
		<form action='http://{$lang}.wikipedia.org/w/mobileRedirect.php' method='get'>
			<input name='to' type='hidden' value='{$currentURL}' />
			<input name='expires_in_days' type='hidden' value='3650' />
			<button id='disableButton' type='submit'>{$disableButton}</button>
		</form>
		<form action='/' method='get'>
			<button id='backButton' type='submit'>{$backButton}</button>
		</form>
		</div>
EOT;
