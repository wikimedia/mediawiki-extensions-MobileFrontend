<?php

if ( !defined( 'MEDIAWIKI' ) ) {
	die( -1 );
}

class LeaveFeedbackTemplate extends MobileFrontendTemplate {

	public function getHTML() {

		$languageCode = $this->data['languageCode'];
		$feedbackArticlePersonal = $this->data['feedbackLinks']['articlePersonal'];
		$feedbackArticleFactual = $this->data['feedbackLinks']['articleFactual'];
		$feedbackArticleOther = $this->data['feedbackLinks']['articleOther'];
		$leaveFeedbackHtml = <<<HTML
		<div class='feedback'>
		<h2 class="section_heading" id="section_1">Technical Problem</h2>
		<div class="content_block" id="content_1">
		<form id='mf-feedback-form' action='{$this->data['feedbackPostURL']}' method='post'>
			<input type='hidden' name='edittoken' value='{$this->data['editToken']}' />
			<input type='text' class='subject' name='subject' maxlength='60' placeholder='Message subject'>
			<textarea name='message' rows='5' placeholder='Type your comment here'></textarea>
			<input type='submit' value='Send'></input>
		</form>
		</div>
		<h2 class="section_heading" id="section_3">Article Feedback</h2>
		<div class="content_block" id="content_3">
			<ul>
				<li>
					<a href="{$feedbackArticlePersonal}">Regarding me, a person or a company I represent</a>
				</li>
				<li>
					<a href="{$feedbackArticleFactual}">Regarding a factual error</a>
				</li>
				<li>
					<a href="{$feedbackArticleOther}">Regarding another problem</a>
				</li>
			</ul>
		</div>
		</div>
HTML;
		return $leaveFeedbackHtml;
	}
}
