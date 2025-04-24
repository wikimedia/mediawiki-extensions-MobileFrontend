<?php

// phpcs:disable MediaWiki.NamingConventions.LowerCamelFunctionsName.FunctionName

namespace MobileFrontend\Hooks;

use MediaWiki\Context\IContextSource;
use MediaWiki\HookContainer\HookContainer;
use MediaWiki\Output\OutputPage;
use MediaWiki\Skin\Skin;
use MobileContext;
use MobileFormatter;
use MobileFrontend\ContentProviders\IContentProvider;
use MobileFrontend\Features\FeaturesManager;

/**
 * This is a hook runner class, see docs/Hooks.md in core.
 * @internal
 */
class HookRunner implements
	MobileFrontendBeforeDOMHook,
	MobileFrontendContentProviderHook,
	MobileFrontendFeaturesRegistrationHook,
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
