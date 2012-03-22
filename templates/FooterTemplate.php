<?php

if ( !defined( 'MEDIAWIKI' ) ) {
        die( -1 );
}

class FooterTemplate extends MobileFrontendTemplate {

	public function getHTML() {

		$regularSite = $this->data['messages']['mobile-frontend-regular-site'];
		$copyright = $this->data['messages']['mobile-frontend-copyright'];
		$disableImages = $this->data['messages']['mobile-frontend-disable-images'];
		$enableImages = $this->data['messages']['mobile-frontend-enable-images'];
		$leaveFeedback = $this->data['messages']['mobile-frontend-leave-feedback'];

		$leaveFeedbackURL = $this->data['leaveFeedbackURL'];
		$viewNormalSiteURL = $this->data['viewNormalSiteURL'];

		if ( $this->data['disableImages'] == 0 ) {
			$imagesToggle = $disableImages;
			$imagesURL = $this->data['disableImagesURL'];
		} else {
			$imagesToggle = $enableImages;
			$imagesURL = $this->data['enableImagesURL'];
		}

		$logoutLink = ( $this->data['logoutHtml'] ) ? ' | ' . $this->data['logoutHtml'] : '';
		$logoutLink = ( $this->data['loginHtml'] ) ? ' | ' . $this->data['loginHtml'] : $logoutLink;

		$feedbackLink = ( $this->data['code'] == 'en' && $this->data['isBetaGroupMember'] ) ? "<a href=\"{$leaveFeedbackURL}\">{$leaveFeedback}</a>" : '';

		$footerDisplayNone = ( $this->data['hideFooter'] ) ? ' style="display: none;" ' : '';

		$skin = RequestContext::getMain()->getSkin();
		$disclaimerLink = $skin->disclaimerLink();
		$privacyLink = $this->getCustomFooterLink( $skin, 'mobile-frontend-privacy-link-text', 'privacypage' );
		$aboutLink = $this->getCustomFooterLink( $skin, 'mobile-frontend-about-link-text', 'aboutpage' );

		$normalFooter = <<<HTML
			<div class='nav' id='footmenu'>
				<div class='mwm-notice'>
				  <a href="{$viewNormalSiteURL}" id="mf-display-toggle">{$regularSite}</a> | <a href="{$imagesURL}">{$imagesToggle}</a> {$feedbackLink} {$logoutLink}
				</div>
			  </div>
			  <div id='copyright'>{$copyright}</div>
HTML;
		$betaFooter = <<<HTML
		<!-- TODO: make license icon and text dynamic -->
		<img src="{$this->data['wgExtensionAssetsPath']}/MobileFrontend/stylesheets/images/ccommons.png" alt="creative commons"
			class='license' />
		<a href="http://creativecommons.org/licenses/by-sa/3.0/" class="license">by SA 3.0</a>
		<a href="#content_footer" class="toggleCopyright section_heading" id="section_footer">
			<span class="more">more information</span><span class="less">less information</span>
		</a>
		<div class="content_block" id="content_footer">
			<div class="copyrightNotice">
				{$copyright}
			</div>
			<ul class='links'>
				<li>
					<a href="{$this->data['leaveFeedbackURL']}">Contact</a>
				</li><li>
					{$privacyLink}
				</li><li>
					{$aboutLink}
				</li><li>
					{$disclaimerLink}
				</li>
			</ul>
		</div>
HTML;
		$footer = ( $this->data['isBetaGroupMember'] ) ? $betaFooter : $normalFooter;
		$footerHtml = <<<HTML
			<div id='footer' {$footerDisplayNone}>
				{$footer}
			</div>

HTML;
		return $footerHtml;
	}
}
