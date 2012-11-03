<?php

class SkinMobile extends SkinMobileBase {
	public $skinname = 'mobile';
	public $stylename = 'mobile';
	public $template = 'SkinMobileTemplate';
	private $resourceLoader;

	protected function prepareTemplate( OutputPage $out ) {
		global $wgAppleTouchIcon, $wgCookiePath, $wgExtensionAssetsPath, $wgLanguageCode,
			   $wgMFCustomLogos, $wgVersion, $wgMFLogEvents, $wgMFTrademarkSitename;

		wfProfileIn( __METHOD__ );
		$tpl = parent::prepareTemplate( $out );
		$out = $this->getOutput();
		$title = $this->getTitle();
		$tpl->set( 'articleTitle', $title->getPrefixedText() );
		$tpl->set( 'shim', $wgExtensionAssetsPath . '/MobileFrontend/stylesheets/common/images/blank.gif' ); // defines a shim
		$specialPage = $title->isSpecialPage();
		$context = MobileContext::singleton();
		$device = $context->getDevice();
		$inBeta = $context->isBetaGroupMember();

		$userLogin = $title->isSpecial( 'Userlogin' );
		$tpl->set( 'isOverlay', $specialPage );
		$tpl->set( 'action', $context->getRequest()->getText( 'action' ) );
		$tpl->set( 'isBetaGroupMember', $inBeta );
		$tpl->set( 'renderLeftMenu', $context->getForceLeftMenu() );
		$tpl->set( 'pagetitle', $out->getHTMLTitle() );
		$tpl->set( 'viewport-scaleable', $device['disable_zoom'] ? 'no' : 'yes' );
		if ( $userLogin ) {
			$tpl->set( 'title', wfMessage( 'mobile-frontend-sign-in-heading' )->text() );
		} else {
			$tpl->set( 'title', $out->getPageTitle() );
		}

		$tpl->set( 'isMainPage', $title->isMainPage() );
		$tpl->set( 'articleClass', $title->isMainPage() || $specialPage ? 'mw-mf-special' : '' );
		$tpl->set( 'canonicalUrl', $title->getCanonicalURL() );
		$tpl->set( 'robots', $this->getRobotsPolicy() );
		$tpl->set( 'hookOptions', $this->hookOptions );
		$tpl->set( 'languageCount', count( $this->getLanguageUrls() ) );
		$tpl->set( 'siteLanguageLink', SpecialPage::getTitleFor( 'MobileOptions', 'Language' )->getLocalUrl() );
		// @todo FIXME: Unused local variable?
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
			if( $device['supports_jquery'] ) {
				$styles[] = 'mobile.beta.jquery';
				$scripts[] = 'mobile.beta.jquery';
				if ( $wgMFLogEvents ) {
					$scripts[] = 'mobile.beta.jquery.eventlog';
				}
			}
		} else {
			$styles[] = 'mobile';
			$scripts[] = 'mobile';
			$styles[] = 'mobile.production-only';
			$scripts[] = 'mobile.production-only';
		}
		$styles[] = "mobile.device.{$device['css_file_name']}";
		$styles[] = 'mobile.production-jquery';
		$styleLinks = array( $this->resourceLoaderLink( $styles, 'styles' ) );
		$isFilePage = $title->getNamespace() == NS_FILE;
		if ( $isFilePage ) {
			$styleLinks[] = $this->resourceLoaderLink( 'mobile.filePage', 'styles' );
		}
		$styleLinks[] = $this->resourceLoaderLink( array( 'mobile.site' ), 'styles', false );
		$tpl->set( 'cssLinks', implode( "\n", $styleLinks ) );
		wfProfileOut( __METHOD__ . '-modules' );

		$tpl->setRef( 'wgAppleTouchIcon', $wgAppleTouchIcon );

		if ( $device['supports_jquery'] ) {
			$scripts[] = 'mobile.production-jquery';
		}
		$scriptLinks = array();
		if ( $device['supports_jquery'] ) {
			global $wgMFEnableResourceLoader;
			if ( $inBeta && $wgMFEnableResourceLoader ) {
				// Initialize ResourceLoader, targeted to mobile...
				$scriptLinks[] = $this->resourceLoaderLink( 'startup', 'scripts', true, true, 'mobile' );
				$modules = $this->getOutput()->getModules( true );
				if ( $modules ) {
					// Load ResourceLoader modules
					$scriptLinks[] = Html::inlineScript(
						ResourceLoader::makeLoaderConditionalScript(
							Xml::encodeJsCall( 'mw.loader.load', array( $modules ) )
						)
					);
				}
			} else {
				// Not beta or RL mode disabled; use old method of loading jquery.
				$scriptLinks[] = $this->resourceLoaderLink( 'jquery', 'scripts', true, true );
				global $wgResponsiveImages;
				if ( $wgResponsiveImages ) {
					$scriptLinks[] = $this->resourceLoaderLink( array( 'jquery.hidpi', '
mediawiki.hidpi' ), 'scripts', true, true );
				}
			}
		}
		$scriptLinks[] = $this->resourceLoaderLink( $scripts, 'scripts' );
		if ( $isFilePage ) {
			$scriptLinks[] = $this->resourceLoaderLink( 'mobile.filePage', 'scripts' );
		}
		$scriptLinks[] = $this->resourceLoaderLink( array( 'mobile.site' ), 'scripts', false );
		$bottomScripts = implode( "\n", $scriptLinks );
		$tpl->set( 'bottomScripts', $device['supports_javascript'] ? $bottomScripts : '' );

		$headLinks = array();
		$headLinks[] = $this->resourceLoaderLink( array( '' => 'mobile.head' ), 'scripts' );
		$preamble = implode( "\n", $headLinks );
		$tpl->set( 'preambleScript', $device['supports_javascript'] ? $preamble : '' );

		$tpl->set( 'stopMobileRedirectCookieName', 'stopMobileRedirect' );
		$tpl->set( 'stopMobileRedirectCookieDuration', $context->getUseFormatCookieDuration() );
		$tpl->set( 'stopMobileRedirectCookieDomain', $context->getStopMobileRedirectCookieDomain() );
		$tpl->set( 'useFormatCookieName', $context->getUseFormatCookieName() );
		$tpl->set( 'useFormatCookieDuration', -1 );
		$tpl->set( 'useFormatCookiePath', $wgCookiePath );
		$tpl->set( 'useFormatCookieDomain', $_SERVER['HTTP_HOST'] );
		$tpl->set( 'isSpecialPage', $title->isSpecialPage() );

		$tpl->set( 'languageSelection', $this->buildLanguageSelection() );

		// footer
		$link = $context->getMobileUrl( wfExpandUrl( $this->getRequest()->appendQuery( 'action=history' ) ) );
		$historyLink = '';
		if ( !$title->isSpecialPage() ) {
				$historyKey = 'mobile-frontend-footer-contributors';
				$historyLink = $this->msg( $historyKey, htmlspecialchars( $link ) )->text();
		}

		$tpl->set( 'historyLink', $historyLink );
		$tpl->set( 'copyright', $this->getCopyright() );
		$tpl->set( 'disclaimerLink', $this->disclaimerLink() );
		$tpl->set( 'privacyLink', $this->footerLink( 'mobile-frontend-privacy-link-text', 'privacypage' ) );
		$tpl->set( 'aboutLink', $this->footerLink( 'mobile-frontend-about-link-text', 'aboutpage' ) );

		$returnTo = $this->getRequest()->getText( 'returnto' );
		if ( $returnTo !== '' ) {
			$returnToTitle = Title::newFromText( $returnTo );
			if ( $returnToTitle ) {
				$rtnUrl = $returnToTitle->getLocalURL();
			} else {
				$rtnUrl = Title::newMainPage()->getLocalUrl();
			}
		} else {
			$rtnUrl = Title::newMainPage()->getLocalUrl();
		}
		$tpl->set( 'returnto', $rtnUrl );
		$leaveFeedbackURL = SpecialPage::getTitleFor( 'MobileFeedback' )->getLocalURL(
			array( 'returnto' => $this->getTitle()->getPrefixedText(), 'feedbacksource' => 'MobileFrontend' )
		);
		$tpl->set( 'leaveFeedbackURL', $leaveFeedbackURL );
		$tpl->set( 'feedbackLink', $wgLanguageCode == 'en' ?
			Html::element(
				'a',
				array( 'href' => $leaveFeedbackURL ),
				$this->msg( 'mobile-frontend-leave-feedback' )->text()
			)
			: ''
		);
		$tpl->set( 'settingsUrl',
			SpecialPage::getTitleFor( 'MobileOptions' )->
				getLocalUrl( array( 'returnto' => $this->getTitle()->getPrefixedText() ) )
		);

		$tpl->set( 'authenticated', $this->getUser()->isLoggedIn() );
		$tpl->set( 'logInOut', $this->getLogInOutLink() );
		$footerSitename = $this->msg( 'mobile-frontend-footer-sitename' )->text();
		if ( is_array( $wgMFCustomLogos ) && isset( $wgMFCustomLogos['copyright'] ) ) {
			if ( $wgMFTrademarkSitename ) {
				$suffix = ' ®';
			} else {
				$suffix = '';
			}
			$license = Html::element( 'img', array(
				'src' => $wgMFCustomLogos['copyright'],
				'class' => 'license',
				'alt' => "{$footerSitename}" . $suffix
			) );
		} else {
			if ( $wgMFTrademarkSitename ) {
				$suffix = ' ™';
			} else {
				$suffix = '';
			}
			$license = Html::element( 'span', array( 'class' => 'license' ),
				"{$footerSitename}" . $suffix
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

	protected function resourceLoaderLink( $moduleNames, $type, $useVersion = true, $forceRaw = false, $target = false ) {
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
		if ( $target !== false ) {
			$url .= '&target=' . urlencode( $target );
		}
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

		$printed = 0;
		$output = Html::openElement( 'ul', array( 'id' => 'mw-mf-language-selection' ) );
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
			if ( $languageUrl['lang'] != $wgLanguageCode ) {
				$printed += 1;
				$output .= Html::openElement( 'li' ) . Html::element( 'a',
					array( 'href' => $languageUrlHref,
						'lang' => $languageUrl['lang'],
						'hreflang' => $languageUrl['lang']
					),
					$languageUrlLanguage ) . Html::closeElement( 'li' );
			}
		}
		$output .= Html::closeElement( 'ul' );
		$msg = wfMessage( 'mobile-frontend-language-header', count( $languageUrls ) - 1 )->text();
		$heading = wfMessage( 'mobile-frontend-language-article-heading' )->text();
		$output = <<<HTML
			<div class="section" id="mw-mf-language-section">
				<h2 id="section_language" class="section_heading">{$heading}</h2>
				<div id="content_language" class="content_block">
					<p>{$msg}</p>
					{$output}
				</div>
			</div>
HTML;
		wfProfileOut( __METHOD__ );
		return $printed > 0 ? $output : '';
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
			'language' => $wgContLang->fetchLanguageName( $langCode ),
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
					'text' => ( $wgContLang->fetchLanguageName( $nt->getInterwiki() ) != ''
						? $wgContLang->fetchLanguageName( $nt->getInterwiki() )
						: $l ),
					'language' => $wgContLang->fetchLanguageName( $lang ),
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
				wfMessage( 'mobile-frontend-main-menu-logout' )->escaped(),
				array( 'class' => 'logout' ),
				$query
			);
		} else {
			$link = Linker::link( SpecialPage::getTitleFor( 'UserLogin' ),
				wfMessage( 'mobile-frontend-main-menu-login' )->escaped(),
				array( 'class' => 'login' ),
				$query
			);
		}
		wfProfileOut( __METHOD__ );
		return $link;
	}
}

class SkinMobileTemplate extends BaseTemplate {
	public function renderArticleSkin() {
		$this->navigationStart();
		?>
		<?php $this->html( 'zeroRatedBanner' ) ?>
		<?php $this->html( 'notice' ) ?>
		<?php $this->searchBox() ?>
	<div class='show <?php $this->html( 'articleClass' ); ?>' id='content_wrapper'>
			<?php if ( $this->data['isBetaGroupMember'] && !$this->data['isSpecialPage'] ) { ?>
			<div id="content">
			<?php } ?>
			<?php $this->html( 'firstHeading' ) ?>
			<?php $this->html( 'bodytext' ) ?>
			<?php $this->html( 'languageSelection' ) ?>
		<?php if ( $this->data['isBetaGroupMember'] && !$this->data['isSpecialPage'] ) { ?>
			</div><!-- close #content -->
		<?php } ?>
	</div><!-- close #content_wrapper -->
		<?php $this->footer() ?>
		<?php
			$this->navigationEnd();
	}

	public function renderOverlaySkin() {
		?>
		<div id="mw-mf-overlay">
			<?php $this->html( 'firstHeading' ) ?>
				<a class="escapeOverlay" href="<?php $this->text( 'returnto' ) ?>">close</a>
				<div id="content_wrapper" class="content mw-mf-special">
					<?php $this->html( 'bodytext' ) ?>
				</div>
			</div>
		<?php
	}

	public function execute() {
		$this->prepareData();
		$this->data['isBetaGroupMember'] ? $this->set( 'bodyClasses', 'mobile beta' ) :
			$this->set( 'bodyClasses', 'mobile live' );

		$htmlClass = '';
		if ( $this->data['isOverlay'] ) {
			$htmlClass .= ' overlay';
			if ( $this->data[ 'isSpecialPage' ] ) {
				$htmlClass .= ' specialPage';
			}
		}
		if ( $this->data['renderLeftMenu'] ) {
			$htmlClass .= 'navigationEnabled navigationFullScreen';
		}
		if ( $this->data['action'] == 'edit' ) {
			$htmlClass .= ' actionEdit';
		}
		$this->set( 'htmlClasses', trim( $htmlClass ) );

		?><!doctype html>
	<html lang="<?php $this->text('code') ?>" dir="<?php $this->html( 'dir' ) ?>" class="<?php $this->text( 'htmlClasses' )  ?>">
	<head>
		<title><?php $this->text( 'pagetitle' ) ?></title>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<?php $this->html( 'robots' ) ?>
		<?php $this->html( 'cssLinks' ) ?>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=<?php $this->text( 'viewport-scaleable' ) ?>">
		<?php $this->html( 'touchIcon' ) ?>
		<script type="text/javascript">
			var _mwStart = +new Date;
			window._evq = window._evq || [];
			if ( typeof console === 'undefined' ) {
				console = { log: function() {} };
			}
			if( typeof mw === 'undefined' ) {
				mw = {};
			}
			var mwMobileFrontendConfig = <?php $this->html( 'jsConfig' ) ?>;
			function _mwLogEvent( data, additionalInformation ) {
				var timestamp = + new Date;
				var ev = { event_id: 'mobile', delta: timestamp - _mwStart, data: data, beta: mwMobileFrontendConfig.settings.beta,
					session: _mwStart, page: mwMobileFrontendConfig.settings.title, info: additionalInformation || '' };
				_evq.push( ev );
				console.log( typeof JSON === 'undefined' ? ev : JSON.stringify( ev ) );
			}
		</script>
		<?php $this->html( 'preambleScript' ) ?>
		<link rel="canonical" href="<?php $this->html( 'canonicalUrl' ) ?>" >
	</head>
	<body class="<?php $this->text( 'bodyClasses' ) ?>">
		<?php
			if ( $this->data['isOverlay'] ) {
				$this->renderOverlaySkin();
			} else {
				$this->renderArticleSkin();
			}
		?>

		<?php $this->html( 'bcHack' ) ?>
		<?php $this->html( 'bottomScripts' ) ?>
	</body>
	</html><?php
	}

	public function navigationStart() {
		?>
		<div id="mw-mf-viewport">
		<div id="mw-mf-page-left">
		<div id='mw-mf-content-left'>
		<ul id="mw-mf-menu-main">
			<li class='icon'><a href="<?php $this->text( 'mainPageUrl' ) ?>"
				title="<?php $this->msg( 'mobile-frontend-home-button' ) ?>">
				<?php $this->msg( 'mobile-frontend-home-button' ) ?></a></li>
			<li class='icon2'><a href="<?php $this->text( 'randomPageUrl' ) ?>#mw-mf-page-left" id="randomButton"
				title="<?php $this->msg( 'mobile-frontend-random-button' ) ?>"
				class="button"><?php $this->msg( 'mobile-frontend-random-button' ) ?></a></li>
			<?php if ( $this->data['isBetaGroupMember'] ) { ?>
			<li class='icon4'>
				<a href="<?php $this->text( 'leaveFeedbackURL' ) ?>"
					title="<?php $this->msg( 'mobile-frontend-main-menu-contact' ) ?>">
				<?php $this->msg( 'mobile-frontend-main-menu-contact' ) ?>
				</a>
			</li>
			<?php } ?>
			<li class='icon5'>
				<a href="<?php $this->text( 'settingsUrl' ) ?>"
					title="<?php $this->msg( 'mobile-frontend-main-menu-settings' ) ?>">
				<?php $this->msg( 'mobile-frontend-main-menu-settings' ) ?>
				</a>
			</li>
			<?php if ( $this->data['isBetaGroupMember'] ) { ?>
			<li class='icon6'>
				<?php $this->html( 'logInOut' ) ?>
			</li>
			<?php } ?>
		</ul>
		</div>
		</div>
		<div id='mw-mf-page-center'>
		<?php
	}

	public function navigationEnd() {
		//close #mw-mf-page-center then viewport;
		?>
		</div><!-- close #mw-mf-page-center -->
		</div><!-- close #mw-mf-viewport -->
		<?php
	}

	public function prepareData() {
		global $wgExtensionAssetsPath, $wgScriptPath, $wgMobileFrontendLogo, $wgArticlePath;

		wfProfileIn( __METHOD__ );
		$this->setRef( 'wgExtensionAssetsPath', $wgExtensionAssetsPath );
		if ( $this->data['wgAppleTouchIcon'] !== false ) {
			$link = Html::element( 'link', array( 'rel' => 'apple-touch-icon', 'href' => $this->data['wgAppleTouchIcon'] ) );
		} else {
			$link = '';
		}
		$this->set( 'touchIcon', $link );
		$hookOptions = isset( $this->data['hookOptions']['toggle_view_desktop'] ) ? 'toggle_view_desktop' : '';

		$inBeta = $this->data['isBetaGroupMember'];
		$jsconfig = array(
			'messages' => array(
				'mobile-frontend-watchlist-add' => wfMessage( 'mobile-frontend-watchlist-add' )->text(),
				'mobile-frontend-watchlist-removed' => wfMessage( 'mobile-frontend-watchlist-removed' )->text(),
				'mobile-frontend-watchlist-view' => wfMessage( 'mobile-frontend-watchlist-view' )->text(),
				'mobile-frontend-ajax-random-heading' => wfMessage( 'mobile-frontend-ajax-random-heading' )->text(),
				'mobile-frontend-ajax-random-quote' => wfMessage( 'mobile-frontend-ajax-random-quote' )->text(),
				'mobile-frontend-ajax-random-quote-author' => wfMessage( 'mobile-frontend-ajax-random-quote-author' )->text(),
				'mobile-frontend-ajax-random-question' => wfMessage( 'mobile-frontend-ajax-random-question' )->text(),
				'mobile-frontend-ajax-random-yes' => wfMessage( 'mobile-frontend-ajax-random-yes' )->text(),
				'mobile-frontend-ajax-random-retry' => wfMessage( 'mobile-frontend-ajax-random-retry' )->text(),
				'mobile-frontend-ajax-page-loading' => wfMessage( 'mobile-frontend-ajax-page-loading' )->text(),
				'mobile-frontend-page-saving' => wfMessage('mobile-frontend-page-saving' )->text(),
				'mobile-frontend-ajax-page-error' => wfMessage( 'mobile-frontend-ajax-page-error' )->text(),
				'mobile-frontend-meta-data-issues' => wfMessage( 'mobile-frontend-meta-data-issues' )->text(),
				'mobile-frontend-meta-data-issues-header' => wfMessage( 'mobile-frontend-meta-data-issues-header' )->text(),
				'expand-section' => wfMessage( 'mobile-frontend-show-button' )->text(),
				'collapse-section' => wfMessage( 'mobile-frontend-hide-button' )->text(),
				'remove-results' => wfMessage( 'mobile-frontend-wml-back' )->text(), //@todo: use a separate message
				'mobile-frontend-search-noresults' => wfMessage(
					'mobile-frontend-search-noresults' )->text(),
				'mobile-frontend-search-help' => wfMessage( 'mobile-frontend-search-help' )->text(),
				'contents-heading' => wfMessage( 'mobile-frontend-page-menu-contents-heading' )->text(),
				'language-heading' => wfMessage( 'mobile-frontend-page-menu-language-heading' )->text(),
				'mobile-frontend-close-section' => wfMessage( 'mobile-frontend-close-section' )->text(),
				'mobile-frontend-language-footer' => Html::element( 'a',
					array(
						'href' => SpecialPage::getTitleFor( 'MobileOptions/Language' )->getLocalUrl(),
					),
					wfMessage( 'mobile-frontend-language-footer' ) ),
				'mobile-frontend-language-site-choose' => wfMessage(
					'mobile-frontend-language-site-choose' )->text(),
				'mobile-frontend-language-site-nomatches' => wfMessage(
					'mobile-frontend-language-site-nomatches' )->text(),
			),
			'settings' => array(
				'action' => $this->data['action'],
				'authenticated' => $this->data['authenticated'],
				'scriptPath' => $wgScriptPath,
				'shim' => $this->data['shim'],
				'pageUrl' => $wgArticlePath,
				'beta' => $inBeta,
				'title' => $this->data['articleTitle'],
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
			$jsconfig['messages']['empty-homepage'] = wfMessage( 'mobile-frontend-empty-homepage'
			)->text();
			$firstHeading = '';
		} else {
			$editMode = $this->data['action'] == 'edit';
			if ( $this->data['isOverlay'] ) {
				$headingOptions = array( 'class' => 'header' );
			} elseif ( $this->data['isBetaGroupMember'] && !$this->data['isSpecialPage'] && !$this->data['isMainPage'] && !$editMode ) {
				$headingOptions = array( 'id' => 'section_0', 'class' => 'section_heading openSection' );
			} else {
				$headingOptions = array( 'id' => 'firstHeading' );
			}
			$firstHeading = Html::rawElement( 'h1', $headingOptions,
				$this->data['title']
			);
		}
		$this->set( 'jsConfig', FormatJSON::encode( $jsconfig ) );
		$this->set( 'firstHeading', $firstHeading );
		$this->set( 'wgMobileFrontendLogo', $wgMobileFrontendLogo );

		wfProfileOut( __METHOD__ );
	}

	private function searchBox() {
		if ( $this->data['isBetaGroupMember'] ) {
			$placeholder = wfMessage( 'mobile-frontend-placeholder-beta' )->text();
		} else {
			$placeholder = wfMessage( 'mobile-frontend-placeholder' )->text();
		}
		?>
	<div id="mw-mf-header">
		<?php
		$url = SpecialPage::getTitleFor( 'MobileMenu' )->getLocalUrl() . '#mw-mf-page-left';
			echo Html::openElement( 'a', array(
				'title' => wfMessage( 'mobile-frontend-main-menu-button-tooltip' )->text(),
				'href' => $url, 'id'=> 'mw-mf-main-menu-button'
			) );
		?>
				<img alt="menu"
				src="<?php $this->text( 'shim' ) ?>">
		<?php
			echo Html::closeElement( 'a' );
		?>
			<form id="mw-mf-searchForm" action="<?php $this->text( 'scriptUrl' ) ?>" class="search_bar" method="get">
			<input type="hidden" value="Special:Search" name="title" />
			<div id="mw-mf-sq" class="divclearable">
				<input type="search" name="search" id="mw-mf-search" size="22" value="<?php $this->text( 'searchField' )
					?>" autocomplete="off" maxlength="1024" class="search"
					placeholder="<?php echo $placeholder ?>"
					/>
				<img src="<?php $this->text( 'shim' ) ?>" alt="<?php
					$this->msg( 'mobile-frontend-clear-search' ) ?>" class="clearlink" id="mw-mf-clearsearch" title="<?php
					$this->msg( 'mobile-frontend-clear-search' ) ?>"/>
				<input class='searchSubmit' type="submit" value="<?php $this->msg( 'mobile-frontend-search-submit' ) ?>">
			</div>
		</form>
	</div>
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
	</h2>
	<div class="content_block" id="content_footer">
		<ul class="settings">
			<li>
				<span class="left separator"><a id="mw-mf-display-toggle" href="<?php $this->text( 'viewNormalSiteURL' ) ?>"><?php
					$this->msg( 'mobile-frontend-view-desktop' ) ?></a></span><span class="right"><?php
				$this->msg( 'mobile-frontend-view-mobile' ) ?></span>
			</li>
			<li class="notice">
				<?php $this->html( 'historyLink' ) ?><br>
				<?php $this->msgHtml( 'mobile-frontend-footer-license' ) ?>
				<span>| <?php $this->msgHtml( 'mobile-frontend-terms-use' ) ?></span>
			</li>
		</ul>
		<ul class="links">
			<?php if ( !$this->data['isBetaGroupMember'] ) { ?>
			<li>
			<a href='<?php $this->text( 'leaveFeedbackURL' ) ?>'>
				<?php $this->msg( 'mobile-frontend-main-menu-contact' ) ?>
			</a>
			</li><li>
			<?php } else { ?>
				<li>
			<?php } ?>
			<?php $this->html( 'privacyLink' ) ?></li><li>
			<?php $this->html( 'aboutLink' ) ?></li><li>
			<?php $this->html( 'disclaimerLink' ) ?></li>
		</ul>
	</div><!-- close footer.div / #content_footer -->
	</div><!-- close #footer -->
	<?php
	}
}
