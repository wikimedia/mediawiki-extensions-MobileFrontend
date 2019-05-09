<?php

use MediaWiki\MediaWikiServices;

class MobileFrontendSkinHooks {
	/**
	 * Make it possible to open sections while JavaScript is still loading.
	 *
	 * @return string The JavaScript code to add event handlers to the skin
	 */
	public static function interimTogglingSupport() {
		$js = <<<JAVASCRIPT
function mfTempOpenSection( id ) {
	var block = document.getElementById( "mf-section-" + id );
	block.className += " open-block";
	// The previous sibling to the content block is guaranteed to be the
	// associated heading due to mobileformatter. We need to add the same
	// class to flip the collapse arrow icon.
	// <h[1-6]>heading</h[1-6]><div id="mf-section-[1-9]+"></div>
	block.previousSibling.className += " open-block";
}
JAVASCRIPT;
		return Html::inlineScript(
			ResourceLoader::filter( 'minify-js', $js )
		);
	}

	/**
	 * Fallback for Grade C to load lazyload image placeholders.
	 *
	 * Note: This will add a single repaint for Grade C browsers as
	 * images enter view but this is intentional and deemed acceptable.
	 *
	 * @return string The JavaScript code to load lazy placeholders in Grade C browsers
	 */
	public static function gradeCImageSupport() {
		// Notes:
		// * Document#getElementsByClassName is supported by IE9+ and #querySelectorAll is
		// supported by IE8+. To gain the widest possible browser support we scan for
		// noscript tags using #getElementsByTagName and look at the next sibling.
		// If the next sibling has the lazy-image-placeholder class then it will be assumed
		// to be a placeholder and replace with an img tag.
		// * Iterating over the live NodeList from getElementsByTagName() is suboptimal
		// but in IE < 9, Array#slice() throws when given a NodeList. It also requires
		// the 2nd argument ('end').
		$js = <<<JAVASCRIPT
(window.NORLQ = window.NORLQ || []).push( function () {
	var ns, i, p, img;
	ns = document.getElementsByTagName( 'noscript' );
	for ( i = 0; i < ns.length; i++ ) {
		p = ns[i].nextSibling;
		if ( p && p.className && p.className.indexOf( 'lazy-image-placeholder' ) > -1 ) {
			img = document.createElement( 'img' );
			img.setAttribute( 'src', p.getAttribute( 'data-src' ) );
			img.setAttribute( 'width', p.getAttribute( 'data-width' ) );
			img.setAttribute( 'height', p.getAttribute( 'data-height' ) );
			img.setAttribute( 'alt', p.getAttribute( 'data-alt' ) );
			p.parentNode.replaceChild( img, p );
		}
	}
} );
JAVASCRIPT;
		return $js;
	}

	/**
	 * Returns HTML of terms of use link or null if it shouldn't be displayed
	 * Note: This is called by a hook in the WikimediaMessages extension.
	 *
	 * @param MessageLocalizer $localizer
	 * @return null|string
	 */
	public static function getTermsLink( MessageLocalizer $localizer ) {
		$urlMsg = $localizer->msg( 'mobile-frontend-terms-url' )->inContentLanguage();
		if ( $urlMsg->isDisabled() ) {
			return null;
		}
		$url = $urlMsg->plain();

		return Html::element(
			'a',
			[ 'href' => Skin::makeInternalOrExternalUrl( $url ) ],
			$localizer->msg( 'mobile-frontend-terms-text' )->text()
		);
	}

	/**
	 * Check, if the given license message string holds multiple license messages.
	 *
	 * FIXME: This hack shouldn't be needed anymore after fixing T111833
	 *
	 * @param string $license License or licenses message
	 * @param Message|null $msgObj delimiter (optional)
	 * @return int Returns 2, if there are multiple licenses, 1 otherwise.
	 */
	public static function getPluralLicenseInfo( $license, $msgObj = null ) {
		// for plural support we need the info, if there is one or more licenses used in the license text
		// this check if very simple and works on the base, that more than one license will
		// use "and" as a connective
		// 1 - no plural
		// 2 - plural
		if ( $msgObj !== null ) {
			$delimiterMsg = $msgObj;
		} else {
			$delimiterMsg = wfMessage( 'and' );
		}
		$delimiterMsg = $delimiterMsg->inContentLanguage();
		// check, if "and" isn't disabled and exists in site language
		return $delimiterMsg->isDisabled() || strpos( $license, $delimiterMsg->text() ) === false ? 1 : 2;
	}

	/**
	 * Returns HTML of license link or empty string
	 * For example:
	 *   "<a title="Wikipedia:Copyright" href="/index.php/Wikipedia:Copyright">CC BY</a>"
	 *
	 * @param string $context The context in which the license link appears, e.g. footer,
	 *   editor, talk, or upload.
	 * @param array $attribs An associative array of extra HTML attributes to add to the link
	 * @return array Associative array containing the license text and link
	 */
	public static function getLicense( $context, array $attribs = [] ) {
		$config = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Config' );
		$rightsPage = $config->get( 'RightsPage' );
		$rightsUrl = $config->get( 'RightsUrl' );
		$rightsText = $config->get( 'RightsText' );

		// Construct the link to the licensing terms
		if ( $rightsText ) {
			// Use shorter text for some common licensing strings. See Installer.i18n.php
			// for the currently offered strings. Unfortunately, there is no good way to
			// comprehensively support localized licensing strings since the license (as
			// stored in LocalSettings.php) is just freeform text, not an i18n key.
			$commonLicenses = [
				'Creative Commons Attribution-Share Alike 3.0' => 'CC BY-SA 3.0',
				'Creative Commons Attribution Share Alike' => 'CC BY-SA',
				'Creative Commons Attribution 3.0' => 'CC BY 3.0',
				// Wikinews
				'Creative Commons Attribution 2.5' => 'CC BY 2.5',

				'Creative Commons Attribution' => 'CC BY',
				'Creative Commons Attribution Non-Commercial Share Alike' => 'CC BY-NC-SA',
				'Creative Commons Zero (Public Domain)' => 'CC0 (Public Domain)',
				'GNU Free Documentation License 1.3 or later' => 'GFDL 1.3 or later',
			];

			if ( isset( $commonLicenses[$rightsText] ) ) {
				$rightsText = $commonLicenses[$rightsText];
			}
			if ( $rightsPage ) {
				$title = Title::newFromText( $rightsPage );
				$linkRenderer = MediaWikiServices::getInstance()->getLinkRenderer();
				$link = $linkRenderer->makeKnownLink( $title, new HtmlArmor( $rightsText ), $attribs );
			} elseif ( $rightsUrl ) {
				$link = Linker::makeExternalLink( $rightsUrl, $rightsText, true, '', $attribs );
			} else {
				$link = $rightsText;
			}
		} else {
			$link = '';
		}

		// Allow other extensions (for example, WikimediaMessages) to override
		$msg = 'mobile-frontend-copyright';
		Hooks::run( 'MobileLicenseLink', [ &$link, $context, $attribs, &$msg ] );

		return [
			'msg' => $msg,
			'link' => $link,
			'plural' => self::getPluralLicenseInfo( $link )
		];
	}

	/**
	 * Prepares the footer for the skins serving the desktop and mobile sites.
	 * @param Skin $skin
	 * @param QuickTemplate $tpl
	 */
	public static function prepareFooter( Skin $skin, QuickTemplate $tpl ) {
		$title = $skin->getTitle();
		$req = $skin->getRequest();
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );

		// Certain pages might be blacklisted and not have a mobile equivalent.
		if ( !$context->isBlacklistedPage() ) {
			if ( $context->shouldDisplayMobileView() ) {
				self::mobileFooter( $skin, $tpl, $context, $title, $req );
			} else {
				self::desktopFooter( $skin, $tpl, $context, $title, $req );
			}
		}
	}

	/**
	 * Appends a mobile view link to the desktop footer
	 * @param Skin $skin
	 * @param QuickTemplate $tpl
	 * @param MobileContext $context
	 * @param Title $title Page title
	 * @param WebRequest $req
	 */
	public static function desktopFooter( Skin $skin, QuickTemplate $tpl, MobileContext $context,
		Title $title, WebRequest $req
	) {
		$footerlinks = $tpl->data['footerlinks'];
		$args = $req->getQueryValues();
		// avoid title being set twice
		unset( $args['title'], $args['useformat'] );
		$args['mobileaction'] = 'toggle_view_mobile';

		$mobileViewUrl = $title->getFullURL( $args );
		$mobileViewUrl = $context->getMobileUrl( $mobileViewUrl );

		$link = Html::element( 'a',
			[ 'href' => $mobileViewUrl, 'class' => 'noprint stopMobileRedirectToggle' ],
			$context->msg( 'mobile-frontend-view' )->text()
		);
		$tpl->set( 'mobileview', $link );
		$footerlinks['places'][] = 'mobileview';
		$tpl->set( 'footerlinks', $footerlinks );
	}

	/**
	 * Prepares links used in the mobile footer
	 * @param Skin $skin
	 * @param QuickTemplate $tpl
	 * @param MobileContext $context
	 * @param Title $title Page title
	 * @param WebRequest $req
	 * @return QuickTemplate
	 */
	protected static function mobileFooter( Skin $skin, QuickTemplate $tpl, MobileContext $context,
		Title $title, WebRequest $req
	) {
		$url = $skin->getOutput()->getProperty( 'desktopUrl' );
		if ( $url ) {
			$url = wfAppendQuery( $url, 'mobileaction=toggle_view_desktop' );
		} else {
			$url = $title->getLocalURL(
				$req->appendQueryValue( 'mobileaction', 'toggle_view_desktop' )
			);
		}
		$desktopUrl = $context->getDesktopUrl( wfExpandUrl( $url, PROTO_RELATIVE ) );

		$desktop = $context->msg( 'mobile-frontend-view-desktop' )->text();
		$desktopToggler = Html::element( 'a',
			[ 'id' => 'mw-mf-display-toggle', 'href' => $desktopUrl ], $desktop );

		// Generate the licensing text displayed in the footer of each page.
		// See Skin::getCopyright for desktop equivalent.
		$license = self::getLicense( 'footer' );
		if ( isset( $license['link'] ) && $license['link'] ) {
			$licenseText = $skin->msg( $license['msg'] )->rawParams( $license['link'] )->text();
		} else {
			$licenseText = '';
		}

		// Enable extensions to add links to footer in Mobile view, too - bug 66350
		Hooks::run( 'MobileSiteOutputPageBeforeExec', [ &$skin, &$tpl ] );

		$tpl->set( 'desktop-toggle', $desktopToggler );
		$tpl->set( 'mobile-license', $licenseText );
		$tpl->set( 'privacy', $skin->footerLink( 'mobile-frontend-privacy-link-text', 'privacypage' ) );
		$tpl->set( 'terms-use', self::getTermsLink( $skin ) );

		$places = [
			'terms-use',
			'privacy',
			'desktop-toggle'
		];
		$footerlinks = [
			'places' => $places,
		];
		$tpl->set( 'footerlinks', $footerlinks );
		return $tpl;
	}
}
