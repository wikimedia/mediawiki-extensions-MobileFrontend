<?php

use MediaWiki\MediaWikiServices;
use MobileFrontend\Features\FeaturesManager;
use MobileFrontend\Features\Feature;

return [
	'MobileFrontend.Config' => function ( MediaWikiServices $services ) {
		return $services->getService( 'ConfigFactory' )
			->makeConfig( 'mobilefrontend' );
	},

	'MobileFrontend.FeaturesManager' => function ( MediaWikiServices $services ) {
		$config = $services->getService( 'MobileFrontend.Config' );

		$manager = new FeaturesManager();
		// register default features
		// maybe we can get all available features by looping through MobileFrontend.Feature.*
		// and register it here, it would be nice to have something like
		// $services->getAllByPrefix('MobileFrontend.Feature')
		$manager->registerFeature( new Feature( 'MFEnableWikidataDescriptions',
			$config->get( 'MFEnableWikidataDescriptions' ) ) );
		$manager->registerFeature( new Feature( 'MFLazyLoadReferences',
			$config->get( 'MFLazyLoadReferences' ) ) );

		return $manager;
	},
];
