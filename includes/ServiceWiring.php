<?php

use MediaWiki\MediaWikiServices;

return [
	'MobileFrontend.Config' => function ( MediaWikiServices $services ) {
		return $services->getService( 'ConfigFactory' )
			->makeConfig( 'mobilefrontend' );
	}
];
