<?php

class SkinMobile extends SkinMobileBase {
	public $skinname = 'mobile';
	public $stylename = 'mobile';
	public $template = 'SkinMobileTemplate';
	private $resourceLoader;

	protected function prepareTemplate( OutputPage $out ) {
		global $wgAppleTouchIcon, $wgCookiePath, $wgExtensionAssetsPath, $wgLanguageCode,
			   $wgMFFeedbackFallbackURL, $wgMFCustomLogos, $wgVersion;

		wfProfileIn( __METHOD__ );
		$tpl = parent::prepareTemplate( $out );
		$out = $this->getOutput();
		$title = $this->getTitle();
		$request = $this->getRequest();
		$context = MobileContext::singleton();
		$device = $context->getDevice();
		$language = $this->getLanguage();
		$inBeta = $context->isBetaGroupMember();

		$tpl->set( 'isBetaGroupMember', $inBeta );
		$tpl->set( 'pagetitle', $out->getHTMLTitle() );
		$tpl->set( 'viewport-scaleable', $device['disable_zoom'] ? 'no' : 'yes' );
		$tpl->set( 'title', $out->getPageTitle() );
		$tpl->set( 'isMainPage', $title->isMainPage() );
		$tpl->set( 'canonicalUrl', $title->getCanonicalURL() );
		$tpl->set( 'robots', $this->getRobotsPolicy() );
		$tpl->set( 'hookOptions', $this->hookOptions );
		$tpl->set( 'languageCount', count( $this->getLanguageUrls() ) );
		$tpl->set( 'siteLanguageLink', SpecialPage::getTitleFor( 'MobileOptions', 'Language' )->getLocalUrl() );
		$copyrightLogo = is_array( $wgMFCustomLogos ) && isset( $wgMFCustomLogos['copyright'] ) ?
			$wgMFCustomLogos['copyright'] :
			"{$wgExtensionAssetsPath}/MobileFrontend/stylesheets/images/logo-copyright-{$wgLanguageCode}.png";

		wfProfileIn( __METHOD__ . '-modules' );
		$tpl->set( 'supports_jquery', $device['supports_jquery'] );
		$styles = array();
		$scripts = array();
		if ( $inBeta ) {
			$styles[] = 'mobile.beta';
			$scripts[] = 'mobile.beta';
		} else {
			$styles[] = 'mobile';
			$scripts[] = 'mobile';
		}
		$styles[] = "mobile.device.{$device['css_file_name']}";
		$styles[] = 'mobile.references';
		$styleLinks = array( $this->resourceLoaderLink( $styles, 'styles' ) );
		$isFilePage = $title->getNamespace() == NS_FILE;
		if ( $isFilePage ) {
			$styleLinks[] = $this->resourceLoaderLink( 'mobile.filePage', 'styles' );
		}
		$tpl->set( 'cssLinks', implode( "\n", $styleLinks ) );
		wfProfileOut( __METHOD__ . '-modules' );

		$tpl->setRef( 'wgAppleTouchIcon', $wgAppleTouchIcon );

		if ( $device['supports_jquery'] ) {
			$scripts[] = 'mobile.references';
		}
		$scriptLinks = array();
		if ( $device['supports_jquery'] ) {
			$scriptLinks[] = $this->resourceLoaderLink( 'jquery', 'scripts', true, true );
		}
		$scriptLinks[] = $this->resourceLoaderLink( $scripts, 'scripts' );
		if ( $isFilePage ) {
			$scriptLinks[] = $this->resourceLoaderLink( 'mobile.filePage', 'scripts' );
		}
		$bottomScripts = implode( "\n", $scriptLinks );
		$tpl->set( 'bottomScripts', $device['supports_javascript'] ? $bottomScripts : '' );
		$tpl->set( 'preambleScript', $device['supports_javascript'] ?
			"document.documentElement.className = 'jsEnabled page-loading';" : '' );

		$tpl->set( 'stopMobileRedirectCookieName', 'stopMobileRedirect' );
		$tpl->set( 'stopMobileRedirectCookieDuration', $context->getUseFormatCookieDuration() );
		$tpl->set( 'stopMobileRedirectCookieDomain', $context->getBaseDomain() );
		$tpl->set( 'useFormatCookieName', $context->getUseFormatCookieName() );
		$tpl->set( 'useFormatCookieDuration', -1 );
		$tpl->set( 'useFormatCookiePath', $wgCookiePath );
		$tpl->set( 'useFormatCookieDomain', $_SERVER['HTTP_HOST'] );

		$tpl->set( 'languageSelection', $this->buildLanguageSelection() );

		// footer
		$link = $context->getMobileUrl( wfExpandUrl( $this->getRequest()->appendQuery( 'action=history' ) ) );
		$historyLink = '';
		if ( !$title->isSpecialPage() ) {
			$lastEdit = $this->getWikiPage()->getTimestamp();
			if ( !$inBeta ) {
				$historyKey = 'mobile-frontend-footer-contributors';
				$historyLink = $this->msg( $historyKey, htmlspecialchars( $link ) )->text();
			} else {
				$historyKey = 'mobile-frontend-page-menu-history';
				$historyLink = Html::element( 'a', array( 'href' => $link ),
					wfMsg( $historyKey ) );
			}
		}
		if( !$historyLink ) {
			$tpl->set( 'historyLinkClass', 'disabled' );
		} else {
			$tpl->set( 'historyLinkClass', '' );
		}
		$tpl->set( 'historyLink', $historyLink );
		$tpl->set( 'copyright', $this->getCopyright() );
		$tpl->set( 'disclaimerLink', $this->disclaimerLink() );
		$tpl->set( 'privacyLink', $this->footerLink( 'mobile-frontend-privacy-link-text', 'privacypage' ) );
		$tpl->set( 'aboutLink', $this->footerLink( 'mobile-frontend-about-link-text', 'aboutpage' ) );

		$leaveFeedbackURL = SpecialPage::getTitleFor( 'MobileFeedback' )->getLocalURL(
			array( 'returnto' => $this->getTitle()->getPrefixedText(), 'feedbacksource' => 'MobileFrontend' )
		);
		$tpl->set( 'leaveFeedbackURL', $leaveFeedbackURL );
		$imagesSwitchTitle = SpecialPage::getTitleFor( 'MobileOptions',
			$context->imagesDisabled() ? 'EnableImages' : 'DisableImages'
		);
		$tpl->set( 'feedbackLink', $wgLanguageCode == 'en' ?
				Html::element( 'a', array( 'href' => $leaveFeedbackURL ), wfMsg( 'mobile-frontend-leave-feedback' ) )
				: ''
		);
		$tpl->set( 'settingsUrl', SpecialPage::getTitleFor( 'MobileOptions' )->getLocalUrl() );

		$tpl->set( 'logInOut', $this->getLogInOutLink() );
		if ( $context->imagesDisabled() ) {
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
		if ( is_array( $wgMFCustomLogos ) && isset( $wgMFCustomLogos['copyright'] ) ) {
			$license = Html::element( 'img', array(
				'src' => $wgMFCustomLogos['copyright'],
				'class' => 'license',
				'alt' => "{$footerSitename} ®"
			) );
		} else {
			$license = Html::element( 'div', array( 'class' => 'license' ),
				"{$footerSitename} ™"
			);
		}
		$tpl->set( 'license', $license );

		// @todo: kill me with fire
		if ( version_compare( $wgVersion, '1.20alpha', '<' ) ) {
			$tpl->set( 'bcHack', '<script type="text/javascript">mw={loader:{state:function(){}}};</script>' );
		} else {
			$tpl->set( 'bcHack', '' );
		}

		wfProfileOut( __METHOD__ );
		return $tpl;
	}

	/**
	 * @return ResourceLoader
	 */
	protected function getResourceLoader() {
		if ( !$this->resourceLoader ) {
			$this->resourceLoader = new ResourceLoader();
		}
		return $this->resourceLoader;
	}

	protected function resourceLoaderLink( $moduleNames, $type, $useVersion = true, $forceRaw = false ) {
		if ( $type == 'scripts' ) {
			$only = ResourceLoaderModule::TYPE_SCRIPTS;
		} elseif ( $type == 'styles' ) {
			$only = ResourceLoaderModule::TYPE_STYLES;
		} else {
			throw new MWException( __METHOD__ . "(): undefined link type '$type'" );
		}
		wfProfileIn( __METHOD__ );
		$out = $this->getOutput();
		$moduleNames = array_flip( (array)$moduleNames );
		$resourceLoader = $this->getResourceLoader();
		$query = ResourceLoader::makeLoaderQuery(
			array(), // modules; not determined yet
			$this->getLanguage()->getCode(),
			$this->getSkinName(),
			null, // so far all the modules we use are user-agnostic
			null, // version; not determined yet
			ResourceLoader::inDebugMode()
		);
		$context = new ResourceLoaderContext( $resourceLoader, new FauxRequest( $query ) );
		$version = 0;
		foreach ( array_keys( $moduleNames ) as $name ) {
			$module = $resourceLoader->getModule( $name );
			# Check that we're allowed to include this module on this page
			if ( !$module
				|| ( $module->getOrigin() > $out->getAllowedModules( ResourceLoaderModule::TYPE_SCRIPTS )
					&& $type == 'scripts' )
				|| ( $module->getOrigin() > $out->getAllowedModules( ResourceLoaderModule::TYPE_STYLES )
					&& $type == 'styles' )
			)
			{
				unset( $moduleNames[$name] );
				continue;
			}
			if ( $useVersion ) {
				$version = max( $version, $module->getModifiedTime( $context ) );
			}
		}
		$url = ResourceLoader::makeLoaderURL(
			array_keys( $moduleNames ),
			$this->getLanguage()->getCode(),
			$this->getSkinName(),
			null, // so far all the modules we use are user-agnostic
			$useVersion ? $version : null,
			ResourceLoader::inDebugMode(),
			$only,
			false,
			false,
			$forceRaw ? array( 'raw' => 'true' ) : array()
		);
		if ( $type == 'scripts' ) {
			$link = Html::linkedScript( $url );
		} else {
			$link = Html::linkedStyle( $url );
		}
		wfProfileOut( __METHOD__ );
		return $link;
	}

	public function buildLanguageSelection() {
		global $wgLanguageCode;
		wfProfileIn( __METHOD__ );
		$supportedLanguages = array();
		if ( is_array( $this->hookOptions ) && isset( $this->hookOptions['supported_languages'] ) ) {
			$supportedLanguages = $this->hookOptions['supported_languages'];
		}
		$languageUrls = $this->getLanguageUrls();
		if ( count( $languageUrls ) <= 1 ) {
			wfProfileOut( __METHOD__ );
			return '';
		}
		$context = MobileContext::singleton();
		$inBeta = $context->isBetaGroupMember();

		$output = $inBeta ?
			Html::openElement( 'select' ) :
			Html::openElement( 'select',
				array( 'id' => 'languageselection' ) );
		foreach ( $languageUrls as $languageUrl ) {
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
		$output = <<<HTML
	<div id="mw-mf-language-selection">
		{$this->msg( 'mobile-frontend-language' )->escaped()}<br/>
		{$output}
	</div>
HTML;
		wfProfileOut( __METHOD__ );
		return $output;
	}


	public function getLanguageUrls() {
		global $wgContLang;

		wfProfileIn( __METHOD__ );
		$context = MobileContext::singleton();
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
				$languageUrl = $context->getMobileUrl( $nt->getFullURL() );
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
		$this->data['isBetaGroupMember'] ? $this->set( 'bodyClasses', 'mobile beta' ) :
			$this->set( 'bodyClasses', 'mobile' );

		?><!doctype html>
	<html lang="<?php $this->text('code') ?>" dir="<?php $this->html( 'dir' ) ?>">
	<head>
		<title><?php $this->text( 'pagetitle' ) ?></title>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<?php $this->html( 'robots' ) ?>
		<?php $this->html( 'cssLinks' ) ?>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=<?php $this->text( 'viewport-scaleable' ) ?>">
		<?php $this->html( 'touchIcon' ) ?>
		<script type="text/javascript">
			if( typeof mw === 'undefined' ) {
				mw = {};
			}
			var mwMobileFrontendConfig = <?php $this->html( 'jsConfig' ) ?>;
			<?php $this->html( 'preambleScript' ) ?>
		</script>
		<link rel="canonical" href="<?php $this->html( 'canonicalUrl' ) ?>" >
	</head>
	<body class="<?php $this->text( 'bodyClasses' ) ?>">
		<?php
		if ( $this->data['isBetaGroupMember'] ) {
			$this->navigationStart();
		}
		?>
		<?php $this->html( 'zeroRatedBanner' ) ?>
		<?php $this->html( 'notice' ) ?>
		<?php $this->searchBox() ?>
	<div class='show' id='content_wrapper'>
		<div id="content">
			<?php $this->html( 'firstHeading' ) ?>
			<?php $this->html( 'bodytext' ) ?>
		</div>
	</div>
		<?php $this->footer() ?>
		<?php
		if ( $this->data['isBetaGroupMember'] ) {
			$this->navigationEnd();
		}
		?>
	<!--[if gt IE 7]><!-->
		<?php $this->html( 'bcHack' ) ?>
		<?php $this->html( 'bottomScripts' ) ?>
	<script type='text/javascript'>
	if ( document.addEventListener ) {
		document.addEventListener( 'DOMContentLoaded', mw.mobileFrontend.init );
	}
	</script>
	<!--><![endif]-->
	</body>
	</html><?php
	}

	public function navigationStart() {
		?>
		<div id="mw-mf-viewport">
		<div id="mw-mf-page-left">
		<div id='mw-mf-content-left'>
		<ul id="mw-mf-menu-main">
			<li class='icon'><a href="<?php $this->text( 'mainPageUrl' ) ?>">
				<?php $this->msg( 'mobile-frontend-main-menu-featured' ) ?></a></li>
			<li class='icon2'><a href="<?php $this->text( 'randomPageUrl' ) ?>#mw-mf-page-left" id="randomButton" class="button"><?php $this->msg( 'mobile-frontend-random-button' ) ?></a></li>
			<li class='icon3 disabled'>
				<a href='#'>
				<?php $this->msg( 'mobile-frontend-main-menu-nearby' ) ?>
				</a>
			</li>
			<li class='icon4'>
				<a href='<?php $this->text( 'leaveFeedbackURL' ) ?>'>
				<?php $this->msg( 'mobile-frontend-main-menu-contact' ) ?>
				</a>
			</li>
			<li class='icon5'>
				<a href='<?php $this->text( 'settingsUrl' ) ?>'>
				<?php $this->msg( 'mobile-frontend-main-menu-settings' ) ?>
				</a>
			</li>
		</ul>
		</div>
		</div>
		<div id='mw-mf-page-center'>
		<?php
	}

	public function navigationEnd() {
		//close #mw-mf-page-center then viewport;
		?>
		</div>
		</div>
		<?php
	}

	public function prepareData() {
		global $wgExtensionAssetsPath, $wgScriptPath, $wgMobileFrontendLogo, $wgLang;

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
				'mobile-frontend-search-help' => wfMsg( 'mobile-frontend-search-help' ),
				'contents-heading' => wfMsg( 'mobile-frontend-page-menu-contents-heading' ),
				'language-heading' => wfMsg( 'mobile-frontend-page-menu-language-heading' ),
				'mobile-frontend-close-section' => wfMsg( 'mobile-frontend-close-section' ),
				'mobile-frontend-language-header' => wfMessage( 'mobile-frontend-language-header',
					$wgLang->formatNum( $this->data['languageCount'] ) )->text(),
				'mobile-frontend-language-footer' => Html::element( 'a',
					array(
						'href' => SpecialPage::getTitleFor( 'Special:MobileOptions/Language' )->getLocalUrl(),
					),
					wfMessage( 'mobile-frontend-language-footer' ) ),
				'mobile-frontend-language-site-choose' => wfMsg( 'mobile-frontend-language-site-choose' ),
				'mobile-frontend-language-site-nomatches' => wfMsg( 'mobile-frontend-language-site-nomatches' ),
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
		?>
	<div id="mw-mf-header">
		<?php
		if ( $this->data['isBetaGroupMember'] ) { ?>
			<a href="#mw-mf-page-left" id="mw-mf-main-menu-button">
				<img alt="menu"
				src="<?php $this->text( 'wgExtensionAssetsPath' ) ?>/MobileFrontend/stylesheets/images/blank.gif">
			</a>
		<?php
		}
		?>
			<form id="mw-mf-searchForm" action="<?php $this->text( 'scriptUrl' ) ?>" class="search_bar" method="get">
			<?php
				if ( !$this->data['isBetaGroupMember'] ) { ?>
				<img alt="Logo" id="mw-mf-logo" src="<?php
					$this->text( 'wgMobileFrontendLogo' ) ?>" />
			<?php
				}
			?>
			<input type="hidden" value="Special:Search" name="title" />
			<div id="mw-mf-sq" class="divclearable">
				<input type="search" name="search" id="mw-mf-search" size="22" value="<?php $this->text( 'searchField' )
					?>" autocomplete="off" maxlength="1024" class="search"
					placeholder="<?php $this->msg( 'mobile-frontend-placeholder' ) ?>"
					/>
				<img src="<?php $this->text( 'wgExtensionAssetsPath' ) ?>/MobileFrontend/stylesheets/images/blank.gif" alt="<?php
					$this->msg( 'mobile-frontend-clear-search' ) ?>" class="clearlink" id="mw-mf-clearsearch" title="<?php
					$this->msg( 'mobile-frontend-clear-search' ) ?>"/>
			</div>
			<?php
			if ( !$this->data['isBetaGroupMember'] ) { ?>
			<button id='goButton' class='goButton' type='submit'>
				<img src="<?php $this->text( 'wgExtensionAssetsPath' ) ?>/MobileFrontend/stylesheets/images/blank.gif" alt="<?php
					$this->msg( 'mobile-frontend-search-submit' ) ?>" title="<?php $this->msg( 'mobile-frontend-search-submit' ) ?>">
			</button>
			<?php } ?>
		</form>
		<?php if ( !$this->data['isBetaGroupMember'] ) { ?>
			<div class='nav' id='nav'>
			<?php $this->html( 'languageSelection' ) ?><br/>
			<a href="<?php $this->text( 'mainPageUrl' ) ?>" id="homeButton" class="button"><?php $this->msg( 'mobile-frontend-home-button' ) ?></a>
			<a href="<?php $this->text( 'randomPageUrl' ) ?>" id="randomButton" class="button"><?php $this->msg( 'mobile-frontend-random-button' ) ?></a>
			</div>
		</div>
		<?php } else {
		?>
		<div id="mw-mf-actionbar">
			<ul id="content_nav" class="content_block sub-menu">
				<li class="item3" id="mw-mf-language"><?php $this->msg( 'mobile-frontend-page-menu-language-current' ) ?></li>
				<li class="item2" id="mw-mf-toc"><?php $this->msg( 'mobile-frontend-page-menu-contents' ) ?></li>
				<li class="item-history <?php $this->html( 'historyLinkClass' ) ?>"><?php $this->html( 'historyLink' ) ?></li>
			</ul>
			<h2 class="section_heading navigationBar" id="section_nav">Nav Menu</h2>
		</div>
		</div>
		<?php
		}
		?>
	<?php if ( $this->data['isBetaGroupMember'] ) { ?>
	<?php $this->html( 'languageSelection' ) ?>
	<?php } ?>
	<div id="results"></div>
	<?php
	}

	private function footer() {
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
				<span class="left separator"><a id="mw-mf-display-toggle" href="<?php $this->text( 'viewNormalSiteURL' ) ?>"><?php
					$this->msg( 'mobile-frontend-view-desktop' ) ?></a></span><span class="right"><?php
				$this->msg( 'mobile-frontend-view-mobile' ) ?></span>
			</li>
			<li>
				<span class="left"><?php $this->msgHtml( 'mobile-frontend-terms-use' ) ?></span><span class="right"><?php
				$this->html( 'imagesToggle' ) ?></span>
			</li>
			<li class="notice">
				<?php if ( !$this->data['isBetaGroupMember'] ) { ?>
				<?php $this->html( 'historyLink' ) ?><br>
				<?php } ?>
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
