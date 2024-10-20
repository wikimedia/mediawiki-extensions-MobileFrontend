<?php

namespace MobileFrontend\Api;

use MediaWiki\Api\ApiBase;
use MediaWiki\Api\Hook\APIGetAllowedParamsHook;
use Wikimedia\ParamValidator\ParamValidator;

/**
 * Adds the `mobileformat` param to API calls which use ApiParse.
 *
 * The param should be used in conjunction with the `useskin` paramater (to
 * ensure ApiParse is in skin mode), and will cause MobileFrontend's
 * onOutputPageBeforeHTML to apply mobile-specific page transformations.
 */
class ApiParseExtender implements APIGetAllowedParamsHook {

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
			$action === 'discussiontoolsedit' ||
			$action === 'discussiontoolspreview';
	}

	/**
	 * APIGetAllowedParams hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/APIGetAllowedParams
	 * @param ApiBase $module
	 * @param array &$params Array of parameters
	 * @param int $flags
	 */
	public function onAPIGetAllowedParams( $module, &$params, $flags ) {
		$name = $module->getModuleName();
		// $name is supposed to always be a string, but in some tests it returns null :/
		if ( $name && self::isParseAction( $name ) ) {
			$params['mobileformat'] = [
				ParamValidator::PARAM_TYPE => 'boolean',
				ApiBase::PARAM_HELP_MSG => 'apihelp-parse-param-mobileformat',
			];
		}
	}
}
