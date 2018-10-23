<?php

namespace MobileFrontend\ContentProviders;

use Config;
use OutputPage;
use RuntimeException;

class ContentProviderFactory {
	const MW_API = MwApiContentProvider::class;
	const PHP_PARSER = DefaultContentProvider::class;
	const MCS_API = McsContentProvider::class;

	/**
	 * @param string $html Already generated HTML
	 * @return IContentProvider
	 * @suppress SecurityCheck-XSS OutputPage::getHtml is a hack, but safe html
	 */
	protected static function getDefaultParser( $html ) {
		$parser = self::PHP_PARSER;
		return new $parser( $html );
	}

	/**
	 * @param Config $config to allow config specific behaviour
	 * @param OutputPage $out to allow the addition of modules and styles
	 *  as required by the content
	 * @param string $html available HTML
	 * @throws RuntimeException Thrown when specified ContentProvider doesn't exist
	 * @return IContentProvider
	 * @suppress SecurityCheck-XSS OutputPage::getHtml is a hack, but safe html
	 */
	public static function getProvider( Config $config, OutputPage $out, $html ) {
		$contentProviderClass = $config->get( 'MFContentProviderClass' );

		if ( !class_exists( $contentProviderClass ) ) {
			throw new RuntimeException(
				"Provider `$contentProviderClass` specified in MFContentProviderClass does not exist." );
		}
		$preserveLocalContent = $config->get( 'MFContentProviderTryLocalContentFirst' );
		$title = $out->getTitle();
		if ( $preserveLocalContent && $title && $title->exists() ) {
			return self::getDefaultParser( $html );
		}

		switch ( $contentProviderClass ) {
			case self::MCS_API:
				$baseUrl = $config->get( 'MFMcsContentProviderBaseUri' );
				return new $contentProviderClass( $baseUrl, $out );
			case self::MW_API:
				$skinName = $out->getSkin()->getSkinName();
				$baseUrl = $config->get( 'MFMwApiContentProviderBaseUri' );
				return new $contentProviderClass( $baseUrl, $out, $skinName );
			case self::PHP_PARSER:
				return self::getDefaultParser( $html );
			default:
				throw new RuntimeException(
					"Unknown provider `$contentProviderClass` specified in MFContentProviderClass" );
		}
	}
}
