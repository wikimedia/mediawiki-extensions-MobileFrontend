<?php

use MediaWiki\MediaWikiServices;

class MobileFrontendSkinHooks {
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
		$services = MediaWikiServices::getInstance();
		$config = $services->getService( 'MobileFrontend.Config' );
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
				$linkRenderer = $services->getLinkRenderer();
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
		$hookContainer = $services->getHookContainer();
		$hookContainer->run( 'MobileLicenseLink', [ &$link, $context, $attribs, &$msg ] );

		return [
			'msg' => $msg,
			'link' => $link,
			'plural' => self::getPluralLicenseInfo( $link )
		];
	}

	/**
	 * @param Skin $skin
	 * @param MobileContext $context
	 * @return string representing the desktop link.
	 */
	public static function getDesktopViewLink( Skin $skin, MobileContext $context ) {
		$url = $skin->getOutput()->getProperty( 'desktopUrl' );
		$req = $skin->getRequest();
		if ( $url ) {
			$url = wfAppendQuery( $url, 'mobileaction=toggle_view_desktop' );
		} else {
			$title = $skin->getTitle();
			$url = $title->getLocalURL(
				$req->appendQueryValue( 'mobileaction', 'toggle_view_desktop' )
			);
		}
		$desktopUrl = $context->getDesktopUrl( wfExpandUrl( $url, PROTO_RELATIVE ) );

		$desktop = $context->msg( 'mobile-frontend-view-desktop' )->text();
		return Html::element( 'a',
			[ 'id' => 'mw-mf-display-toggle', 'href' => $desktopUrl ], $desktop );
	}

	/**
	 * @param Skin $skin
	 * @param MobileContext $context
	 * @return string representing the mobile link.
	 */
	public static function getMobileViewLink( Skin $skin, MobileContext $context ) {
		$req = $skin->getRequest();
		$args = $req->getQueryValues();
		// avoid title being set twice
		unset( $args['title'], $args['useformat'] );
		$args['mobileaction'] = 'toggle_view_mobile';
		$title = $skin->getTitle();
		$mobileViewUrl = $title->getFullURL( $args );
		$mobileViewUrl = $context->getMobileUrl( $mobileViewUrl );

		return Html::element( 'a',
			[ 'href' => $mobileViewUrl, 'class' => 'noprint stopMobileRedirectToggle' ],
			$context->msg( 'mobile-frontend-view' )->text()
		);
	}

	/**
	 * Generate the licensing text displayed in the footer of each page.
	 * See Skin::getCopyright for desktop equivalent.
	 * @param Skin $skin
	 * @return string
	 */
	public static function getLicenseText( $skin ) {
		$license = self::getLicense( 'footer' );
		if ( isset( $license['link'] ) && $license['link'] ) {
			return $skin->msg( $license['msg'] )->rawParams( $license['link'] )->text();
		} else {
			return '';
		}
	}
}
