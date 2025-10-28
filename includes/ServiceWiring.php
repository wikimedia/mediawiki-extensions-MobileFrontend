<?php

use MediaWiki\Config\Config;
use MediaWiki\MediaWikiServices;
use MobileFrontend\Features\Feature;
use MobileFrontend\Features\FeaturesManager;
use MobileFrontend\Features\LoggedInUserMode;
use MobileFrontend\Features\StableUserMode;
use MobileFrontend\Features\UserModes;

/** @phpcs-require-sorted-array */
return [
	'MobileFrontend.AMC.Manager' => static function ( MediaWikiServices $services ): MobileFrontend\Amc\Manager {
		return new MobileFrontend\Amc\Manager(
			$services->getService( 'MobileFrontend.Config' ),
			$services->getService( 'MobileFrontend.Context' )
		);
	},
	'MobileFrontend.AMC.UserMode' => static function ( MediaWikiServices $services ): MobileFrontend\Amc\UserMode {
		return new MobileFrontend\Amc\UserMode(
			$services->getService( 'MobileFrontend.AMC.Manager' ),
			$services->getService( 'MobileFrontend.Context' )->getUser(),
			$services->getUserOptionsManager()
		);
	},
	'MobileFrontend.Config' => static function ( MediaWikiServices $services ): Config {
		return $services->getService( 'ConfigFactory' )
			->makeConfig( 'mobilefrontend' );
	},
	'MobileFrontend.Context' => static function (): MobileContext {
		return MobileContext::singleton();
	},
	'MobileFrontend.FeaturesManager' => static function ( MediaWikiServices $services ): FeaturesManager {
		$config = $services->getService( 'MobileFrontend.Config' );

		$manager = new FeaturesManager(
			$services->getHookContainer(),
			$services->getService( 'MobileFrontend.UserModes' )
		);
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
		$manager->registerFeature( new Feature( 'MFUseDesktopSpecialEditWatchlistPage', 'mobile-frontend',
			$config->get( 'MFUseDesktopSpecialEditWatchlistPage' ) ) );
		$manager->useHookToRegisterExtensionOrSkinFeatures();
		return $manager;
	},
	'MobileFrontend.UserModes' => static function ( MediaWikiServices $services ): UserModes {
		$modes = new UserModes();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$modes->registerMode( new StableUserMode( $context ) );
		$modes->registerMode( new LoggedInUserMode( $context->getUser() ) );
		$modes->registerMode( $services->getService( 'MobileFrontend.AMC.UserMode' ) );
		return $modes;
	}
];
