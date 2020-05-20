<?php

use MediaWiki\MediaWikiServices;
use MobileFrontend\ContentProviders\ContentProviderFactory;
use Wikibase\Client\WikibaseClient;
use Wikibase\DataModel\Entity\EntityDocument;
use Wikibase\DataModel\Entity\ItemId;
use Wikibase\DataModel\Term\FingerprintProvider;
use Wikimedia\IPUtils;

/**
 * Implements additional functions to use in MobileFrontend
 */
class ExtMobileFrontend {
	/**
	 * Provide alternative HTML for a user page which has not been created.
	 * Let the user know about it with pretty graphics and different texts depending
	 * on whether the user is the owner of the page or not.
	 * @param OutputPage $out
	 * @param Title $title
	 * @return string that is empty if the transform does not apply.
	 */
	public static function blankUserPageHTML( OutputPage $out, Title $title ) {
		$pageUser = self::buildPageUserObject( $title );

		$out->addModuleStyles( [
			'mediawiki.ui.icon',
			'mobile.userpage.styles', 'mobile.userpage.images'
		] );

		if ( $pageUser && !$title->exists() ) {
			return self::getUserPageContent(
				$out, $pageUser, $title );
		} else {
			return '';
		}
	}

	/**
	 * Transforms content to be mobile friendly version.
	 * Filters out various elements and runs the MobileFormatter.
	 * @param OutputPage $out
	 * @param string|null $text override out html
	 * @param bool $mobileFormatHtml whether content should be run through the MobileFormatter
	 *
	 * @return string
	 */
	public static function domParse( OutputPage $out, $text = null, $mobileFormatHtml = true ) {
		$services = MediaWikiServices::getInstance();
		$featureManager = $services->getService( 'MobileFrontend.FeaturesManager' );
		/** @var ContentProviderFactory $contentProviderFactory */
		$contentProviderFactory = $services->getService( 'MobileFrontend.ContentProviderFactory' );
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$config = $services->getService( 'MobileFrontend.Config' );
		$provideTagline = $featureManager->isFeatureAvailableForCurrentUser(
			'MFEnableWikidataDescriptions'
		) && $context->shouldShowWikibaseDescriptions( 'tagline', $config );
		$provider = $contentProviderFactory->getProvider( $out, $text, $provideTagline );

		// If we're not running the formatter we can exit earlier
		if ( !$mobileFormatHtml ) {
			return $provider->getHTML();
		}

		$title = $out->getTitle();
		$ns = $title->getNamespace();
		$isView = $context->getRequest()->getText( 'action', 'view' ) == 'view';

		$enableSections = (
			// Don't collapse sections e.g. on JS pages
			$out->canUseWikiPage()
			&& $out->getWikiPage()->getContentModel() == CONTENT_MODEL_WIKITEXT
			// And not in certain namespaces
			&& array_search(
				$ns,
				$config->get( 'MFNamespacesWithoutCollapsibleSections' )
			) === false
			// And not when what's shown is not actually article text
			&& $isView
		);

		$html = $provider->getHTML();
		// https://phabricator.wikimedia.org/T232690
		if ( !MobileFormatter::canApply( $html, $config->get( 'MFMobileFormatterOptions' ) ) ) {
			// In future we might want to prepend a message feeding
			// back to the user that the page is not mobile friendly.
			return $html;
		}

		$formatter = MobileFormatter::newFromContext( $context, $provider, $enableSections, $config );

		$hookContainer = $services->getHookContainer();
		$hookContainer->run( 'MobileFrontendBeforeDOM', [ $context, $formatter ] );

		if ( $context->getContentTransformations() ) {
			$isSpecialPage = $title->isSpecialPage();
			$removeImages = $featureManager->isFeatureAvailableForCurrentUser( 'MFLazyLoadImages' );
			$leadParagraphEnabled = in_array( $ns, $config->get( 'MFNamespacesWithLeadParagraphs' ) );
			$showFirstParagraphBeforeInfobox = $leadParagraphEnabled &&
				$featureManager->isFeatureAvailableForCurrentUser( 'MFShowFirstParagraphBeforeInfobox' );

			// Remove images if they're disabled from special pages, but don't transform otherwise
			$formatter->filterContent( !$isSpecialPage,
				null,
				$removeImages, $showFirstParagraphBeforeInfobox );
		}

		return $formatter->getText();
	}

	/**
	 * Return new User object based on username or IP address.
	 * @param Title $title
	 * @return User|null
	 */
	private static function buildPageUserObject( Title $title ) {
		$titleText = $title->getText();

		$usernameUtils = MediaWikiServices::getInstance()->getUserNameUtils();
		if ( $usernameUtils->isIP( $titleText ) || IPUtils::isIPv6( $titleText ) ) {
			return User::newFromAnyId( null, $titleText, null );
		}

		$pageUserId = User::idFromName( $titleText );
		if ( $pageUserId ) {
			return User::newFromId( $pageUserId );
		}

		return null;
	}

	/**
	 * Generate user page content for non-existent user pages
	 *
	 * @param IContextSource $output
	 * @param User $pageUser owner of the user page
	 * @param Title $title
	 * @return string
	 */
	protected static function getUserPageContent( IContextSource $output,
		User $pageUser, Title $title
	) {
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$pageUsername = $pageUser->getName();
		// Is the current user viewing their own page?
		$isCurrentUser = $output->getUser()->getName() === $pageUsername;

		$data = [
			'userImageClass' => 'userpage-image-placeholder',
		];
		$data['ctaHeading'] = $isCurrentUser ?
			$context->msg( 'mobile-frontend-user-page-no-owner-page-yet' )->text() :
			$context->msg( 'mobile-frontend-user-page-no-page-yet', $pageUsername )->parse();
		$data['ctaDescription'] = $isCurrentUser ?
			$context->msg(
				'mobile-frontend-user-page-describe-yourself',
				$context->msg( 'mobile-frontend-user-page-describe-yourself-editors' )->text()
			)->text() :
			$context->msg( 'mobile-frontend-user-page-desired-action', $pageUsername )->parse();
		$data['createPageLinkLabel'] = $isCurrentUser ?
			$context->msg( 'mobile-frontend-user-page-create-owner-page-link-label' )->text() :
			$context->msg(
				'mobile-frontend-user-page-create-user-page-link-label',
				$pageUser->getUserPage()->getBaseTitle()
			)->parse();
		// Mobile editor has trouble when section is not specified.
		// It doesn't matter here since the page doesn't exist.
		$data['editUrl'] = $title->getLinkURL( [ 'action' => 'edit', 'section' => 0 ] );
		$data['editSection'] = 0;
		$data['createPageLinkAdditionalClasses'] = $isCurrentUser ? 'mw-ui-button' : '';

		$templateParser = new TemplateParser( __DIR__ . '/templates' );
		return $templateParser->processTemplate( 'UserPageCta', $data );
	}

	/**
	 * Returns the Wikibase entity associated with a page or null if none exists.
	 *
	 * @param string $item Wikibase id of the page
	 * @return EntityDocument|null
	 */
	public static function getWikibaseEntity( $item ) {
		if ( !class_exists( WikibaseClient::class ) ) {
			return null;
		}

		try {
			$entityLookup = WikibaseClient::getDefaultInstance()
				->getStore()
				->getEntityLookup();
			$entity = $entityLookup->getEntity( new ItemId( $item ) );
			if ( !$entity ) {
				return null;
			} else {
				return $entity;
			}
		} catch ( Exception $ex ) {
			// Do nothing, exception mostly due to description being unavailable in needed language
			return null;
		}
	}

	/**
	 * Returns a short description of a page from Wikidata
	 *
	 * @param string $item Wikibase id of the page
	 * @return string|null
	 */
	public static function getWikibaseDescription( $item ) {
		$contLang = MediaWikiServices::getInstance()->getContentLanguage();

		$entity = self::getWikibaseEntity( $item );

		try {
			if ( !$entity || !$entity instanceof FingerprintProvider ) {
				return null;
			} else {
				return $entity->getFingerprint()->getDescription( $contLang->getCode() )->getText();
			}
		} catch ( Exception $ex ) {
			return null;
		}
	}
}
