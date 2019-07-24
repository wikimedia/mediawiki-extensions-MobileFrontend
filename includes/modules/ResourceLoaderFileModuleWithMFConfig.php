<?php

namespace MobileFrontend\ResourceLoaderModules;

use ResourceLoaderFileModule;
use ResourceLoaderContext;
use Xml;
use MobileFrontendHooks;
use MobileFrontendEditorHooks;

/**
 * ResourceLoaderFileModule subclass with JavaScript config necessary for MobileFrontend.
 */
class ResourceLoaderFileModuleWithMFConfig extends ResourceLoaderFileModule {
	/** @inheritDoc */
	public function getScript( ResourceLoaderContext $context ) {
		return Xml::encodeJsCall( 'mw.config.set', [ $this->getConfigData() ] )
			. parent::getScript( $context );
	}

	private function getConfigData() {
		return MobileFrontendHooks::getResourceLoaderMFConfigVars() +
			MobileFrontendEditorHooks::getResourceLoaderMFConfigVars();
	}

	/** @inheritDoc */
	public function getDefinitionSummary( ResourceLoaderContext $context ) {
		$summary = parent::getDefinitionSummary( $context );
		$summary['configData'] = $this->getConfigData();
		return $summary;
	}

	/** @return bool */
	public function supportsURLLoading() {
		return false;
	}

}
