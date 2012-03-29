<?php

if ( !defined( 'MEDIAWIKI' ) ) {
	die( -1 );
}

class LeaveFeedbackTemplate extends MobileFrontendTemplate {

	public function getHTML() {

		$leaveFeedbackHtml = <<<HTML
		<div class='feedback'>
		<h1>Contact Us</h1>
		<form id='mf-feedback' action='{$this->data['feedbackPostURL']}' method='post'>
			<input type='hidden' name='edittoken' value='{$this->data['editToken']}' />
			<input type='email' class='email' name='email' maxlength='60' placeholder='Your email address'>
			<select>
				<option>Please select a category</option>
				<option>Technical Problem</option>
				<option>General</option>
				<option>Article Feedback</option>
			</select>
			<textarea name='message' rows='5' placeholder='Type your comment here'></textarea>
			<input type='submit' value='Send'></input>
		</form>
		</div>
HTML;
		return $leaveFeedbackHtml;
	}
}
