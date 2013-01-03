<?php

class SkinMobile extends SkinMobileBase {
	public $skinname = 'mobile';
	public $stylename = 'mobile';
	public $template = 'SkinMobileTemplate';
	private $resourceLoader;

	protected function prepareTemplate() {
		global $wgAppleTouchIcon, $wgCookiePath, $wgExtensionAssetsPath, $wgLanguageCode,
			   $wgMFCustomLogos, $wgVersion, $wgMFTrademarkSitename, $wgMFPhotoUploadEndpoint;

		wfProfileIn( __METHOD__ );
		$tpl = parent::prepareTemplate();
		$out = $this->getOutput();
		$title = $this->getTitle();
		$user = $this->getUser();
		$tpl->set( 'title', $title );
		$tpl->set( 'shim', $wgExtensionAssetsPath . '/MobileFrontend/stylesheets/common/images/blank.gif' ); // defines a shim
		$tpl->set( 'ajaxLoader', $wgExtensionAssetsPath . '/MobileFrontend/stylesheets/modules/images/ajax-loader.gif' );
		$tpl->set( 'user', $user );
		$specialPage = $title->isSpecialPage();
		$context = MobileContext::singleton();
		$device = $context->getDevice();
		$inBeta = $context->isBetaGroupMember();
		$inAlpha = $context->isAlphaGroupMember();

		$timestamp = Revision::getTimestampFromId( $this->getTitle(), $this->getRevisionId() );
		$tpl->set( 'timestamp', wfTimestamp( TS_UNIX, $timestamp ) );
		$tpl->set( 'lastModified', $this->msg( 'mobile-frontend-last-modified-date',
			$this->getLanguage()->userDate( $timestamp, $user ),
			$this->getLanguage()->userTime( $timestamp, $user )
		) );

		$userLogin = $title->isSpecial( 'Userlogin' );
		$tpl->set( 'isOverlay', $specialPage && !$title->isSpecial( 'MobileMenu' ) );
		$tpl->set( 'action', $context->getRequest()->getText( 'action' ) );
		$tpl->set( 'imagesDisabled', $context->imagesDisabled() );
		$tpl->set( 'isAlphaGroupMember', $inAlpha );
		$tpl->set( 'isBetaGroupMember', $inBeta );
		$tpl->set( 'photo-upload-endpoint', $wgMFPhotoUploadEndpoint ? $wgMFPhotoUploadEndpoint : '' );
		$tpl->set( 'renderLeftMenu', $context->getForceLeftMenu() );
		$tpl->set( 'pagetitle', $out->getHTMLTitle() );
		$tpl->set( 'viewport-scaleable', $device['disable_zoom'] ? 'no' : 'yes' );
		if ( $userLogin ) {
			if ( $this->getRequest()->getVal( 'type' ) == 'signup' ) {
				$tpl->set( 'firstHeading', wfMessage( 'mobile-frontend-sign-up-heading' )->text() );
			} else {
				$tpl->set( 'firstHeading', wfMessage( 'mobile-frontend-sign-in-heading' )->text() );
			}
		} else {
			$tpl->set( 'firstHeading', $out->getPageTitle() );
		}
		$tpl->set( 'variant', $title->getPageLanguage()->getPreferredVariant() );

		if ( isset( $out->mobileHtmlHeader ) ) {
			$tpl->set( 'htmlHeader', $out->mobileHtmlHeader );
		} else {
			$tpl->set( 'htmlHeader', '' );
		}

		$tpl->set( 'isMainPage', $title->isMainPage() );
		$tpl->set( 'articleClass', $title->isMainPage() || $specialPage ? 'mw-mf-special' : '' );
		$tpl->set( 'canonicalUrl', $title->getCanonicalURL() );
		$tpl->set( 'robots', $this->getRobotsPolicy() );
		$tpl->set( 'hookOptions', $this->hookOptions );
		$tpl->set( 'languageCount', count( $this->getLanguageUrls() ) + 1 );
		$tpl->set( 'siteLanguageLink', SpecialPage::getTitleFor( 'MobileOptions', 'Language' )->getLocalUrl() );
		// @todo FIXME: Unused local variable?
		$copyrightLogo = is_array( $wgMFCustomLogos ) && isset( $wgMFCustomLogos['copyright'] ) ?
			$wgMFCustomLogos['copyright'] :
			"{$wgExtensionAssetsPath}/MobileFrontend/stylesheets/images/logo-copyright-{$wgLanguageCode}.png";

		wfProfileIn( __METHOD__ . '-modules' );
		$tpl->set( 'supports_jquery', $device['supports_jquery'] );

		$namespace = $title->getNamespace();
		$tpl->set( 'namespace', $namespace );

		wfProfileOut( __METHOD__ . '-modules' );

		$tpl->setRef( 'wgAppleTouchIcon', $wgAppleTouchIcon );

		// setup destinations for styles/scripts at top and at bottom
		$tpl = $this->attachResources( $title, $tpl, $device );

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
				$historyKey = 'mobile-frontend-footer-contributors-text';
				// FIXME: this creates a link with class external - it should be local
				$historyLink = wfMessage( $historyKey, htmlspecialchars( $link ) )->parse();
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
		$tpl->set( 'donateImageUrl',
			SpecialPage::getTitleFor( 'DonateImage' )->getLocalUrl()
		);

		$tpl->set( 'authenticated', $user->isLoggedIn() );
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

	protected function attachResources( $title, $tpl, $device ) {
		global $wgAutoloadClasses, $wgMFLogEvents, $wgMFEnableResourceLoader, $wgResponsiveImages;

		$context = MobileContext::singleton();
		$inBeta = $context->isBetaGroupMember();
		$inAlpha = $context->isAlphaGroupMember();
		$rlSupport = $inBeta && $wgMFEnableResourceLoader;
		$jsEnabled = $device['supports_javascript'];
		$jQueryEnabled = $device['supports_jquery'];
		$isFilePage = $title->getNamespace() == NS_FILE;
		$action = $context->getRequest()->getText( 'action' );
		$out = $this->getOutput();

		$moduleNames = array( 'mobile.startup', 'mobile.site' );
		$headModuleNames = array( 'mobile.head', 'mobile.styles' );
		$headLinks = array();

		if ( $jQueryEnabled ) {
			if ( $rlSupport ) {
				// Initialize ResourceLoader, targeted to mobile...
				$headLinks[] = $this->resourceLoaderLink( 'startup', 'scripts', true, true, 'mobile' );
				$modules = $out->getModules( true );

				if ( $modules ) {
					// Load ResourceLoader modules
					$headLinks[] = Html::inlineScript(
						ResourceLoader::makeLoaderConditionalScript(
							Xml::encodeJsCall( 'mw.loader.load', array( $modules ) )
						)
					);
				}
			} else {
				// Not beta or RL mode disabled; use old method of loading jquery.
				$headModuleNames[] = 'jquery';
				if ( $wgResponsiveImages ) {
					$moduleNames[] = 'jquery.hidpi';
					$moduleNames[] = 'mediawiki.hidpi';
				}
			}
		} else {
			$headModuleNames[] = 'mobile.jqueryshim';
		}

		// jQuery only
		if ( $jQueryEnabled ) {
			$moduleNames[] = 'mobile.production-jquery';
		}

		// specific to beta/alpha
		if ( $inBeta ) {

			if ( $jQueryEnabled ) {
				$moduleNames[] = 'mobile.beta.jquery';

				if ( $wgMFLogEvents &&  isset( $wgAutoloadClasses['ResourceLoaderSchemaModule'] ) ) {
					array_push( $headModuleNames,  'ext.eventLogging', 'schema.MobileBetaWatchlist' );
				}

				if ( $inAlpha ) {
					$moduleNames[] = 'mobile.alpha';
				}
			}
		} else {
			$moduleNames[] = 'mobile.production-only';
		}

		// specific to current context
		// FIXME: need more generic+tidy way of doing this rather than having a module per page
		if ( $isFilePage ) {
			$moduleNames[] = 'mobile.filePage';
		} else if ( $title->isSpecial( 'Userlogin' ) ) {
			$moduleNames[] = 'mobile.special.login';
		} else if ( $title->isSpecial( 'MobileFeedback' ) ) {
			$moduleNames[] = 'mobile.special.feedback';
		} else if ( $title->isSpecial( 'MobileOptions' ) ) {
			$moduleNames[] = 'mobile.special.settings';
		} else if ( $title->isSpecial( 'Search' ) ) {
			$moduleNames[] = 'mobile.special.search';
		} else if ( $title->isSpecial( 'Watchlist' ) || $title->isSpecial( 'MobileDiff' ) ) {
			$moduleNames[] = 'mobile.watchlist';
		}

		if ( $action === 'edit' ) {
			$moduleNames[] = 'mobile.action.edit';
		} else if ( $action === 'history' ) {
			$moduleNames[] = 'mobile.action.history';
		}
		$moduleNames[] = "mobile.device.{$device['css_file_name']}";

		// attach
		if ( $jsEnabled ) {
			$headLinks[] = $this->resourceLoaderLink( $headModuleNames, 'scripts' );
		}
		$headLinks[] = $this->resourceLoaderLink( $headModuleNames, 'styles' );

		if ( $jQueryEnabled && $rlSupport ) {
			$bottomScripts = Html::inlineScript(
				ResourceLoader::makeLoaderConditionalScript(
					Xml::encodeJsCall( 'mw.loader.load', array( $moduleNames ) )
				)
			);
		} else {
			$bottomScripts = $jsEnabled ? $this->resourceLoaderLink( $moduleNames, 'scripts' ) : '';
			$headLinks[] = $this->resourceLoaderLink( $moduleNames, 'styles' );
		}
		$tpl->set( 'preamble', implode( "\n", $headLinks ) );
		$tpl->set( 'bottomScripts', $bottomScripts );
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
		wfProfileIn( __METHOD__ );
		$supportedLanguages = array();
		if ( is_array( $this->hookOptions ) && isset( $this->hookOptions['supported_languages'] ) ) {
			$supportedLanguages = $this->hookOptions['supported_languages'];
		}
		$languageUrls = $this->getLanguageUrls();
		$languageVariantUrls = $this->getLanguageVariantUrls();
		if ( empty( $languageUrls ) && count( $languageVariantUrls ) <= 1 ) {
			wfProfileOut( __METHOD__ );
			return '';
		}

		// language variants list
		if ( count( $languageVariantUrls ) > 1 ) {
			$msgLanguageVariants = wfMessage( 'mobile-frontend-language-variant-header' )->text();
			$languageVariants = '<p id="mw-mf-language-variant-header">' . $msgLanguageVariants . '</p>';
			$languageVariants .= Html::openElement( 'ul', array( 'id' => 'mw-mf-language-variant-selection' ) );

			foreach ( $languageVariantUrls as $languageVariantUrl ) {
				$languageVariants .= Html::openElement( 'li' ) . Html::element( 'a',
					array( 'href' => $languageVariantUrl['href'],
						'lang' => $languageVariantUrl['lang'],
						'hreflang' => $languageVariantUrl['lang']
					),
					$languageVariantUrl['text'] ) . Html::closeElement( 'li' );
				}

			$languageVariants .= Html::closeElement( 'ul' );
		} else {
			$languageVariants = '';
		}

		// languages list
		$msgLanguages = wfMessage( 'mobile-frontend-language-header', count( $languageUrls ) )->text();
		$languages = '<p id="mw-mf-language-header">' . $msgLanguages . '</p>';
		$languages .= Html::openElement( 'ul', array( 'id' => 'mw-mf-language-selection' ) );

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
			$languages .= Html::openElement( 'li' ) . Html::element( 'a',
				array( 'href' => $languageUrlHref,
					'lang' => $languageUrl['lang'],
					'hreflang' => $languageUrl['lang']
				),
				$languageUrlLanguage ) . Html::closeElement( 'li' );
		}

		$languages .= Html::closeElement( 'ul' );

		$heading = wfMessage( 'mobile-frontend-language-article-heading' )->text();
		$output = <<<HTML
			<div class="section" id="mw-mf-language-section">
				<h2 id="section_language" class="section_heading">{$heading}</h2>
				<div id="content_language" class="content_block">
					{$languageVariants}
					{$languages}
				</div>
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
		$out = $this->getOutput();

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

	public function getLanguageVariantUrls() {
		global $wgDisableLangConversion;

		wfProfileIn( __METHOD__ );
		$languageVariantUrls = array();
		$context = MobileContext::singleton();
		$title = $this->getRelevantTitle();
		$user = $this->getUser();
		$userCanRead = $title->quickUserCan( 'read', $user );

		if ( $userCanRead && !$wgDisableLangConversion ) {
			$pageLang = $title->getPageLanguage();
			// Gets list of language variants
			$variants = $pageLang->getVariants();
			// Checks that language conversion is enabled and variants exist
			// And if it is not in the special namespace
			if ( count( $variants ) > 1 ) {
				// Loops over each variant
				foreach ( $variants as $code ) {
					// Gets variant name from language code
					$varname = $pageLang->getVariantname( $code );
					// Checks if the variant is marked as disabled
					if ( $varname == 'disable' ) {
						// Skips this variant
						continue;
					}
					// Appends variant link
					$languageVariantUrls[] = (array(
						'text' => $varname,
						'href' => $title->getLocalURL( array( 'variant' => $code ) ),
						'lang' => $code
					));
				}
			}
		}

		wfProfileOut( __METHOD__ );

		return $languageVariantUrls;
	}

	/**
	 * Extracts <meta name="robots"> from head items that we don't need
	 * @return string
	 */
	private function getRobotsPolicy() {
		wfProfileIn( __METHOD__ );
		$links = $this->getOutput()->getHeadLinksArray();
		$robots = $links['meta-robots'];
		wfProfileOut( __METHOD__ );
		return $robots;
	}

	private function getLogInOutLink() {
		global $wgMFForceSecureLogin;
		wfProfileIn( __METHOD__ );
		$context = MobileContext::singleton();
		$query = array();
		if ( !$this->getRequest()->wasPosted() ) {
			$returntoquery = $this->getRequest()->getValues();
			unset( $returntoquery['title'] );
			unset( $returntoquery['returnto'] );
			unset( $returntoquery['returntoquery'] );
		}
		if ( $this->getUser()->isLoggedIn() ) {
			$query[ 'returnto' ] = $this->getTitle()->getPrefixedText();
			if ( !empty( $returntoquery ) ) {
				$query[ 'returntoquery' ] = wfArrayToCGI( $returntoquery );
			}
			$url = SpecialPage::getTitleFor( 'UserLogout' )->getFullURL( $query );
			$url = $context->getMobileUrl( $url, $wgMFForceSecureLogin );
			$link = Linker::makeExternalLink(
				$url,
				wfMessage( 'mobile-frontend-main-menu-logout' )->escaped(),
				true,
				'',
				array( 'class' => 'logout' )
			);
		} else {
			 // note returnto is not set for mobile (per product spec)
			$returntoquery[ 'welcome' ] = 'yes';
			$query[ 'returntoquery' ] = wfArrayToCGI( $returntoquery );
			$url = SpecialPage::getTitleFor( 'UserLogin' )->getFullURL( $query );
			$url = $context->getMobileUrl( $url, $wgMFForceSecureLogin );
			$link = Linker::makeExternalLink(
				$url,
				wfMessage( 'mobile-frontend-main-menu-login' )->escaped(),
				true,
				'',
				array( 'class' => 'login' )
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
			<?php if ( !$this->data['isSpecialPage'] ) { ?>
			<div id="content" class="content">
			<?php } ?>
			<?php $this->html( 'firstHeading' ) ?>
			<?php $this->html( 'bodytext' ) ?>
			<?php $this->html( 'languageSelection' ) ?>
			<?php if ( $this->data['isBetaGroupMember'] ) { ?>
			<p id="mw-mf-last-modified" data-timestamp="<?php $this->text( 'timestamp' ) ?>">
				<?php $this->text( 'lastModified' ) ?>
			</p>
			<?php } ?>
		<?php if ( !$this->data['isSpecialPage'] ) { ?>
			</div><!-- close #content -->
		<?php } ?>
	</div><!-- close #content_wrapper -->
		<?php $this->footer() ?>
		<?php
			$this->navigationEnd();
	}

	public function renderOverlaySkin() {
		?>
		<?php $this->html( 'zeroRatedBanner' ) ?>
		<div id="mw-mf-overlay">
			<?php $this->html( 'firstHeading' ) ?>
				<div id="content_wrapper" class="mw-mf-special">
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
		<meta name="viewport" content="initial-scale=1.0, user-scalable=<?php $this->text( 'viewport-scaleable' ) ?>">
		<?php $this->html( 'touchIcon' ) ?>
		<script type="text/javascript">
			var mwMobileFrontendConfig = <?php $this->html( 'jsConfig' ) ?>;
		</script>
		<?php $this->html( 'preamble' ) ?>
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
		$user = $this->data['user'];
		?>
		<div id="mw-mf-viewport">
		<div id="mw-mf-page-left">
		<div id='mw-mf-content-left'>
		<ul id="mw-mf-menu-main">
			<li class='icon'><a href="<?php $this->text( 'mainPageUrl' ) ?>"
				title="<?php $this->msg( 'mobile-frontend-home-button' ) ?>">
				<?php $this->msg( 'mobile-frontend-home-button' ) ?></a></li>
			<?php if ( $this->data['isBetaGroupMember'] && $this->data['loggedin'] ) { ?>
			<li class='icon-watchlist'>
				<a href="<?php $this->text( 'watchlistUrl' ) ?>"
					title="<?php $this->msg( 'mobile-frontend-main-menu-watchlist' ) ?>">
				<?php $this->msg( 'mobile-frontend-main-menu-watchlist' ) ?>
				</a>
			</li>
			<?php } ?>
			<li class='icon2'><a href="<?php $this->text( 'randomPageUrl' ) ?>#mw-mf-page-left" id="randomButton"
				title="<?php $this->msg( 'mobile-frontend-random-button' ) ?>"
				><?php $this->msg( 'mobile-frontend-random-button' ) ?></a></li>
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
			<?php if ( $this->data['isAlphaGroupMember'] && $user && $user->isAllowed( 'upload' ) ) { ?>
				<li class='iconImage'>
					<a href="<?php $this->text( 'donateImageUrl' ) ?>"
						title="<?php $this->msg( 'mobile-frontend-donate-image' ) ?>">
					<?php $this->msg( 'mobile-frontend-donate-image' ) ?>
					</a>
				</li>
			<?php } ?>
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

	public function addMessages( $config ) {
		$messages = array(
			'mobile-frontend-language-site-choose',
			'mobile-frontend-language-site-nomatches',
			'mobile-frontend-close-section',
			'mobile-frontend-search-help',
			'mobile-frontend-search-noresults',
			'mobile-frontend-watchlist-add',
			'mobile-frontend-watchlist-removed',
			'mobile-frontend-watchlist-view',
			'mobile-frontend-ajax-random-heading',
			'mobile-frontend-ajax-random-quote',
			'mobile-frontend-ajax-random-quote-author',
			'mobile-frontend-ajax-random-question',
			'mobile-frontend-ajax-random-yes',
			'mobile-frontend-ajax-random-retry',
			'mobile-frontend-ajax-page-loading',
			'mobile-frontend-page-saving',
			'mobile-frontend-ajax-page-error',
			'mobile-frontend-meta-data-issues',
			'mobile-frontend-meta-data-issues-header',
			'mobile-frontend-show-button',
			'mobile-frontend-hide-button',
			'mobile-frontend-overlay-escape',
			'mobile-frontend-ajax-random-suggestions',
			'mobile-frontend-table',
			'mobile-frontend-photo-upload-error',
			'mobile-frontend-photo-upload-progress',
			'mobile-frontend-photo-caption-placeholder',
			'mobile-frontend-image-loading',
			'mobile-frontend-image-uploading',
			'mobile-frontend-image-saving-to-article',
			'mobile-frontend-photo-upload',
			'mobile-frontend-photo-article-edit-comment',
			'mobile-frontend-photo-upload-comment',
			'mobile-frontend-photo-upload-generic',
			'mobile-frontend-watchlist-cta',
			'mobile-frontend-watchlist-cta-button-signup',
			'mobile-frontend-watchlist-cta-button-login',
			'mobile-frontend-drawer-cancel',
		);
		foreach ( $messages as $msg ) {
			$config[ 'messages' ][ $msg ] = wfMessage( $msg )->text();
		}
		return $config;
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
		$user = $this->data['user'];
		$title = $this->data['title'];
		// FIXME: this should all be done in prepareTemplate - getting extremely messy
		$jsconfig = array(
			'messages' => array(
				'mobile-frontend-photo-license' => wfMessage( 'mobile-frontend-photo-license' )->parse(),
				'mobile-frontend-language-footer' => Html::element( 'a',
					array(
						'href' => SpecialPage::getTitleFor( 'MobileOptions/Language' )->getLocalUrl(),
					),
					wfMessage( 'mobile-frontend-language-footer' ) ),
			),
			'settings' => array(
				'action' => $this->data['action'],
				'authenticated' => $this->data['authenticated'],
				'photo-upload-endpoint' => $this->data['photo-upload-endpoint'],
				'scriptPath' => $wgScriptPath,
				'shim' => $this->data['shim'],
				'ajaxLoader' => $this->data['ajaxLoader'],
				'pageUrl' => $wgArticlePath,
				'imagesDisabled' => $this->data['imagesDisabled'],
				'beta' => $inBeta,
				'namespace' => $this->data['namespace'],
				'title' => $title->getPrefixedText(),
				'variant' => $this->data['variant'],
				'useFormatCookieName' => $this->data['useFormatCookieName'],
				'useFormatCookieDuration' => $this->data['useFormatCookieDuration'],
				'useFormatCookieDomain' => $this->data['useFormatCookieDomain'],
				'useFormatCookiePath' => $this->data['useFormatCookiePath'],
				'stopMobileRedirectCookieName' => $this->data['stopMobileRedirectCookieName'],
				'stopMobileRedirectCookieDuration' => $this->data['stopMobileRedirectCookieDuration'],
				'stopMobileRedirectCookieDomain' => $this->data['stopMobileRedirectCookieDomain'],
				'hookOptions' => $hookOptions,
				'username' => $user->getName(),
				'can_edit' => $user->isAllowed( 'edit' ) && $title->getNamespace() == NS_MAIN,
			),
		);

		$jsconfig = $this->addMessages( $jsconfig );

		if ( $user ) {
			$jsconfig['messages']['mobile-frontend-logged-in-toast-notification'] =
				wfMessage( 'mobile-frontend-logged-in-toast-notification', $user->getName() )->parse();
		}

		if ( $this->data['isMainPage'] ) {
			$jsconfig['messages']['empty-homepage'] = wfMessage( 'mobile-frontend-empty-homepage-text'
			)->parse();
			if ( $user && $user->isLoggedIn() ) {
				$firstHeading = Html::rawElement( 'h1', array(), wfMessage( 'mobile-frontend-logged-in-homepage-notification', $user->getName() )->text() );
			} else {
				$firstHeading = '';
			}
		} else if ( $this->data['htmlHeader'] ) {
			$firstHeading = $this->data['htmlHeader'];
		} else {
			$editMode = $this->data['action'] == 'edit';
			if ( $this->data['isOverlay'] ) {
				$headingOptions = array( 'class' => 'header' );
			} elseif ( $this->data['isBetaGroupMember'] && !$this->data['isSpecialPage'] && !$this->data['isMainPage'] && !$editMode ) {
				$headingOptions = array( 'id' => 'section_0' );
			} else {
				$headingOptions = array( 'id' => 'firstHeading' );
			}
			$firstHeading = Html::rawElement( 'h1', $headingOptions,
				$this->data['firstHeading']
			);
		}
		$this->set( 'jsConfig', FormatJSON::encode( $jsconfig ) );
		$this->set( 'firstHeading', $firstHeading );
		$this->set( 'wgMobileFrontendLogo', $wgMobileFrontendLogo );

		wfProfileOut( __METHOD__ );
	}

	private function searchBox() {
		if ( $this->data['isAlphaGroupMember'] ) {
			$placeholder = wfMessage( 'mobile-frontend-placeholder-alpha' )->text();
		} else if ( $this->data['isBetaGroupMember'] ) {
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
				<?php echo wfMessage( 'mobile-frontend-footer-license-text' )->parse() ?>
				<span>| <?php echo wfMessage( 'mobile-frontend-terms-use-text' )->parse() ?></span>
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
