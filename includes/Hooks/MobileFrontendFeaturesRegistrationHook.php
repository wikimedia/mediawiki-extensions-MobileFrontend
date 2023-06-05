<?php

namespace MobileFrontend\Hooks;

use MobileFrontend\Features\FeaturesManager;

/**
 * This is a hook handler interface, see docs/Hooks.md in core.
 * Use the hook name "MobileFrontendFeaturesRegistration" to register handlers implementing this interface.
 *
 * @stable to implement
 * @ingroup Hooks
 */
interface MobileFrontendFeaturesRegistrationHook {
	/**
	 * @param FeaturesManager $featuresManager
	 * @return bool|void True or no return value to continue or false to abort
	 */
	public function onMobileFrontendFeaturesRegistration( FeaturesManager $featuresManager );
}
