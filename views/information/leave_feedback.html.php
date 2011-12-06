<?php

$leaveFeedbackHtml = <<<HTML
<form action='{$feedbackPostURL}' method='post'>
<input type="hidden" name="edittoken" value="{$editToken}"/>
<div tabindex="-1">
	<div unselectable="on">
		<span unselectable="on"><p>{$title}</p></span>
	</div>
	<div>
		<div>
			<div><p><small>{$notice}</small>
			</p></div>
			<div><p>{$subject}:<br><input type="text" name="subject" maxlength="60" style="width:40%;"></p>
			</div>
			<div><p>{$message}:<br><textarea name="message" style="width:40%;" rows="5" cols="60"></textarea></p>
			</div>
		</div>
	</div>
	<div><button onClick="javascript:history.back();" type="button"><span>{$cancel}</span></button>
	<input type="submit" value="{$submit}"></input>
	</div>
</div>
</form>

HTML;
