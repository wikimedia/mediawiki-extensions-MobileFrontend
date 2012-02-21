<?php

/**
 * Extends API action=parse with mobile goodies
 */
class ApiParseExtender {
	/**
	 * APIGetAllowedParams hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/APIGetAllowedParams
	 * @param ApiBase $module
	 * @param array|bool $params
	 */
	public static function onAPIGetAllowedParams( ApiBase &$module, &$params ) {
		if ( $module->getModuleName() == 'parse' ) {
			$params['mobileformat'] = array(
				ApiBase::PARAM_TYPE => array( 'wml', 'html' ),
			);
			$params['expandablesections'] = false;
			$params['noimages'] = false;
			$params['mainpage'] = false;
		}
		return true;
	}

	/**
	 * APIGetParamDescription hook handler
	 * @see: https://www.mediawiki.org/wiki/Manual:Hooks/APIGetParamDescription
	 * @param ApiBase $module
	 * @param Array $desc 
	 */
	public static function onAPIGetParamDescription( ApiBase &$module, Array &$params ) {
		if ( $module->getModuleName() == 'parse' ) {
			$params['mobileformat'] = 'Return parse output in a format suitable for mobile devices';
			$params['expandablesections'] = 'Make sections in mobile output collapsed by default, expandable via JavaScript.'
				. " Ignored if `section' parameter is set.";
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
	 */
	public static function onAPIGetDescription( ApiBase &$module, &$desc ) {
		if ( $module->getModuleName() == 'parse' ) {
			$desc= (array)$desc;
			$desc[] = 'Extended by MobileFrontend';
		}
		return true;
	}

	/**
	 * APIAfterExecute hook handler
	 * @see: https://www.mediawiki.org/wiki/Manual:Hooks/
	 * @param ApiBase $module
	 */
	public static function onAPIAfterExecute( ApiBase &$module ) {
		if ( $module->getModuleName() == 'parse' ) {
			$data = $module->getResultData();
			$params = $module->extractRequestParams();
			if ( isset( $data['parse']['text'] ) && isset( $params['mobileformat'] ) ) {
				$result = $module->getResult();
				$result->reset();

				$title = Title::newFromText( $data['parse']['title'] );
				$context = new WmlContext();
				$context->setCurrentUrl( $title->getCanonicalURL() );
				$context->setRequestedSegment( isset( $params['section'] )
					? $params['section'] + 1 // Segment numbers start from 1
					: 0
				);
				$context->setUseFormat( 'wml' ); // Force WML links just in case
				$context->setOnlyThisSegment( isset( $params['section'] ) );
				$mf = new MobileFormatter( '<body><div id="content">' . $data['parse']['text']['*'] . '</div></body>',
					$title,
					ExtMobileFrontend::parseContentFormat( $params['mobileformat'] ),
					$context
				);
				if ( $params['expandablesections'] ) {
					if ( isset( $params['section'] ) ) {
						$module->setWarning( "`expandablesections' and `section' can't be used simultaneously" );
					} elseif ( !$title->isMainPage() ) {
						$mf->enableExpandableSections();
					}
				}
				$mf->removeImages( $params['noimages'] );
				$mf->setIsMainPage( $params['mainpage'] );
				if ( $params['mainpage'] && $params['expandablesections'] ) {
					$module->setWarning( "`mainpage' and `expandablesections' can't be used simultaneously" );
				}
				$mf->filterContent();
				$data['parse']['text'] = $mf->getText( 'content' );

				$result->addValue( null, $module->getModuleName(), $data['parse'] );
			}
		}
		return true;
	}
}
