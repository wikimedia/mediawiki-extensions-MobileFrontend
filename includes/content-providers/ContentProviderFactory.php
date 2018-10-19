<?php

namespace MobileFrontend\ContentProviders;

use Config;
use OutputPage;

class ContentProviderFactory {
	const MW_API = 'MobileFrontend\\ContentProviders\\MwApiContentProvider';
	const PHP_PARSER = 'MobileFrontend\\ContentProviders\\DefaultContentProvider';
	const MCS_API = 'MobileFrontend\\ContentProviders\\McsContentProvider';

	/**
	 * @param OutputPage $out to allow the addition of modules and styles
	 *  as required by the content
	 * @param string $html (optional) available HTML that can be used by provider
	 *  if necessary. This may be useful if the ContentProvider acce
	 * @return IContentProvider
	 * @suppress SecurityCheck-XSS OutputPage::getHtml is a hack, but safe html
	 */
	protected static function getDefaultParser( OutputPage $out, $html = '' ) {
		$parser = self::PHP_PARSER;
		return new $parser( $html ? $html : $out->getHTML() );
	}
	/**
	 * @param Config $config to allow config specific behaviour
	 * @param OutputPage $out to allow the addition of modules and styles
	 *  as required by the content
	 * @param string $html (optional) available HTML that can be used by provider
	 *  if necessary. This may be useful if the ContentProvider acce
	 * @return IContentProvider
	 * @suppress SecurityCheck-XSS OutputPage::getHtml is a hack, but safe html
	 */
	public static function getProvider( Config $config, OutputPage $out, $html = '' ) {
		$contentProviderClass = $config->get( 'MFContentProviderClass' );

		if ( !class_exists( $contentProviderClass ) ) {
			throw new \RuntimeException(
				"Provider `$contentProviderClass` specified in MFContentProviderClass does not exist." );
		}
		$preserveLocalContent = $config->get( 'MFContentProviderTryLocalContentFirst' );
		$title = $out->getTitle();
		if ( $preserveLocalContent && $title && $title->exists() ) {
			return self::getDefaultParser( $out, $html );
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
				return self::getDefaultParser( $out, $html );
			default:
				throw new \RuntimeException(
					"Unknown provider `$contentProviderClass` specified in MFContentProviderClass" );
		}
	}
}
