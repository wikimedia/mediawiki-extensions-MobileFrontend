<?php

use MediaWiki\Context\IContextSource;
use MediaWiki\Html\TemplateParser;
use MediaWiki\MediaWikiServices;
use MediaWiki\Output\OutputPage;
use MediaWiki\Title\Title;
use MediaWiki\User\User;
use MobileFrontend\Api\ApiParseExtender;
use MobileFrontend\ContentProviders\IContentProvider;
use MobileFrontend\Features\FeaturesManager;
use MobileFrontend\Hooks\HookRunner;
use MobileFrontend\Transforms\LazyImageTransform;
use MobileFrontend\Transforms\MakeSectionsTransform;
use MobileFrontend\Transforms\MoveLeadParagraphTransform;
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
	public static function blankUserPageHTML( OutputPage $out, Title $title ) {
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
	) {
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
	 * @param OutputPage $out
	 * @param string $html to render.
	 *
	 * @return string
	 */
	public static function domParseMobile( OutputPage $out, $html = '' ) {
		$services = MediaWikiServices::getInstance();
		/** @var FeaturesManager $featureManager */
		$featureManager = $services->getService( 'MobileFrontend.FeaturesManager' );
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$config = $services->getService( 'MobileFrontend.Config' );

		$title = $out->getTitle();
		$ns = $title->getNamespace();
		$action = $context->getRequest()->getText( 'action', 'view' );
		$isView = $action === 'view' || ApiParseExtender::isParseAction( $action );

		$enableSections = (
			// Don't collapse sections e.g. on JS pages
			$title->canExist()
			&& $title->getContentModel() == CONTENT_MODEL_WIKITEXT
			// And not in certain namespaces
			&& !in_array( $ns, $config->get( 'MFNamespacesWithoutCollapsibleSections' ) )
			// And not when what's shown is not actually article text
			&& $isView
		);

		// https://phabricator.wikimedia.org/T232690
		if ( !MobileFormatter::canApply( $html, $config->get( 'MFMobileFormatterOptions' ) ) ) {
			// In future we might want to prepend a message feeding
			// back to the user that the page is not mobile friendly.
			return $html;
		}

		$formatter = new MobileFormatter(
			MobileFormatter::wrapHtml( $html ),
			$title,
			$config,
			$context
		);

		$hookRunner = new HookRunner( $services->getHookContainer() );
		$hookRunner->onMobileFrontendBeforeDOM( $context, $formatter );

		$shouldLazyTransformImages = $featureManager->isFeatureAvailableForCurrentUser( 'MFLazyLoadImages' );
		$leadParagraphEnabled = in_array( $ns, $config->get( 'MFNamespacesWithLeadParagraphs' ) );
		$showFirstParagraphBeforeInfobox = $leadParagraphEnabled &&
			$featureManager->isFeatureAvailableForCurrentUser( 'MFShowFirstParagraphBeforeInfobox' );

		$transforms = [];
		if ( $enableSections ) {
			$options = $config->get( 'MFMobileFormatterOptions' );
			$topHeadingTags = $options['headings'];

			$transforms[] = new MakeSectionsTransform(
				$topHeadingTags,
				true
			);
		}

		if ( $shouldLazyTransformImages ) {
			$transforms[] = new LazyImageTransform( $config->get( 'MFLazyLoadSkipSmallImages' ) );
		}

		if ( $showFirstParagraphBeforeInfobox ) {
			$transforms[] = new MoveLeadParagraphTransform( $title, $title->getLatestRevID() );
		}

		$start = microtime( true );
		$formatter->applyTransforms( $transforms );
		$end = microtime( true );
		$report = sprintf( "MobileFormatter took %.3f seconds", $end - $start );

		return $formatter->getText() . "\n<!-- $report -->";
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
	) {
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
	public static function getWikibaseDescription( $item ) {
		if ( !ExtensionRegistry::getInstance()->isLoaded( 'WikibaseClient' ) ) {
			return null;
		}

		$contLang = MediaWikiServices::getInstance()->getContentLanguage();
		$termLookup = WikibaseClient::getTermLookup();
		try {
			$itemId = new ItemId( $item );
		} catch ( InvalidArgumentException $exception ) {
			return null;
		}

		try {
			return $termLookup->getDescription( $itemId, $contLang->getCode() );
		} catch ( TermLookupException $exception ) {
			return null;
		}
	}
}
