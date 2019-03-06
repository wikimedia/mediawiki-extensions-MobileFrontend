<?php

use MediaWiki\MediaWikiServices;
use MobileFrontend\Features\FeaturesManager;
use MobileFrontend\Features\Feature;

return [
	'MobileFrontend.Config' => function ( MediaWikiServices $services ) {
		return $services->getService( 'ConfigFactory' )
			->makeConfig( 'mobilefrontend' );
	},
	'MobileFrontend.UserModes' => function ( MediaWikiServices $services ) {
		$modes = new \MobileFrontend\Features\UserModes();
		$modes->registerMode( new \MobileFrontend\Features\StableUserMode( MobileContext::singleton() ) );
		$modes->registerMode( new \MobileFrontend\Features\BetaUserMode( MobileContext::singleton() ) );
		$modes->registerMode( $services->getService( 'MobileFrontend.AMC.UserMode' ) );
		return $modes;
	},
	'MobileFrontend.FeaturesManager' => function ( MediaWikiServices $services ) {
		$config = $services->getService( 'MobileFrontend.Config' );
		$userModes = $services->getService( 'MobileFrontend.UserModes' );

		$manager = new FeaturesManager( $userModes );
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
		$manager->registerFeature( new Feature( 'MFEnableFontChanger', 'mobile-frontend',
			$config->get( 'MFEnableFontChanger' ) ) );

		return $manager;
	},
	'MobileFrontend.AMC.Manager' => function ( MediaWikiServices $services ) {
		$config = $services->getService( 'MobileFrontend.Config' );
		$context = MobileContext::singleton();
		return new MobileFrontend\AMC\Manager( $config, $context, $context->shouldDisplayMobileView() );
	},
	'MobileFrontend.AMC.UserMode' => function ( MediaWikiServices $services ) {
		return new MobileFrontend\AMC\UserMode(
			$services->getService( 'MobileFrontend.AMC.Manager' ),
			MobileContext::singleton()->getUser()
		);
	},
	'MobileFrontend.Context' => function ( MediaWikiServices $services ) {
		return MobileContext::singleton();
	}
];
