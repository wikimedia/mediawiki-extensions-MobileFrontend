<?php

use MediaWiki\Html\Html;
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
			$title = $skin->getTitle() ?? Title::newMainPage();
			$url = $title->getLocalURL(
				$req->appendQueryValue( 'mobileaction', 'toggle_view_desktop' )
			);
		}
		$urlUtils = MediaWikiServices::getInstance()->getUrlUtils();
		$desktopUrl = $context->getDesktopUrl( $urlUtils->expand( $url, PROTO_RELATIVE ) ?? '' );

		$desktop = $context->msg( 'mobile-frontend-view-desktop' )->text();
		return Html::element( 'a',
			[ 'id' => 'mw-mf-display-toggle', 'href' => $desktopUrl,
				'data-event-name' => 'switch_to_desktop' ], $desktop );
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
		// Title could be null
		// If no title, there is a problem with context. Possibly inside a test.
		if ( !$title ) {
			return '';
		}
		$mobileViewUrl = $title->getFullURL( $args );
		$mobileViewUrl = $context->getMobileUrl( $mobileViewUrl );

		return Html::element( 'a',
			[ 'href' => $mobileViewUrl, 'class' => 'noprint stopMobileRedirectToggle' ],
			$context->msg( 'mobile-frontend-view' )->text()
		);
	}
}
