<?php

/**
 * Extends API action=parse with mobile goodies
 * See https://www.mediawiki.org/wiki/Extension:MobileFrontend#Extended_action.3Dparse
 */
class ApiParseExtender {
	/**
	 * APIGetAllowedParams hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/APIGetAllowedParams
	 * @param ApiBase $module
	 * @param array|bool $params
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
	 * APIGetParamDescription hook handler
	 * @see: https://www.mediawiki.org/wiki/Manual:Hooks/APIGetParamDescription
	 * @param ApiBase $module
	 * @param Array|bool $params
	 * @return bool
	 */
	public static function onAPIGetParamDescription( ApiBase &$module, &$params ) {
		if ( $module->getModuleName() == 'parse' ) {
			$params['mobileformat'] = 'Return parse output in a format suitable for mobile devices';
			$params['noimages'] = 'Disable images in mobile output';
			$params['mainpage'] = 'Apply mobile main page transformations';
		}
		return true;
	}

	/**
	 * APIGetDescription hook handler
	 * @see: https://www.mediawiki.org/wiki/Manual:Hooks/APIGetDescription
	 * @param ApiBase $module
	 * @param Array|string $desc
	 * @return bool
	 */
	public static function onAPIGetDescription( ApiBase &$module, &$desc ) {
		if ( $module->getModuleName() == 'parse' ) {
			$desc = (array)$desc;
			$desc[] = 'Extended by MobileFrontend';
		}
		return true;
	}

	/**
	 * APIAfterExecute hook handler
	 * @see: https://www.mediawiki.org/wiki/Manual:Hooks/
	 * @param ApiBase $module
	 * @return bool
	 */
	public static function onAPIAfterExecute( ApiBase &$module ) {
		if ( $module->getModuleName() == 'parse' ) {
			wfProfileIn( __METHOD__ );
			$data = $module->getResultData();
			$params = $module->extractRequestParams();
			if ( isset( $data['parse']['text'] ) && $params['mobileformat'] ) {
				wfProfileIn( __METHOD__ . '-mobiletransform' );
				$result = $module->getResult();
				$result->reset();

				$title = Title::newFromText( $data['parse']['title'] );
				$html = MobileFormatter::wrapHTML( $data['parse']['text']['*'] );
				$mf = new MobileFormatter( $html, $title );
				$mf->setRemoveMedia( $params['noimages'] );
				$mf->setIsMainPage( $params['mainpage'] );
				$mf->enableExpandableSections( !$params['mainpage'] );
				// HACK: need a nice way to request a TOC- and edit link-free HTML in the first place
				$mf->remove( array( '.toc', 'mw-editsection' ) );
				$mf->filterContent();

				$arr = array();
				ApiResult::setContent( $arr, $mf->getText() );
				$data['parse']['text'] = $arr;

				$result->addValue( null, $module->getModuleName(), $data['parse'] );
				wfProfileOut( __METHOD__ . '-mobiletransform' );
			}
			wfProfileOut( __METHOD__ );
		}
		return true;
	}
}
