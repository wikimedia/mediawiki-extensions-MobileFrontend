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
		$tpl->set( 'menuButton', $this->getMenuButton() );
		$specialPage = $title->isSpecialPage();
		$context = MobileContext::singleton();

		$device = $context->getDevice();
		$inBeta = $context->isBetaGroupMember();
		$inAlpha = $context->isAlphaGroupMember();

		/**
		 * force all non-special pages to render in article skin
		 * 
		 * NB not all special pages are overlays, so
		 * $context->setOverlay( $specialPage ) will not work!
		 * @TODO does setOverlay really belong in MobileContext?
		 *	probably not. ~awjr
		 */
		if ( !$specialPage ) {
			$context->setOverlay( false );
		}

		$tpl->set( 'isOverlay',  $context->isOverlay() );
		$tpl->set( 'action', $context->getRequest()->getText( 'action' ) );
		$tpl->set( 'imagesDisabled', $context->imagesDisabled() );
		$tpl->set( 'isAlphaGroupMember', $inAlpha );
		$tpl->set( 'isBetaGroupMember', $inBeta );
		$tpl->set( 'photo-upload-endpoint', $wgMFPhotoUploadEndpoint ? $wgMFPhotoUploadEndpoint : '' );
		$tpl->set( 'renderLeftMenu', $context->getForceLeftMenu() );
		$tpl->set( 'pagetitle', $out->getHTMLTitle() );
		$tpl->set( 'viewport-scaleable', $device->disableZoom() ? 'no' : 'yes' );
		$tpl->set( 'variant', $title->getPageLanguage()->getPreferredVariant() );

		$this->prepareTemplatePageContent( $tpl );

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
		$tpl->set( 'supports_jquery', $device->supportsJQuery() );

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
		$nearbyURL = SpecialPage::getTitleFor( 'Nearby' )->getLocalURL();
		$tpl->set( 'nearbyURL', $nearbyURL );

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

	/**
	 * Prepares the header and the content of a page
	 * Stores in QuickTemplate prebodytext, postbodytext, htmlHeader keys
	 * @param QuickTemplate
	 */
	function prepareTemplatePageContent( QuickTemplate $tpl ) {
		$ctx = MobileContext::singleton();
		$title = $this->getTitle();
		$isSpecialPage = $title->isSpecialPage();
		$isMainPage = $title->isMainPage();
		$isOverlay = $ctx->isOverlay();
		$user = $this->getUser();
		$userLogin = $title->isSpecial( 'Userlogin' );
		$out = $this->getOutput();
		$inBeta = MobileContext::singleton()->isBetaGroupMember();

		if ( $isSpecialPage && !$isOverlay ) {
			$pageHeading = '';
		} else if ( $userLogin ) {
			if ( $this->getRequest()->getVal( 'type' ) == 'signup' ) {
				$pageHeading = wfMessage( 'mobile-frontend-sign-up-heading' )->parse();
			} else {
				$pageHeading = wfMessage( 'mobile-frontend-sign-in-heading' )->parse();
			}
		} else {
			$pageHeading = $out->getPageTitle();
		}

		$preBodyText = '';
		$postBodyText = '';
		if ( !$isSpecialPage ) {
			$headingOptions = array();
			if ( $isMainPage ) {
				$pageHeading = $user->isLoggedIn() ?
					wfMessage( 'mobile-frontend-logged-in-homepage-notification', $user->getName() )->text() : '';
			} else {
				$headingOptions = array( 'id' => 'section_0' );
			}
			// prepend heading to articles
			if ( $pageHeading ) {
				$preBodyText = Html::rawElement( 'h1', $headingOptions, $pageHeading );
			}

			$timestamp = Revision::getTimestampFromId( $this->getTitle(), $this->getRevisionId() );
			$lastModified = wfMessage( 'mobile-frontend-last-modified-date',
				$this->getLanguage()->userDate( $timestamp, $user ),
				$this->getLanguage()->userTime( $timestamp, $user )
			)->parse();
			$timestamp = wfTimestamp( TS_UNIX, $timestamp );
			$postBodyText = $this->buildLanguageSelection();
			if ( $inBeta ) {
				$postBodyText .= "<p id=\"mw-mf-last-modified\" data-timestamp=\"$timestamp\">$lastModified</p>";
			}
		}

		$htmlHeader = $this->getHtmlHeader();
		if ( is_null( $htmlHeader ) ) {
			if ( $isOverlay ) {
				$htmlHeader = Html::rawElement( 'h1', array( 'class' => 'header' ),
					$pageHeading
				);
			} else {
				$htmlHeader = '';
			}
		}

		$tpl->set( 'prebodytext', $preBodyText );
		$tpl->set( 'postbodytext', $postBodyText );
		$tpl->set( 'htmlHeader', $htmlHeader );
	}

	protected function attachResources( Title $title, QuickTemplate $tpl, IDeviceProperties $device ) {
		global $wgAutoloadClasses, $wgMFLogEvents, $wgMFEnableResourceLoader, $wgResponsiveImages,
			$wgMFNearby;

		$context = MobileContext::singleton();
		$inBeta = $context->isBetaGroupMember();
		$inAlpha = $context->isAlphaGroupMember();
		$rlSupport = $inBeta && $wgMFEnableResourceLoader;
		$jsEnabled = $device->supportsJavaScript();
		$jQueryEnabled = $device->supportsJQuery();
		$action = $context->getRequest()->getText( 'action' );
		$out = $this->getOutput();

		$moduleNames = array( 'mobile.startup', 'mobile.site' );
		$headModuleNames = array( 'mobile.head', 'mobile.styles' );
		$headLinks = array();

		if ( $jQueryEnabled ) {
			if ( $rlSupport ) {
				// Initialize ResourceLoader, targeted to mobile...
				$headLinks[] = $this->resourceLoaderLink( 'startup', 'scripts', true, true, 'mobile' );
				$headLinks[] = Html::inlineScript(
					ResourceLoader::makeLoaderConditionalScript(
						ResourceLoader::makeConfigSetScript( $out->getJSVars() )
					)
				);
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
		// FIXME: separate into separate function
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

		$contextModules = $this->attachAdditionalPageResources( $title, $context );

		$headModuleNames = array_merge( $headModuleNames, $contextModules['top'] );
		$moduleNames = array_merge( $moduleNames, $contextModules['bottom'] );

		if ( $action === 'edit' ) {
			$moduleNames[] = 'mobile.action.edit';
		} else if ( $action === 'history' ) {
			$moduleNames[] = 'mobile.action.history';
		}
		$moduleNames[] = $device->moduleName();

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
	 * @param Title $title
	 * @param MobileContext $context
	 *
	 * @return array
	 */
	protected function attachAdditionalPageResources( Title $title, MobileContext $context ) {
		global $wgResourceModules;
		$isFilePage = $title->getNamespace() == NS_FILE;
		$action = $context->getRequest()->getText( 'action' );
		$isSpecialPage = $title->isSpecialPage();

		$moduleNames = array();
		$headModuleNames = array();

		// specific to current context
		if ( $isFilePage ) {
			$moduleNames[] = 'mobile.file.scripts';
			$headModuleNames[] = 'mobile.file.styles';
		}

		if ( $isSpecialPage ) {
			list( $name, /* $subpage */ ) = SpecialPageFactory::resolveAlias( $title->getDBkey() );
			$id = strtolower( $name );
			$specialStyleModuleName = 'mobile.' . $id . '.styles';
			$specialScriptModuleName = 'mobile.' . $id . '.scripts';

			if ( isset( $wgResourceModules[ $specialStyleModuleName ] ) ) {
				$headModuleNames[] = $specialStyleModuleName;
			}

			if ( isset( $wgResourceModules[ $specialScriptModuleName ] ) ) {
				$moduleNames[] = $specialScriptModuleName;
			}
		}

		if ( $action === 'edit' ) {
			$moduleNames[] = 'mobile.action.edit';
		} else if ( $action === 'history' ) {
			$moduleNames[] = 'mobile.action.history';
		}

		return array(
			'top' => $headModuleNames,
			'bottom' => $moduleNames,
		);
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

	public function getMenuButton() {
		$url = SpecialPage::getTitleFor( 'MobileMenu' )->getLocalUrl() . '#mw-mf-page-left';
		return Html::element( 'a', array(
				'title' => wfMessage( 'mobile-frontend-main-menu-button-tooltip' )->text(),
				'href' => $url,
				'id'=> 'mw-mf-main-menu-button',
			) );
	}
}

class SkinMobileTemplate extends BaseTemplate {
	public function renderArticleSkin() {
		$this->navigationStart();
		?>
		<?php $this->html( 'zeroRatedBanner' ) ?>
		<?php $this->html( 'notice' ) ?>
		<?php $this->renderArticleHeader() ?>
	<div class='show <?php $this->html( 'articleClass' ); ?>' id='content_wrapper'>
			<div id="content" class="content">
			<?php $this->html( 'prebodytext' ) ?>
			<?php $this->html( 'bodytext' ) ?>
			<?php $this->html( 'postbodytext' ) ?>
			</div><!-- close #content -->
	</div><!-- close #content_wrapper -->
		<?php
		if ( !$this->data[ 'isSpecialPage' ] ) {
			$this->footer();
		} ?>
		<?php
			$this->navigationEnd();
	}

	public function renderArticleHeader() {
		if ( $this->data['htmlHeader'] ) {
			echo $this->data['htmlHeader'];
		} else {
			$this->searchBox();
		}
	}

	public function renderOverlaySkin() {
		?>
		<?php $this->html( 'zeroRatedBanner' ) ?>
		<div id="mw-mf-overlay">
			<?php $this->renderOverlayHeader() ?>
				<div id="content_wrapper" class="mw-mf-special">
					<?php $this->html( 'bodytext' ) ?>
				</div>
			</div>
		<?php
	}

	public function renderOverlayHeader() {
		echo $this->data['htmlHeader'];
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
		/** @var $user User */
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
			<?php if ( $this->data['isBetaGroupMember'] && $user->isAllowed( 'upload' ) ) { ?>
				<li class='iconUpload'>
					<a href="<?php $this->text( 'donateImageUrl' ) ?>"
						title="<?php $this->msg( 'mobile-frontend-main-menu-upload' ) ?>">
					<?php $this->msg( 'mobile-frontend-main-menu-upload' ) ?>
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
			<?php if ( $this->data['isAlphaGroupMember'] ) { ?>
			<li class='iconImage'>
				<a href="<?php $this->text( 'nearbyURL' ) ?>"
					title="<?php $this->msg( 'mobile-frontend-main-menu-nearby' ) ?>">
				<?php $this->msg( 'mobile-frontend-main-menu-nearby' ) ?>
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

	// @fixme: This code exists whilst MobileFrontend is not fully ResourceLoader (RL) integrated
	// It provides messages for the mobile site when RL is not available
	public function addMessages( $config ) {
		global $wgResourceModules;
		$modules = array(
			'mobile.production-only',
			'mobile.production-jquery',
			'mobile.action.edit',
		);
		foreach( $modules as $name ) {
			if ( isset( $wgResourceModules[$name]["messages"] ) ) {
				foreach( $wgResourceModules[$name]["messages"] as $msg ) {
					$config[ 'messages' ][ $msg ] = wfMessage( $msg )->text();
				}
			}
		}
		return $config;
	}

	public function prepareData() {
		global $wgExtensionAssetsPath, $wgScriptPath, $wgMobileFrontendLogo, $wgArticlePath, $wgMFEnableResourceLoader;

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
		/** @var $user User */
		$user = $this->data['user'];
		/** @var $title Title */
		$title = $this->data['title'];
		// FIXME: this should all be done in prepareTemplate - getting extremely messy
		$jsconfig = array(
			// FIXME: these messages require parsing before being sent to mobile - the parsing should probably be done in javascript
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
				'username' => $user->isAnon() ? '' : $user->getName(),
				'can_edit' => $user->isAllowed( 'edit' ) && $title->getNamespace() == NS_MAIN,
			),
		);

		$jQuerySupport = $this->data['supports_jquery'];
		if ( !$inBeta || !$wgMFEnableResourceLoader || !$jQuerySupport ) {
			$jsconfig = $this->addMessages( $jsconfig );
		}

		if ( $user->isLoggedIn() ) {
			$jsconfig['messages']['mobile-frontend-logged-in-toast-notification'] =
				wfMessage( 'mobile-frontend-logged-in-toast-notification', $user->getName() )->parse();
		}

		if ( $this->data['isMainPage'] ) {
			// FIXME: move parsing into javascript
			$jsconfig['messages']['empty-homepage'] = wfMessage( 'mobile-frontend-empty-homepage-text'
			)->parse();
		}

		$this->set( 'jsConfig', FormatJSON::encode( $jsconfig ) );
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
		<?php $this->html( 'menuButton' ) ?>
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
