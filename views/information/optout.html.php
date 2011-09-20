<?php
$optOutHtml = <<<EOT
 <h1>
		  {$optOutMessage}
		</h1>
		<p>
			{$explainOptOut}
		</p>
		<div id='disableButtons'>
		<form action='/' method='get'>
			<input name='mobileaction' type='hidden' value='opt_out_cookie' />
			<button id='disableButton' type='submit'>{$yesButton}</button>
		</form>
		<form action='/' method='get'>
			<button id='backButton' type='submit'>{$noButton}</button>
		</form>
		</div>
EOT;
