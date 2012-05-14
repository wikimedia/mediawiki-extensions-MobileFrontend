<?php


class SkinMobile extends SkinMobileBase {
	public $skinname = 'SkinMobile';
	public $stylename = 'SkinMobile';
	public $template = 'SkinMobileTemplate';

	protected function prepareTemplate( OutputPage $out ) {
		global $wgAppleTouchIcon, $wgCookiePath, $wgMobileResourceVersion,
			   $wgExtensionAssetsPath, $wgLanguageCode, $wgMFMinifyJS,
			   $wgMFFeedbackFallbackURL, $wgMFCustomLogos;

		wfProfileIn( __METHOD__ );
		$tpl = parent::prepareTemplate( $out );
		$out = $this->getOutput();
		$title = $this->getTitle();
		$request = $this->getRequest();
		$frontend = $this->extMobileFrontend;
		$device = $frontend->getDevice();

		$tpl->set( 'isBetaGroupMember', $frontend->isBetaGroupMember );
		$tpl->set( 'pagetitle', $out->getHTMLTitle() );
		$tpl->set( 'viewport-scaleable', $device['disable_zoom'] ? 'no' : 'yes' );
		$tpl->set( 'title', $out->getPageTitle() );
		$tpl->set( 'isMainPage', $title->isMainPage() );
		$tpl->set( 'robots', $this->getRobotsPolicy() );
		$tpl->set( 'hookOptions', $this->hookOptions );
		$copyrightLogo = is_array( $wgMFCustomLogos ) && isset( $wgMFCustomLogos['copyright'] ) ?
			$wgMFCustomLogos['copyright'] :
			"{$wgExtensionAssetsPath}/MobileFrontend/stylesheets/images/logo-copyright-{$wgLanguageCode}.png";

		wfProfileIn( __METHOD__ . '-modules' );
		$tpl->set( 'supports_jquery', $device['supports_jquery'] );
		if ( $this->extMobileFrontend->isBetaGroupMember ) {
			$out->addModuleStyles( 'ext.mobileFrontendBeta' );
		} else {
			$out->addModuleStyles( 'ext.mobileFrontend' );
		}
		$out->addModuleStyles( "ext.mobileFrontend.{$device['css_file_name']}" );
		$isFilePage = $title->getNamespace() == NS_FILE;
		if ( $isFilePage ) {
			$out->addModuleStyles( 'ext.mobileFrontend.filePage' );
		}
		$tpl->set( 'cssLinks', $out->buildCssLinks() );
		wfProfileOut( __METHOD__ . '-modules' );

		$tpl->setRef( 'wgAppleTouchIcon', $wgAppleTouchIcon );

		$resourceSuffix = $wgMFMinifyJS ? 'min.' : '';
		$startScriptTag = '<script type="text/javascript" src="';
		$endScriptTag = "?version={$wgMobileResourceVersion}\"></script>";
		$javaScriptPath =  $wgExtensionAssetsPath . '/MobileFrontend/javascripts/';
		if ( $device['supports_jquery'] ) {
			$additionaljs = "{$startScriptTag}{$javaScriptPath}references.{$resourceSuffix}js{$endScriptTag}";
		} else {
			$additionaljs = "";
		}

		$tpl->set( 'jQueryScript',
			$device['supports_jquery'] ? "{$startScriptTag}{$javaScriptPath}jquery.min.js{$endScriptTag}" : ''
		);
		$filePageScript = $isFilePage ? "{$startScriptTag}{$javaScriptPath}filepage.{$resourceSuffix}js{$endScriptTag}" : '';
		$bottomScripts ="{$startScriptTag}{$javaScriptPath}application.{$resourceSuffix}js{$endScriptTag}
	{$startScriptTag}{$javaScriptPath}banner.{$resourceSuffix}js{$endScriptTag}
	{$startScriptTag}{$javaScriptPath}toggle.{$resourceSuffix}js{$endScriptTag}
	{$startScriptTag}{$javaScriptPath}settings.{$resourceSuffix}js{$endScriptTag}
	{$startScriptTag}{$javaScriptPath}beta_opensearch.{$resourceSuffix}js{$endScriptTag}
	{$additionaljs}
	{$filePageScript}";
		$tpl->set( 'bottomScripts', $device['supports_javascript'] ? $bottomScripts : '' );
		$tpl->set( 'preambleScript', $device['supports_javascript'] ?
			"document.documentElement.className = 'jsEnabled togglingEnabled page-loading';" : '' );

		$tpl->set( 'stopMobileRedirectCookieName', 'stopMobileRedirect' );
		$tpl->set( 'stopMobileRedirectCookieDuration', $frontend->getUseFormatCookieDuration() );
		$tpl->set( 'stopMobileRedirectCookieDomain', $frontend->getBaseDomain() );
		$tpl->set( 'useFormatCookieName', $frontend->getUseFormatCookieName() );
		$tpl->set( 'useFormatCookieDuration', -1 );
		$tpl->set( 'useFormatCookiePath', $wgCookiePath );
		$tpl->set( 'useFormatCookieDomain', $_SERVER['HTTP_HOST'] );

		$hideSearchBox = $request->getInt( 'hidesearchbox', 0 ) == 1;
		$hideLogo = $this->getRequest()->getInt( 'hidelogo' ) == 1;
		if ( !empty( $_SERVER['HTTP_APPLICATION_VERSION'] ) &&
			strpos( $_SERVER['HTTP_APPLICATION_VERSION'], 'Wikipedia Mobile' ) !== false ) {
			$hideSearchBox = true;
			if ( strpos( $_SERVER['HTTP_APPLICATION_VERSION'], 'Android' ) !== false ) {
				$hideLogo = true;
			}
		}
		$tpl->set( 'hideSearchBox', $hideSearchBox );
		$tpl->set( 'hideLogo', $hideLogo );
		$tpl->set( 'hideFooter', $hideLogo );
		$tpl->set( 'languageSelection', $this->buildLanguageSelection() );

		// footer
		$link = $this->extMobileFrontend->getMobileUrl( wfExpandUrl( $this->getRequest()->appendQuery( 'action=history' ) ) );
		$tpl->set( 'historyLink', $this->msg( 'mobile-frontend-footer-contributors', htmlspecialchars( $link ) )->text() );
		$tpl->set( 'copyright', $this->getCopyright() );
		$tpl->set( 'disclaimerLink', $this->disclaimerLink() );
		$tpl->set( 'privacyLink', $this->footerLink( 'mobile-frontend-privacy-link-text', 'privacypage' ) );
		$tpl->set( 'aboutLink', $this->footerLink( 'mobile-frontend-about-link-text', 'aboutpage' ) );

		// fix to prevent non-beta users from seeing the old feedback form -
		// instead send them to the site's contact page, falling back to
		// a predefined default if we can't figure out what the page is
		if ( $frontend->isBetaGroupMember ) {
			$leaveFeedbackURL = SpecialPage::getTitleFor( 'MobileFeedback' )->getLocalURL(
				array( 'returnto' => $this->getTitle()->getPrefixedText() )
			);
		} else {
			// most projects seem to use locally configured 'Contact-url' messages
			// to define the location of their contact pages
			$feedbackTitle = Title::newFromText( wfMsg( 'Contact-url') );
			if ( $feedbackTitle && $feedbackTitle->isKnown() ) {
				$leaveFeedbackURL = $feedbackTitle->getLocalUrl();
			} else {
				$leaveFeedbackURL = htmlspecialchars( $wgMFFeedbackFallbackURL );
			}
		}

		$tpl->set( 'leaveFeedbackURL', $leaveFeedbackURL );
		$imagesSwitchTitle = SpecialPage::getTitleFor( 'MobileOptions',
			$frontend->imagesDisabled() ? 'EnableImages' : 'DisableImages'
		);
		$tpl->set( 'feedbackLink', $wgLanguageCode == 'en' ?
				Html::element( 'a', array( 'href' => $leaveFeedbackURL ), wfMsg( 'mobile-frontend-leave-feedback' ) )
				: ''
		);
		$tpl->set( 'logInOut', $this->getLogInOutLink() );
		if ( $frontend->imagesDisabled() ) {
			$on = Linker::link( $imagesSwitchTitle,
				$this->msg( 'mobile-frontend-on' )->escaped(),
				array( 'id' => 'imagetoggle' ),
				array( 'returnto' => $title->getPrefixedText() )
			);
			$off = $this->msg( 'mobile-frontend-off' )->escaped();
		} else {
			$on = $this->msg( 'mobile-frontend-on' )->escaped();
			$off = Linker::link( $imagesSwitchTitle,
				$this->msg( 'mobile-frontend-off' )->escaped(),
				array( 'id' => 'imagetoggle' ),
				array( 'returnto' => $title->getPrefixedText() )
			);
		}
		$tpl->set( 'imagesToggle', $this->msg( 'mobile-frontend-toggle-images' )->rawParams( $on, $off )->escaped() );
		$footerSitename = $this->msg( 'mobile-frontend-footer-sitename' )->text();
		if ( $wgLanguageCode === 'en' ) { //@fixme: de-WMFize
			$license = Html::element( 'img', array(
				'src' => $copyrightLogo,
				'class' => 'license',
				'alt' => "{$footerSitename} ®"
			) );
		} else {
			$license = Html::element( 'div', array( 'class' => 'license' ),
				"{$footerSitename} ™"
			);
		}
		$tpl->set( 'license', $license );

		wfProfileOut( __METHOD__ );
		return $tpl;
	}

	public function buildLanguageSelection() {
		global $wgLanguageCode;
		wfProfileIn( __METHOD__ );
		$supportedLanguages = array();
		if ( is_array( $this->hookOptions ) && isset( $this->hookOptions['supported_languages'] ) ) {
			$supportedLanguages = $this->hookOptions['supported_languages'];
		}
		$output = Html::openElement( 'select',
			array( 'id' => 'languageselection' ) );
		foreach ( $this->getLanguageUrls() as $languageUrl ) {
			$languageUrlHref = $languageUrl['href'];
			$languageUrlLanguage = $languageUrl['language'];
			if ( is_array( $supportedLanguages ) && in_array( $languageUrl['lang'], $supportedLanguages ) ) {
				if ( isset( $this->hookOptions['toggle_view_desktop'] ) ) {
					$request = $this->getRequest();
					$returnto = $request->appendQuery( $this->hookOptions['toggle_view_desktop'] );
					$languageUrlHref =  $returnto  .
						urlencode( $languageUrlHref );
				}
			}
			if ( $languageUrl['lang'] == $wgLanguageCode ) {
				$output .=	Html::element( 'option',
					array( 'value' => $languageUrlHref, 'selected' => 'selected' ),
					$languageUrlLanguage );
			} else {
				$output .=	Html::element( 'option',
					array( 'value' => $languageUrlHref ),
					$languageUrlLanguage );
			}
		}
		$output .= Html::closeElement( 'select' );
		wfProfileOut( __METHOD__ );
		return $output;
	}


	public function getLanguageUrls() {
		global $wgContLang;

		wfProfileIn( __METHOD__ );
		$languageUrls = array();

		$langCode = $this->getLanguage()->getHtmlCode();
		$out = $this->getOutput();
		$languageUrls[] = array(
			'href' => $this->getRequest()->getFullRequestURL(),
			'text' => $out->getHTMLTitle(),
			'language' => $wgContLang->getLanguageName( $langCode ),
			'class' => 'interwiki-' . $langCode,
			'lang' => $langCode,
		);

		foreach ( $out->getLanguageLinks() as $l ) {
			$tmp = explode( ':', $l, 2 );
			$class = 'interwiki-' . $tmp[0];
			$lang = $tmp[0];
			unset( $tmp );
			$nt = Title::newFromText( $l );
			if ( $nt ) {
				$languageUrl = $this->extMobileFrontend->getMobileUrl( $nt->getFullURL() );
				$languageUrls[] = array(
					'href' => $languageUrl,
					'text' => ( $wgContLang->getLanguageName( $nt->getInterwiki() ) != ''
						? $wgContLang->getLanguageName( $nt->getInterwiki() )
						: $l ),
					'language' => $wgContLang->getLanguageName( $lang ),
					'class' => $class,
					'lang' => $lang,
				);
			}
		}
		wfProfileOut( __METHOD__ );

		return $languageUrls;
	}

	/**
	 * Extracts <meta name="robots"> from head items that we don't need
	 * @return string
	 */
	private function getRobotsPolicy() {
		wfProfileIn( __METHOD__ );
		libxml_use_internal_errors( true );
		$dom = $this->extMobileFrontend->getDom( $this->getOutput()->getHeadLinks() );
		$xpath = new DOMXpath( $dom );
		foreach ( $xpath->query( '//meta[@name="robots"]' ) as $tag ) {
			wfProfileOut( __METHOD__ );
			return $dom->saveXML( $tag );
		}
		wfProfileOut( __METHOD__ );
		return '';
	}

	private function getLogInOutLink() {
		wfProfileIn( __METHOD__ );
		$query = array( 'returnto' => $this->getTitle()->getPrefixedText() );
		if ( !$this->getRequest()->wasPosted() ) {
			$returntoquery = $this->getRequest()->getValues();
			unset( $returntoquery['title'] );
			unset( $returntoquery['returnto'] );
			unset( $returntoquery['returntoquery'] );
			$query['returntoquery'] = wfArrayToCGI( $returntoquery );
		}
		if ( $this->getUser()->isLoggedIn() ) {
			$link = Linker::link( SpecialPage::getTitleFor( 'UserLogout' ),
				wfMessage( 'userlogout' )->escaped(),
				array(),
				$query
			);
		} else {
			$link = Linker::link( SpecialPage::getTitleFor( 'UserLogin' ),
				wfMessage( 'mobile-frontend-login' )->escaped(),
				array(),
				$query
			);
		}
		wfProfileOut( __METHOD__ );
		return $link;
	}
}

class SkinMobileTemplate extends BaseTemplate {
	public function execute() {
		$this->prepareData();

		?><!doctype html>
	<html lang="<?php $this->text('code') ?>" dir="<?php $this->html( 'dir' ) ?>">
	<head>
		<title><?php $this->text( 'pagetitle' ) ?></title>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<?php $this->html( 'robots' ) ?>
		<?php $this->html( 'cssLinks' ) ?>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=<?php $this->text( 'viewport-scaleable' ) ?>">
		<?php $this->html( 'touchIcon' ) ?>
		<?php $this->html( 'jQueryScript' ) ?>
		<script type="text/javascript">
			var mwMobileFrontendConfig = <?php $this->html( 'jsConfig' ) ?>;
			<?php $this->html( 'preambleScript' ) ?>
		</script>
	</head>
	<body class="mobile">
		<?php $this->html( 'zeroRatedBanner' ) ?>
		<?php $this->searchBox() ?>
	<div class='show' id='content_wrapper'>
		<?php $this->html( 'notice' ) ?>
		<div id="content">
			<?php $this->html( 'firstHeading' ) ?>
			<?php $this->html( 'bodytext' ) ?>
		</div>
	</div>
		<?php $this->footer() ?>
	<!--[if gt IE 7]><!-->
		<?php $this->html( 'bottomScripts' ) ?>
	<script type='text/javascript'>
	window.onload = function() {
		MobileFrontend.init();
	};
	</script>
	<!--><![endif]-->
	</body>
	</html><?php
	}

	public function prepareData() {
		global $wgExtensionAssetsPath, $wgScriptPath, $wgMobileFrontendLogo;

		wfProfileIn( __METHOD__ );
		$this->setRef( 'wgExtensionAssetsPath', $wgExtensionAssetsPath );
		if ( $this->data['wgAppleTouchIcon'] !== false ) {
			$link = Html::element( 'link', array( 'rel' => 'apple-touch-icon', 'href' => $this->data['wgAppleTouchIcon'] ) );
		} else {
			$link = '';
		}
		$this->set( 'touchIcon', $link );
		$hookOptions = isset( $this->data['hookOptions']['toggle_view_desktop'] ) ? 'toggle_view_desktop' : '';

		$jsconfig = array(
			'messages' => array(
				'expand-section' => wfMsg( 'mobile-frontend-show-button' ),
				'collapse-section' => wfMsg( 'mobile-frontend-hide-button' ),
				'remove-results' => wfMsg( 'mobile-frontend-wml-back' ), //@todo: use a separate message
				'mobile-frontend-search-noresults' => wfMsg( 'mobile-frontend-search-noresults' ),
			),
			'settings' => array(
				'scriptPath' => $wgScriptPath,
				'useFormatCookieName' => $this->data['useFormatCookieName'],
				'useFormatCookieDuration' => $this->data['useFormatCookieDuration'],
				'useFormatCookieDomain' => $this->data['useFormatCookieDomain'],
				'useFormatCookiePath' => $this->data['useFormatCookiePath'],
				'stopMobileRedirectCookieName' => $this->data['stopMobileRedirectCookieName'],
				'stopMobileRedirectCookieDuration' => $this->data['stopMobileRedirectCookieDuration'],
				'stopMobileRedirectCookieDomain' => $this->data['stopMobileRedirectCookieDomain'],
				'hookOptions' => $hookOptions,
			),
		);
		if ( $this->data['isMainPage'] ) {
			$jsconfig['messages']['empty-homepage'] = wfMsg( 'mobile-frontend-empty-homepage' );
			$firstHeading = '';
		} else {
			$firstHeading = Html::rawElement( 'h1', array( 'id' => 'firstHeading' ),
				$this->data['title']
			);
		}
		$this->set( 'jsConfig', FormatJSON::encode( $jsconfig ) );
		$this->set( 'firstHeading', $firstHeading );
		$this->set( 'wgMobileFrontendLogo', $wgMobileFrontendLogo );

		wfProfileOut( __METHOD__ );
	}

	private function searchBox() {
		if ( $this->data['hideSearchBox'] ) {
			return;
		}
		?>
	<div id="header">
			<form id="searchForm" action="<?php $this->text( 'scriptUrl' ) ?>" class="search_bar" method="get">
			<?php if ( !$this->data['hideLogo'] ) { ?><img width="35" height="22" alt="Logo" id="logo" src="<?php
			$this->text( 'wgMobileFrontendLogo' ) ?>" />
			<?php } ?>
			<input type="hidden" value="Special:Search" name="title" />
			<div id="sq" class="divclearable">
				<input type="search" name="search" id="search" size="22" value="<?php $this->text( 'searchField' )
					?>" autocomplete="off" maxlength="1024" class="search" placeholder="<?php $this->msg( 'mobile-frontend-placeholder' ) ?>" />
				<img src="<?php $this->text( 'wgExtensionAssetsPath' ) ?>/MobileFrontend/stylesheets/images/blank.gif" alt="<?php
					$this->msg( 'mobile-frontend-clear-search' ) ?>" class="clearlink" id="clearsearch" title="<?php
					$this->msg( 'mobile-frontend-clear-search' ) ?>"/>
			</div>
			<button id='goButton' class='goButton' type='submit'>
				<img src="<?php $this->text( 'wgExtensionAssetsPath' ) ?>/MobileFrontend/stylesheets/images/blank.gif" alt="<?php
					$this->msg( 'mobile-frontend-search-submit' ) ?>" title="<?php $this->msg( 'mobile-frontend-search-submit' ) ?>">
			</button>
		</form>
		<?php if ( !$this->data['hideLogo'] ) { ?>
		<div class='nav' id='nav'>
			<b><?php $this->msg( 'mobile-frontend-language' ) ?></b><br/><?php $this->html( 'languageSelection' ) ?><br/>
			<a href="<?php $this->text( 'mainPageUrl' ) ?>" id="homeButton" class="button"><?php $this->msg( 'mobile-frontend-home-button' ) ?></a>
			<a href="<?php $this->text( 'randomPageUrl' ) ?>" id="randomButton" class="button"><?php $this->msg( 'mobile-frontend-random-button' ) ?></a>
		</div><?php }
		?>
	</div>
	<div id="results"></div>
	<?php
	}

	private function footer() {
		if ( $this->data['hideFooter'] ) {
			return;
		}

		?>
	<div id="footer">
		<?php
		// @todo: make license icon and text dynamic
		?>
	<h2 class="section_heading" id="section_footer">
		<?php $this->html( 'license' ) ?>
		<span class="toggleCopyright">
			<span class="more"><?php $this->msg( 'mobile-frontend-footer-more' ) ?></span><span class="less"><?php
			$this->msg( 'mobile-frontend-footer-less' ) ?></span>
		</span>
	</h2>
	<div class="content_block" id="content_footer">
		<ul class="settings">
			<li>
				<span class="left separator"><a href="<?php $this->text( 'viewNormalSiteURL' ) ?>"><?php
					$this->msg( 'mobile-frontend-view-desktop' ) ?></a></span><span class="right"><?php
				$this->msg( 'mobile-frontend-view-mobile' ) ?></span>
			</li>
			<li>
				<span class="left"><?php $this->msgHtml( 'mobile-frontend-terms-use' ) ?></span><span class="right"><?php
				$this->html( 'imagesToggle' ) ?></span>
			</li>
			<li class="notice">
				<?php $this->html( 'historyLink' ) ?><br>
				<?php $this->msgHtml( 'mobile-frontend-footer-license' ) ?>
			</li>
		</ul>
		<ul class="links">
			<li>
				<a href="<?php $this->text( 'leaveFeedbackURL' ) ?>"><?php $this->msg( 'mobile-frontend-footer-contact' ) ?></a>
			</li><li>
			<?php $this->html( 'privacyLink' ) ?></li><li>
			<?php $this->html( 'aboutLink' ) ?></li><li>
			<?php $this->html( 'disclaimerLink' ) ?></li>
		</ul>
	</div>
	</div>
	<?php
	}
}
