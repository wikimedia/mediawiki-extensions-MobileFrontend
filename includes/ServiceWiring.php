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
		$manager->registerFeature( new Feature( 'MFEnableWikidataDescriptions', 'mobile-frontend',
			$config->get( 'MFEnableWikidataDescriptions' ) ) );
		$manager->registerFeature( new Feature( 'MFLazyLoadReferences', 'mobile-frontend',
			$config->get( 'MFLazyLoadReferences' ) ) );
		$manager->registerFeature( new Feature( 'MFLazyLoadImages', 'mobile-frontend',
			$config->get( 'MFLazyLoadImages' ) ) );
		$manager->registerFeature( new Feature( 'MFShowFirstParagraphBeforeInfobox', 'mobile-frontend',
			$config->get( 'MFShowFirstParagraphBeforeInfobox' ) ) );
		$manager->registerFeature( new Feature( 'MFExpandAllSectionsUserOption', 'mobile-frontend',
			$config->get( 'MFExpandAllSectionsUserOption' ) ) );
		$manager->registerFeature( new Feature( 'MFEnableFontChanger', 'mobile-frontend',
			$config->get( 'MFEnableFontChanger' ) ) );

		return $manager;
	},
];
