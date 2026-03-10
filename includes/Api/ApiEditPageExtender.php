<?php

namespace MobileFrontend\Api;

use MediaWiki\Api\ApiBase;
use MediaWiki\Api\ApiEditPage;
use MediaWiki\Api\Hook\APIGetAllowedParamsHook;
use Wikimedia\ParamValidator\ParamValidator;

/**
 * Adds the `editorinterface` as a recognized param to API calls to edit a page.
 */
class ApiEditPageExtender implements APIGetAllowedParamsHook {
	/**
	 * APIGetAllowedParams hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/APIGetAllowedParams
	 *
	 * @param ApiBase $module
	 * @param array &$params Array of parameters
	 * @param int $flags
	 * @return bool
	 */
	public function onAPIGetAllowedParams( $module, &$params, $flags ) {
		if ( $module instanceof ApiEditPage ) {
			$params['editorinterface'] = [
				ParamValidator::PARAM_TYPE => 'string',
				ParamValidator::PARAM_REQUIRED => false,
			];
		}

		return true;
	}
}
