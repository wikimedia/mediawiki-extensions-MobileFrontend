<?php

if ( !defined( 'MEDIAWIKI' ) ) {
        die( -1 );
}

class FooterTemplate extends MobileFrontendTemplate {

	public function getHTML() {

		$regularSite = $this->data['messages']['mobile-frontend-regular-site'];
		$copyright = $this->data['messages']['mobile-frontend-footer-copyright'];
		$copyrightSymbol = $this->data['copyright-symbol'];
		$license = $this->data['messages']['mobile-frontend-footer-license'];
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
		if( $this->data['copyright-has-logo'] ) {
			$licenseHTML = <<<HTML
			<img src="{$this->data['wgExtensionAssetsPath']}/MobileFrontend/stylesheets/images/logo-copyright-{$this->data['language-code']}.png"
				class="license" alt="{$this->data['messages']['mobile-frontend-footer-sitename']} {$copyrightSymbol}">
HTML;
		} else {
			$licenseHTML = <<<HTML
			<div class="license">{$this->data['messages']['mobile-frontend-footer-sitename']} {$copyrightSymbol}</div>
HTML;
		}
		
		
		$betaFooter = <<<HTML
		<h2 class="section_heading" id="section_footer">
		<!-- TODO: make license icon and text dynamic -->
		{$licenseHTML}
		<span class="toggleCopyright">
			<span class="more">{$this->data['messages']['mobile-frontend-footer-more']}</span><span class="less">{$this->data['messages']['mobile-frontend-footer-less']}</span>
		</span>
		</h2>
		<div class="content_block" id="content_footer">
			<div class="notice">
				{$license}
			</div>
			<ul class='links'>
				<li>
					<a href="{$this->data['leaveFeedbackURL']}">{$this->data['messages']['mobile-frontend-footer-contact']}</a>
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
