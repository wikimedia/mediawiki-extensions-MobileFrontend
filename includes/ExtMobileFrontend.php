<?php

use MediaWiki\Context\IContextSource;
use MediaWiki\Html\TemplateParser;
use MediaWiki\MediaWikiServices;
use MediaWiki\Output\OutputPage;
use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\Title\Title;
use MediaWiki\User\User;
use MobileFrontend\Api\ApiParseExtender;
use MobileFrontend\ContentProviders\IContentProvider;
use MobileFrontend\Features\FeaturesManager;
use MobileFrontend\Hooks\HookRunner;
use MobileFrontend\Transforms\LazyImageTransform;
use MobileFrontend\Transforms\MakeSectionsTransform;
use MobileFrontend\Transforms\MoveLeadParagraphTransform;
use MobileFrontend\Transforms\NativeLazyImageTransform;
use MobileFrontend\Transforms\RemovableClassesTransform;
use Wikibase\Client\WikibaseClient;
use Wikibase\DataModel\Entity\ItemId;
use Wikibase\DataModel\Services\Lookup\TermLookupException;
use Wikimedia\IPUtils;

/**
 * Implements additional functions to use in MobileFrontend
 */
class ExtMobileFrontend {
	/**
	 * Provide alternative HTML for a user page which has not been created.
	 * Let the user know about it with pretty graphics and different texts depending
	 * on whether the user is the owner of the page or not.
	 * @internal Only for use inside MobileFrontend.
	 * @param OutputPage $out
	 * @param Title $title
	 * @return string that is empty if the transform does not apply.
	 */
	public static function blankUserPageHTML( OutputPage $out, Title $title ): string {
		$pageUser = self::buildPageUserObject( $title );
		$isHidden = $pageUser && $pageUser->isHidden();
		$canViewHidden = !$isHidden || $out->getAuthority()->isAllowed( 'hideuser' );

		$out->addModuleStyles( [
			'mobile.userpage.styles', 'mobile.userpage.images'
		] );

		if ( $pageUser && !$title->exists() && $canViewHidden ) {
			return self::getUserPageContent(
				$out, $pageUser, $title );
		} else {
			return '';
		}
	}

	/**
	 * Obtains content using the given content provider and routes it to the mobile formatter
	 * if required.
	 *
	 * @param IContentProvider $provider
	 * @param OutputPage $out
	 * @param bool $mobileFormatHtml whether content should be run through the MobileFormatter
	 *
	 * @return string
	 */
	public static function domParseWithContentProvider(
		IContentProvider $provider,
		OutputPage $out,
		$mobileFormatHtml = true
	): string {
		$html = $provider->getHTML();

		// If we're not running the formatter we can exit earlier
		if ( !$mobileFormatHtml ) {
			return $html;
		} else {
			return self::domParseMobile( $out, $html );
		}
	}

	/**
	 * Transforms content to be mobile friendly version.
	 * Filters out various elements and runs the MobileFormatter.
	 *
	 * @param IContextSource $out
	 * @param string $html to render.
	 *
	 * @return string
	 */
	public static function domParseMobile( IContextSource $out, $html = '' ): string {
		$services = MediaWikiServices::getInstance();
		/** @var FeaturesManager $featuresManager */
		$featuresManager = $services->getService( 'MobileFrontend.FeaturesManager' );
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$config = $services->getService( 'MobileFrontend.Config' );

		$title = $out->getTitle();
		$ns = $title->getNamespace();
		$action = $context->getRequest()->getText( 'action', 'view' );
		$isView = $action === 'view' || ApiParseExtender::isParseAction( $action );

		$shouldUseParsoid = false;
		if ( ExtensionRegistry::getInstance()->isLoaded( 'ParserMigration' ) ) {
			$oracle = MediaWikiServices::getInstance()->getService( 'ParserMigration.Oracle' );
			$shouldUseParsoid =
				$oracle->shouldUseParsoid( $context->getUser(), $context->getRequest(), $title );
		}

		$enableSections = (
			// Don't collapse sections e.g. on JS pages
			$title->canExist()
			&& $title->getContentModel() == CONTENT_MODEL_WIKITEXT
			// And not in certain namespaces
			&& !in_array( $ns, $config->get( 'MFNamespacesWithoutCollapsibleSections' ) )
			// And not when what's shown is not actually article text
			&& $isView
			&& !$shouldUseParsoid
		);

		$formatter = new MobileFormatter( $html );

		// https://phabricator.wikimedia.org/T232690
		if ( !$formatter->canApply( $config->get( 'MFMobileFormatterOptions' ) ) ) {
			// In the future, we might want to prepend a message feeding
			// back to the user that the page is not mobile friendly.
			return $html;
		}

		$hookRunner = new HookRunner( $services->getHookContainer() );
		$hookRunner->onMobileFrontendBeforeDOM( $context, $formatter );

		$shouldLazyTransformImages = $featuresManager->isFeatureAvailableForCurrentUser( 'MFLazyLoadImages' );
		$leadParagraphEnabled = in_array( $ns, $config->get( 'MFNamespacesWithLeadParagraphs' ) );
		$showFirstParagraphBeforeInfobox = $leadParagraphEnabled &&
			$featuresManager->isFeatureAvailableForCurrentUser( 'MFShowFirstParagraphBeforeInfobox' );

		$transforms = [];
		// Remove specified content in content namespaces
		if ( in_array( $title->getNamespace(), $config->get( 'ContentNamespaces' ), true ) ) {
			$mfRemovableClasses = $config->get( 'MFRemovableClasses' );
			$removableClasses = $mfRemovableClasses['base'];

			$transforms[] = new RemovableClassesTransform( $removableClasses );
		}

		if ( $enableSections ) {
			$options = $config->get( 'MFMobileFormatterOptions' );
			$topHeadingTags = $options['headings'];

			$transforms[] = new MakeSectionsTransform(
				$topHeadingTags,
				true
			);
		}

		if ( $shouldLazyTransformImages ) {
			if ( $shouldUseParsoid ) {
				$transforms[] = new NativeLazyImageTransform();
			} else {
				$transforms[] = new LazyImageTransform( $config->get( 'MFLazyLoadSkipSmallImages' ) );
			}
		}

		if ( $showFirstParagraphBeforeInfobox ) {
			$transforms[] = new MoveLeadParagraphTransform( $title, $title->getLatestRevID() );
		}

		$start = microtime( true );
		$formatter->applyTransforms( $transforms );
		$end = microtime( true );
		$report = sprintf( "MobileFormatter took %.3f seconds", $end - $start );

		return $formatter->getHtml() . "\n<!-- $report -->";
	}

	/**
	 * Return new User object based on username or IP address.
	 * @param Title $title
	 * @return User|null
	 */
	private static function buildPageUserObject( Title $title ): ?User {
		$titleText = $title->getText();

		$usernameUtils = MediaWikiServices::getInstance()->getUserNameUtils();
		if ( $usernameUtils->isIP( $titleText ) || IPUtils::isIPv6( $titleText ) ) {
			return User::newFromAnyId( null, $titleText, null );
		}

		$user = User::newFromName( $titleText );
		if ( $user && $user->isRegistered() ) {
			return $user;
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
	): string {
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$pageUsername = $pageUser->getName();
		// Is the current user viewing their own page?
		$isCurrentUser = $output->getUser()->getName() === $pageUsername;

		$data = [
			'userImageClass' => 'userpage-image-placeholder',
		];
		$data['ctaHeading'] = $isCurrentUser ?
			$context->msg( 'mobile-frontend-user-page-no-owner-page-yet' )->text() :
			$context->msg( 'mobile-frontend-user-page-no-page-yet', $pageUsername )->text();
		$data['ctaDescription'] = $isCurrentUser ?
			$context->msg(
				'mobile-frontend-user-page-describe-yourself',
				$context->msg( 'mobile-frontend-user-page-describe-yourself-editors' )->text()
			)->text() :
			$context->msg( 'mobile-frontend-user-page-desired-action', $pageUsername )->text();
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
		$data['createPageLinkAdditionalClasses'] = $isCurrentUser ?
			'cdx-button cdx-button--action-progressive cdx-button--weight-primary' : '';

		$templateParser = new TemplateParser( __DIR__ . '/templates' );
		return $templateParser->processTemplate( 'UserPageCta', $data );
	}

	/**
	 * Returns a short description of a page from Wikidata
	 *
	 * @param string $item Wikibase id of the page
	 * @return string|null
	 */
	public static function getWikibaseDescription( $item ): ?string {
		if ( !ExtensionRegistry::getInstance()->isLoaded( 'WikibaseClient' ) ) {
			return null;
		}

		$contLang = MediaWikiServices::getInstance()->getContentLanguage();
		$termLookup = WikibaseClient::getTermLookup();
		try {
			$itemId = new ItemId( $item );
		} catch ( InvalidArgumentException ) {
			return null;
		}

		try {
			return $termLookup->getDescription( $itemId, $contLang->getCode() );
		} catch ( TermLookupException ) {
			return null;
		}
	}
}
