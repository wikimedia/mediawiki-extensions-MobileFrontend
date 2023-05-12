<?php

namespace MobileFrontend\ResourceLoaderModules;

use MediaWiki\ResourceLoader as RL;
use MobileFrontendEditorHooks;
use MobileFrontendHooks;
use Xml;

/**
 * A callback to deliver JavaScript config necessary for MobileFrontend.
 */
class MobileConfig {
	/**
	 * @param RL\Context $context
	 * @return string
	 */
	public static function makeScript( RL\Context $context ) {
		return Xml::encodeJsCall( 'mw.config.set', [ self::getConfigData() ] );
	}

	/**
	 * @return array
	 */
	private static function getConfigData() {
		return MobileFrontendHooks::getResourceLoaderMFConfigVars() +
			MobileFrontendEditorHooks::getResourceLoaderMFConfigVars();
	}
}
