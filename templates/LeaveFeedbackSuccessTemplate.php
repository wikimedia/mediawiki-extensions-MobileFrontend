<?php

if ( !defined( 'MEDIAWIKI' ) ) {
	die( -1 );
}

class LeaveFeedbackSuccessTemplate extends MobileFrontendTemplate {

	public function getHTML() {

		$leaveFeedbackHtml = <<<HTML
		<div>Thank you!</div>
		<div>Your comment has been submitted.</div>
HTML;
		return $leaveFeedbackHtml;
	}
}
