<?php

if ( !defined( 'MEDIAWIKI' ) ) {
	die( -1 );
}

class SopaNoticeTemplate extends MobileFrontendTemplate {

	public function getHTML() {

		$sopaNotice = wfMessage( 'mobile-frontend-sopa-notice' )->escaped();

		$noticeHtml = <<<HTML
			<div class='mwm-message mwm-notice'>
				{$sopaNotice}
				<br/>
				<br/>
			</div>
HTML;
		return $noticeHtml;
	}
}
