<?php

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
		$mfSpecialCaseMainPage = MobileContext::singleton()
			->getMFConfig()->get( 'MFSpecialCaseMainPage' );

		if ( $module->getModuleName() == 'parse' ) {
			$data = $module->getResult()->getResultData();
			$params = $module->extractRequestParams();
			if ( isset( $data['parse']['text'] ) && $params['mobileformat'] ) {
				$result = $module->getResult();
				$result->reset();

				$title = Title::newFromText( $data['parse']['title'] );
				$text = $data['parse']['text'];
				if ( is_array( $text ) ) {
					if ( isset( $text[ApiResult::META_CONTENT] ) ) {
						$contentKey = $text[ApiResult::META_CONTENT];
					} else {
						$contentKey = '*';
					}
					$html = MobileFormatter::wrapHTML( $text[$contentKey] );
				} else {
					$html = MobileFormatter::wrapHTML( $text );
				}
				$mf = new MobileFormatter( $html, $title );
				$mf->setRemoveMedia( $params['noimages'] );
				$mf->setIsMainPage( $params['mainpage'] && $mfSpecialCaseMainPage );
				$mf->enableExpandableSections( !$params['mainpage'] );
				$mf->disableScripts();
				// HACK: need a nice way to request a TOC-free HTML in the first place
				$mf->remove( [ '.toc', '.mw-headline-anchor' ] );
				$mf->filterContent();

				if ( is_array( $text ) ) {
					$text[$contentKey] = $mf->getText();
				} else {
					$text = $mf->getText();
				}
				$data['parse']['text'] = $text;

				$result->addValue( null, $module->getModuleName(), $data['parse'] );
			}
		}
		return true;
	}
}
