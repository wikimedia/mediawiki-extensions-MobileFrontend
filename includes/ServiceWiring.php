<?php

use MediaWiki\MediaWikiServices;

return [
	'MobileFrontend.Config' => function ( MediaWikiServices $services ) {
		return $services->getService( 'ConfigFactory' )
			->makeConfig( 'mobilefrontend' );
	},
	'MobileFrontend.MobileContext' => function ( MediaWikiServices $services ) {
		$config = $services->getService( 'MobileFrontend.Config' );

		return new MobileContext( RequestContext::getMain(), $config );
	}
];
