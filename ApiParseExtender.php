<?php

/**
 * 
 */
class ApiParseExtender {
	public static function onAPIGetAllowedParams( ApiBase &$module, Array &$params ) {
		if ( $module->getModuleName() == 'parse' ) {
			$params['mobileformat'] = array(
				ApiBase::PARAM_TYPE => array( 'wml', 'html' ),
				ApiBase::PARAM_DFLT => 'html',
			);
		}
		return true;
	}

	public static function onAPIAfterExecute( ApiBase &$module ) {
		if ( $module->getModuleName() == 'parse' ) {
			$data = $module->getResultData();
			if ( isset( $data['parse']['text'] ) ) {
				$params = $module->extractRequestParams();
				$mf = new DomManipulator( '<body><div id="content">' . $data['parse']['text']['*'] . '</div></body>',
						ExtMobileFrontend::parseContentFormat( $params['mobileformat'] )
				);
				$mf->filterContent();
				$data['parse']['text'] = $mf->getText( 'content' );

				$result = $module->getResult();
				$result->reset();
				$result->addValue( null, $module->getModuleName(), $data );
			}
		}
		return true;
	}
}
