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
	 * Check if an API action can have the mobileformat param
	 *
	 * @param string $action
	 * @return bool
	 */
	public static function isParseAction( string $action ): bool {
		return $action === 'parse' ||
			// VE calls parse indirectly
			$action === 'visualeditoredit' ||
			// DT calls VE indirectly
			$action === 'discussiontoolsedit';
	}

	/**
	 * APIGetAllowedParams hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/APIGetAllowedParams
	 * @param ApiBase $module
	 * @param array|bool &$params Array of parameters
	 */
	public static function onAPIGetAllowedParams( ApiBase $module, &$params ) {
		$name = $module->getModuleName();
		// $name is supposed to always be a string, but in some tests it returns null :/
		if ( $name && self::isParseAction( $name ) ) {
			$params['mobileformat'] = [
				ApiBase::PARAM_TYPE => 'boolean',
				ApiBase::PARAM_HELP_MSG => 'apihelp-parse-param-mobileformat',
			];
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

		$name = $module->getModuleName();
		if ( $name && self::isParseAction( $name ) ) {
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
