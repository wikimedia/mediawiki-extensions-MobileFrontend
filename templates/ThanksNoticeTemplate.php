<?php

if ( !defined( 'MEDIAWIKI' ) ) {
	die( -1 );
}

class ThanksNoticeTemplate extends MobileFrontendTemplate {

	public function getHTML() {

		$thanks = wfMessage( 'mobile-frontend-leave-feedback-thanks' )->escaped();

		$noticeHtml = <<<HTML
			<div class='mwm-message mwm-notice'>
				{$thanks}
			</div>
HTML;
		return $noticeHtml;
	}
}
