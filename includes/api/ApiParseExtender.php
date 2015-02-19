<?php
/**
 * ApiParseExtender.php
 */

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
		global $wgMFSpecialCaseMainPage;

		if ( $module->getModuleName() == 'parse' ) {
			if ( defined( 'ApiResult::META_CONTENT' ) ) {
				$data = $module->getResult()->getResultData();
			} else {
				$data = $module->getResultData();
			}
			$params = $module->extractRequestParams();
			if ( isset( $data['parse']['text'] ) && $params['mobileformat'] ) {
				$result = $module->getResult();
				$result->reset();

				$title = Title::newFromText( $data['parse']['title'] );
				$text = $data['parse']['text'];
				if ( is_array( $text ) ) {
					if ( defined( 'ApiResult::META_CONTENT' ) &&
						isset( $text[ApiResult::META_CONTENT] )
					) {
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
				$mf->setIsMainPage( $params['mainpage'] && $wgMFSpecialCaseMainPage );
				$mf->enableExpandableSections( !$params['mainpage'] );
				// HACK: need a nice way to request a TOC- and edit link-free HTML in the first place
				// FIXME: Should this be .mw-editsection?
				$mf->remove( array( '.toc', 'mw-editsection', '.mw-headline-anchor' ) );
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
