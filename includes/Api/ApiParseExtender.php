<?php

namespace MobileFrontend\Api;

use ApiBase;
use ApiResult;
use MediaWiki\MediaWikiServices;
use MobileFormatter;
use MobileFrontend\Transforms\MakeSectionsTransform;
use MobileFrontend\Transforms\SubHeadingTransform;
use Title;

/**
 * Extends API action=parse with mobile goodies
 * See https://www.mediawiki.org/wiki/Extension:MobileFrontend#Extended_action.3Dparse
 */
class ApiParseExtender {
	/**
	 * APIGetAllowedParams hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/APIGetAllowedParams
	 * @param ApiBase $module
	 * @param array|bool &$params Array of parameters
	 */
	public static function onAPIGetAllowedParams( ApiBase $module, &$params ) {
		if ( $module->getModuleName() == 'parse' ) {
			$params['mobileformat'] = false;
			$params['mainpage'] = false;
		}
	}

	/**
	 * APIAfterExecute hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/APIAfterExecute
	 * @param ApiBase $module
	 */
	public static function onAPIAfterExecute( ApiBase $module ) {
		$services = MediaWikiServices::getInstance();
		$config = $services->getService( 'MobileFrontend.Config' );

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
				// HACK: need a nice way to request a TOC-free HTML in the first place
				$mf->remove( [ '.toc', '.mw-headline-anchor' ] );

				$transforms = [];
				$options = $config->get( 'MFMobileFormatterOptions' );
				$topHeadingTags = $options['headings'];

				$transforms[] = new SubHeadingTransform( $topHeadingTags );

				$transforms[] = new MakeSectionsTransform(
					$topHeadingTags,
					false
				);

				$mf->applyTransforms( $transforms );
				$result->addValue( [ 'parse' ], 'text', $mf->getText(),
					ApiResult::OVERRIDE | ApiResult::NO_SIZE_CHECK );
			}
		}
	}
}
