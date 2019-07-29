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
		return new DefaultContentProvider( $html );
	}

	/**
	 * Turn on foreign api script path for page
	 * @param Config $config to allow config specific behaviour
	 * @param OutputPage $out to allow the addition of modules and styles
	 *  as required by the content
	 */
	public static function addForeignScriptPath( Config $config, OutputPage $out ) {
		$contentProviderApi = $config->get( 'MFContentProviderScriptPath' );
		if ( $contentProviderApi ) {
			// It's very possible this might break compatibility with other extensions
			// so this should not be used outside development :). Please see README.md
			$out->addJsConfigVars( [ 'wgScriptPath' => $contentProviderApi ] );
			// This injects a global ajaxSend event which ensures origin=* is added to all ajax requests
			// This helps with compatibility of VisualEditor!
			// This is intentionally simplistic as all queries we care about
			// are guaranteed to already have a query string
			$out->addModules( 'mobile.contentProviderApi' );
		}
	}
	/**
	 * @param Config $config to allow config specific behaviour
	 * @param OutputPage $out to allow the addition of modules and styles
	 *  as required by the content
	 * @param string $html available HTML
	 * @param bool $provideTagline (optional) whether wikidata descriptions
	 *  should be provided for if the provider supports it.
	 * @throws RuntimeException Thrown when specified ContentProvider doesn't exist
	 * @return IContentProvider
	 * @suppress SecurityCheck-XSS OutputPage::getHtml is a hack, but safe html
	 */
	public static function getProvider( Config $config, OutputPage $out, $html,
		$provideTagline = false
	) {
		$contentProviderClass = $config->get( 'MFContentProviderClass' );

		if ( !class_exists( $contentProviderClass ) ) {
			throw new RuntimeException(
				"Provider `$contentProviderClass` specified in MFContentProviderClass does not exist." );
		}
		$preserveLocalContent = $config->get( 'MFContentProviderTryLocalContentFirst' );
		$title = $out->getTitle();
		// On local content display the content provider script path so that edit works as expected
		// at the cost of searching local content.
		if ( $preserveLocalContent && $title && $title->exists() ) {
			return self::getDefaultParser( $html );
		}

		self::addForeignScriptPath( $config, $out );

		switch ( $contentProviderClass ) {
			case self::MCS_API:
				$baseUrl = $config->get( 'MFMcsContentProviderBaseUri' );
				return new McsContentProvider( $baseUrl, $out );
			case self::MW_API:
				$skinName = $out->getSkin()->getSkinName();
				$rev = $out->getRequest()->getIntOrNull( 'oldid' );
				$baseUrl = $config->get( 'MFMwApiContentProviderBaseUri' );
				return new MwApiContentProvider( $baseUrl, $out, $skinName, $rev, $provideTagline );
			case self::PHP_PARSER:
				return self::getDefaultParser( $html );
			default:
				throw new RuntimeException(
					"Unknown provider `$contentProviderClass` specified in MFContentProviderClass" );
		}
	}
}