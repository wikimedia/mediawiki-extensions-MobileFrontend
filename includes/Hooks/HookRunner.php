<?php

// phpcs:disable MediaWiki.NamingConventions.LowerCamelFunctionsName.FunctionName

namespace MobileFrontend\Hooks;

use IContextSource;
use MediaWiki\HookContainer\HookContainer;
use MediaWiki\Output\OutputPage;
use MobileContext;
use MobileFormatter;
use MobileFrontend\ContentProviders\IContentProvider;
use MobileFrontend\Features\FeaturesManager;
use Skin;

/**
 * This is a hook runner class, see docs/Hooks.md in core.
 * @internal
 */
class HookRunner implements
	BeforePageDisplayMobileHook,
	GetMobileUrlHook,
	MobileFrontendBeforeDOMHook,
	MobileFrontendContentProviderHook,
	MobileFrontendFeaturesRegistrationHook,
	MobileSpecialPageStylesHook,
	RequestContextCreateSkinMobileHook,
	SpecialMobileEditWatchlistImagesHook
{
	private HookContainer $hookContainer;

	public function __construct( HookContainer $hookContainer ) {
		$this->hookContainer = $hookContainer;
	}

	/**
	 * @inheritDoc
	 */
	public function onBeforePageDisplayMobile( OutputPage &$out, Skin &$skin ) {
		return $this->hookContainer->run(
			'BeforePageDisplayMobile',
			[ &$out, &$skin ]
		);
	}

	/**
	 * @inheritDoc
	 */
	public function onGetMobileUrl( ?string &$subdomainTokenReplacement, MobileContext $context ) {
		return $this->hookContainer->run(
			'GetMobileUrl',
			[ &$subdomainTokenReplacement, $context ]
		);
	}

	/**
	 * @inheritDoc
	 */
	public function onMobileFrontendBeforeDOM( MobileContext $mobileContext, MobileFormatter $formatter ) {
		return $this->hookContainer->run(
			'MobileFrontendBeforeDOM',
			[ $mobileContext, $formatter ]
		);
	}

	/**
	 * @inheritDoc
	 */
	public function onMobileFrontendContentProvider( IContentProvider &$provider, OutputPage $out ) {
		return $this->hookContainer->run(
			'MobileFrontendContentProvider',
			[ &$provider, $out ]
		);
	}

	/**
	 * @inheritDoc
	 */
	public function onMobileFrontendFeaturesRegistration( FeaturesManager $featuresManager ) {
		return $this->hookContainer->run(
			'MobileFrontendFeaturesRegistration',
			[ $featuresManager ]
		);
	}

	/**
	 * @inheritDoc
	 */
	public function onMobileSpecialPageStyles( string $id, OutputPage $out ) {
		return $this->hookContainer->run(
			'MobileSpecialPageStyles',
			[ $id, $out ]
		);
	}

	/**
	 * @inheritDoc
	 */
	public function onRequestContextCreateSkinMobile( MobileContext $mobileContext, Skin $skin ) {
		return $this->hookContainer->run(
			'RequestContextCreateSkinMobile',
			[ $mobileContext, $skin ]
		);
	}

	/**
	 * @inheritDoc
	 */
	public function onSpecialMobileEditWatchlist__images( IContextSource $context, array &$watchlist, array &$images ) {
		return $this->hookContainer->run(
			'SpecialMobileEditWatchlist::images',
			[ $context, &$watchlist, &$images ]
		);
	}
}
