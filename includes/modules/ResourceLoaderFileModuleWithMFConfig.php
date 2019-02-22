<?php

namespace MobileFrontend\ResourceLoaderModules;

use ResourceLoaderFileModule;
use ResourceLoaderContext;
use Xml;
use MobileFrontendHooks;

/**
 * ResourceLoaderFileModule subclass with JavaScript config necessary for MobileFrontend.
 */
class ResourceLoaderFileModuleWithMFConfig extends ResourceLoaderFileModule {
	/** @inheritDoc */
	public function getScript( ResourceLoaderContext $context ) {
		$config = MobileFrontendHooks::getResourceLoaderMFConfigVars();
		return Xml::encodeJsCall( 'mw.config.set', [ $config ] )
			. parent::getScript( $context );
	}

	/** @return bool */
	public function enableModuleContentVersion() {
		return true;
	}

	/** @return bool */
	public function supportsURLLoading() {
		return false;
	}
}
