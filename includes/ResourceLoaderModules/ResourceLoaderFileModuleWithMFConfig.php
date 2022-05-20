<?php

namespace MobileFrontend\ResourceLoaderModules;

use MediaWiki\ResourceLoader as RL;
use MobileFrontendEditorHooks;
use MobileFrontendHooks;
use Xml;

/**
 * RL\FileModule subclass with JavaScript config necessary for MobileFrontend.
 */
class ResourceLoaderFileModuleWithMFConfig extends RL\FileModule {
	/** @inheritDoc */
	public function getScript( RL\Context $context ) {
		return Xml::encodeJsCall( 'mw.config.set', [ $this->getConfigData() ] )
			. parent::getScript( $context );
	}

	/**
	 * @return array
	 */
	private function getConfigData() {
		return MobileFrontendHooks::getResourceLoaderMFConfigVars() +
			MobileFrontendEditorHooks::getResourceLoaderMFConfigVars();
	}

	/** @inheritDoc */
	public function getDefinitionSummary( RL\Context $context ) {
		$summary = parent::getDefinitionSummary( $context );
		$summary[] = [
			'configData' => $this->getConfigData(),
		];
		return $summary;
	}

	/** @return bool */
	public function supportsURLLoading() {
		return false;
	}

}
