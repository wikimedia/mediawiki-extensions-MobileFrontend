<?php

use MediaWiki\MediaWikiServices;

/**
 * Extends API action=parse with mobile goodies
 * See https://www.mediawiki.org/wiki/Extension:MobileFrontend#Extended_action.3Dparse
 */
class ApiParseExtender {
	/**
	 * APIGetAllowedParams hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/APIGetAllowedParams
	 * @param ApiBase &$module
	 * @param array|bool &$params Array of parameters
	 * @return bool
	 */
	public static function onAPIGetAllowedParams( ApiBase &$module, &$params ) {
		if ( $module->getModuleName() == 'parse' ) {
			$params['mobileformat'] = false;
			$params['noimages'] = false;
			$params['mainpage'] = false;
		}
		return true;
	}

	/**
	 * APIAfterExecute hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/APIAfterExecute
	 * @param ApiBase &$module
	 * @return bool
	 */
	public static function onAPIAfterExecute( ApiBase &$module ) {
		$services = MediaWikiServices::getInstance();
		$config = $services->getService( 'MobileFrontend.Config' );
		$mfSpecialCaseMainPage = $config->get( 'MFSpecialCaseMainPage' );

		$context = $services->getService( 'MobileFrontend.Context' );

		if ( $module->getModuleName() == 'parse' ) {
			$result = $module->getResult();
			$data = $result->getResultData();
			$params = $module->extractRequestParams();
			if ( isset( $data['parse']['text'] ) && $params['mobileformat'] ) {
				$title = Title::newFromText( $data['parse']['title'] );
				$text = $data['parse']['text'];
				$mf = new MobileFormatter(
					MobileFormatter::wrapHTML( $text ), $title, $config, $context
				);
				$mf->setRemoveMedia( $params['noimages'] );
				$mf->setIsMainPage( $params['mainpage'] && $mfSpecialCaseMainPage );
				$mf->enableExpandableSections( !$params['mainpage'] );
				$mf->disableScripts();
				// HACK: need a nice way to request a TOC-free HTML in the first place
				$mf->remove( [ '.toc', '.mw-headline-anchor' ] );
				$mf->filterContent();
				$result->addValue( [ 'parse' ], 'text', $mf->getText(),
					ApiResult::OVERRIDE | ApiResult::NO_SIZE_CHECK );
			}
		}
		return true;
	}
}
