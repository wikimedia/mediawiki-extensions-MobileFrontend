<?php

use MediaWiki\Config\Config;
use MediaWiki\MediaWikiServices;
use MobileFrontend\Features\BetaUserMode;
use MobileFrontend\Features\Feature;
use MobileFrontend\Features\FeaturesManager;
use MobileFrontend\Features\LoggedInUserMode;
use MobileFrontend\Features\StableUserMode;
use MobileFrontend\Features\UserModes;

return [
	'MobileFrontend.Config' => static function ( MediaWikiServices $services ): Config {
		return $services->getService( 'ConfigFactory' )
			->makeConfig( 'mobilefrontend' );
	},

	'MobileFrontend.UserModes' => static function ( MediaWikiServices $services ): UserModes {
		$modes = new UserModes();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$modes->registerMode( new StableUserMode( $context ) );
		$modes->registerMode( new BetaUserMode( $context ) );
		$modes->registerMode( new LoggedInUserMode( $context->getUser() ) );
		$modes->registerMode( $services->getService( 'MobileFrontend.AMC.UserMode' ) );
		return $modes;
	},
	'MobileFrontend.FeaturesManager' => static function ( MediaWikiServices $services ): FeaturesManager {
		$config = $services->getService( 'MobileFrontend.Config' );
		$userModes = $services->getService( 'MobileFrontend.UserModes' );

		$manager = new FeaturesManager( $userModes );
		// register default features
		// maybe we can get all available features by looping through MobileFrontend.Feature.*
		// and register it here, it would be nice to have something like
		// $services->getAllByPrefix('MobileFrontend.Feature')

		// Generates the following messages:
		// * mobile-frontend-mobile-option-MFEnableWikidataDescriptions
		// * mobile-frontend-mobile-option-MFEnableWikidataDescriptions-description
		$manager->registerFeature( new Feature( 'MFEnableWikidataDescriptions', 'mobile-frontend',
			$config->get( 'MFEnableWikidataDescriptions' ) ) );
		// Generates the following messages:
		// * mobile-frontend-mobile-option-MFLazyLoadImages
		// * mobile-frontend-mobile-option-MFLazyLoadImages-description
		$manager->registerFeature( new Feature( 'MFLazyLoadImages', 'mobile-frontend',
			$config->get( 'MFLazyLoadImages' ) ) );
		// Generates the following messages:
		// * mobile-frontend-mobile-option-MFShowFirstParagraphBeforeInfobox
		// * mobile-frontend-mobile-option-MFShowFirstParagraphBeforeInfobox-description
		$manager->registerFeature( new Feature( 'MFShowFirstParagraphBeforeInfobox', 'mobile-frontend',
			$config->get( 'MFShowFirstParagraphBeforeInfobox' ) ) );
		// Generates the following messages:
		// * mobile-frontend-mobile-option-MFEnableFontChanger
		// * mobile-frontend-mobile-option-MFEnableFontChanger-description
		$manager->registerFeature( new Feature( 'MFEnableFontChanger', 'mobile-frontend',
			$config->get( 'MFEnableFontChanger' ) ) );
		// Generates the following messages:
		// * mobile-frontend-mobile-option-MFUseDesktopSpecialWatchlistPage
		// * mobile-frontend-mobile-option-MFUseDesktopSpecialWatchlistPage-description
		$manager->registerFeature( new Feature( 'MFUseDesktopSpecialWatchlistPage', 'mobile-frontend',
			$config->get( 'MFUseDesktopSpecialWatchlistPage' ) ) );
		$manager->useHookToRegisterExtensionOrSkinFeatures();
		return $manager;
	},
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
	'MobileFrontend.AMC.Outreach' => static function ( MediaWikiServices $services ): MobileFrontend\Amc\Outreach {
		return new MobileFrontend\Amc\Outreach(
			$services->getService( 'MobileFrontend.AMC.UserMode' ),
			$services->getService( 'MobileFrontend.AMC.Manager' ),
			$services->getService( 'MobileFrontend.Context' )->getUser(),
			$services->getService( 'MobileFrontend.Config' )
		);
	},
	'MobileFrontend.Context' => static function (): MobileContext {
		return MobileContext::singleton();
	}
];
