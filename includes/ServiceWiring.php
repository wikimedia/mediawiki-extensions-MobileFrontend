<?php

use MediaWiki\MediaWikiServices;
use MobileFrontend\Features\BetaUserMode;
use MobileFrontend\Features\Feature;
use MobileFrontend\Features\FeaturesManager;
use MobileFrontend\Features\StableUserMode;
use MobileFrontend\Features\UserModes;

return [
	'MobileFrontend.Config' => function ( MediaWikiServices $services ) {
		return $services->getService( 'ConfigFactory' )
			->makeConfig( 'mobilefrontend' );
	},
	'MobileFrontend.UserModes' => function ( MediaWikiServices $services ) {
		$modes = new UserModes();
		$context = $services->getService( 'MobileFrontend.Context' );
		$modes->registerMode( new StableUserMode( $context ) );
		$modes->registerMode( new BetaUserMode( $context ) );
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
		$manager->registerFeature( new Feature( 'MFLazyLoadImages', 'mobile-frontend',
			$config->get( 'MFLazyLoadImages' ) ) );
		$manager->registerFeature( new Feature( 'MFShowFirstParagraphBeforeInfobox', 'mobile-frontend',
			$config->get( 'MFShowFirstParagraphBeforeInfobox' ) ) );
		$manager->registerFeature( new Feature( 'MFEnableFontChanger', 'mobile-frontend',
			$config->get( 'MFEnableFontChanger' ) ) );
		$manager->registerFeature( new Feature( 'MFUseDesktopSpecialHistoryPage', 'mobile-frontend',
			$config->get( 'MFUseDesktopSpecialHistoryPage' ) ) );

		return $manager;
	},
	'MobileFrontend.AMC.Manager' => function ( MediaWikiServices $services ) {
		$config = $services->getService( 'MobileFrontend.Config' );
		$context = $services->getService( 'MobileFrontend.Context' );
		return new MobileFrontend\AMC\Manager( $config, $context );
	},
	'MobileFrontend.AMC.UserMode' => function ( MediaWikiServices $services ) {
		$context = $services->getService( 'MobileFrontend.Context' );
		return new MobileFrontend\AMC\UserMode(
			$services->getService( 'MobileFrontend.AMC.Manager' ),
			$services->getService( 'MobileFrontend.Context' )->getUser(),
			$context->shouldDisplayMobileView()
		);
	},
	'MobileFrontend.Context' => function () {
		return MobileContext::singleton();
	}
];