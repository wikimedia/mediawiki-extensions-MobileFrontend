<?php

namespace MobileFrontend\ResourceLoaderModules;

use MobileFrontendEditorHooks;
use MobileFrontendHooks;
use ResourceLoaderContext;
use ResourceLoaderFileModule;
use Xml;

/**
 * ResourceLoaderFileModule subclass with JavaScript config necessary for MobileFrontend.
 */
class ResourceLoaderFileModuleWithMFConfig extends ResourceLoaderFileModule {
	/** @inheritDoc */
	public function getScript( ResourceLoaderContext $context ) {
		// @phan-suppress-next-line SecurityCheck-DoubleEscaped This currently works 🤷🏽‍♂️
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
	public function getDefinitionSummary( ResourceLoaderContext $context ) {
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
