<?php

namespace MobileFrontend\ContentProviders;

use GlobalVarConfig;
use OutputPage;

class ContentProviderFactory {
	const MW_API = 'MobileFrontend\\ContentProviders\\MwApiContentProvider';
	const PHP_PARSER = 'MobileFrontend\\ContentProviders\\DefaultContentProvider';

	/**
	 * Create an instance of IContentProvider
	 *
	 * @param GlobalVarConfig $config to allow config specific behaviour
	 * @param OutputPage $out to allow the addition of modules and styles
	 *  as required by the content
	 * @param string $html (optional) available HTML that can be used by provider
	 *  if necessary. This may be useful if the ContentProvider acce
	 * @return IContentProvider
	 */
	public static function getProvider( GlobalVarConfig $config, OutputPage $out, $html = '' ) {
		$contentProviderClass = $config->get( 'MFContentProviderClass' );

		if ( !class_exists( $contentProviderClass ) ) {
			throw new \RuntimeException(
				"Provider `$contentProviderClass` specified in MFContentProviderClass does not exist." );
		}

		switch ( $contentProviderClass ) {
			case self::MW_API:
				$baseUrl = $config->get( 'MFMwApiContentProviderBaseUri' );
				return new $contentProviderClass( $baseUrl, $out );
			case self::PHP_PARSER:
				return new $contentProviderClass( $html ? $html : $out->getHTML() );
			default:
				throw new \RuntimeException(
					"Unknown provider `$contentProviderClass` specified in MFContentProviderClass" );
		}
	}
}
