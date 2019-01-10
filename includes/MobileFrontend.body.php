<?php

use Wikibase\Client\WikibaseClient;
use Wikibase\DataModel\Entity\EntityDocument;
use Wikibase\DataModel\Entity\ItemId;
use MobileFrontend\ContentProviders\ContentProviderFactory;

/**
 * Implements additional functions to use in MobileFrontend
 */
class ExtMobileFrontend {
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
		$featureManager = \MediaWiki\MediaWikiServices::getInstance()
			->getService( 'MobileFrontend.FeaturesManager' );
		$context = MobileContext::singleton();
		$config = $context->getMFConfig();
		$provideTagline = $featureManager->isFeatureAvailableInContext(
			'MFEnableWikidataDescriptions', $context
		) && $context->shouldShowWikibaseDescriptions( 'tagline' );
		$factory = new ContentProviderFactory();
		$provider = $factory->getProvider( $config, $out, $text, $provideTagline );

		// If we're not running the formatter we can exit earlier
		if ( !$mobileFormatHtml ) {
			return $provider->getHTML();
		}

		$title = $out->getTitle();
		$ns = $title->getNamespace();

		$isSpecialPage = $title->isSpecialPage();
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

		$formatter = MobileFormatter::newFromContext( $context, $provider, $enableSections );

		Hooks::run( 'MobileFrontendBeforeDOM', [ $context, $formatter ] );

		$removeImages = $featureManager->isFeatureAvailableInContext( 'MFLazyLoadImages', $context );
		$removeReferences =
			$featureManager->isFeatureAvailableInContext( 'MFLazyLoadReferences', $context );
		$showFirstParagraphBeforeInfobox = $ns === NS_MAIN &&
			$featureManager->isFeatureAvailableInContext( 'MFShowFirstParagraphBeforeInfobox', $context );

		if ( $context->getContentTransformations() ) {
			// Remove images if they're disabled from special pages, but don't transform otherwise
			$formatter->filterContent( !$isSpecialPage,
				$removeReferences, $removeImages, $showFirstParagraphBeforeInfobox );
		}

		$contentHtml = $formatter->getText();

		// If the page is a user page which has not been created, then let the
		// user know about it with pretty graphics and different texts depending
		// on whether the user is the owner of the page or not.
		if ( $title->inNamespace( NS_USER ) && !$title->isSubpage() && $isView ) {
			$pageUserId = User::idFromName( $title->getText() );

			$out->addModuleStyles( [
				'mediawiki.ui.icon',
				'mobile.userpage.styles', 'mobile.userpage.icons'
			] );
			if ( $pageUserId && !$title->exists() ) {
				$pageUser = User::newFromId( $pageUserId );
				$contentHtml = self::getUserPageContent(
					$out, $pageUser, $title );
			}
		}

		return $contentHtml;
	}

	/**
	 * Generate user page content for non-existent user pages
	 *
	 * @param IContextSource $output
	 * @param User $pageUser owner of the user page
	 * @param Title $title
	 * @return string
	 */
	public static function getUserPageContent( IContextSource $output, User $pageUser, Title $title ) {
		$context = MobileContext::singleton();
		$pageUsername = $pageUser->getName();
		// Is the current user viewing their own page?
		$isCurrentUser = $output->getUser()->getName() === $pageUsername;

		$data = [
			'userIconClass' => MobileUI::iconClass( 'userpage', 'element', 'mw-ui-icon-large icon' ),
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

		$templateParser = new TemplateParser( __DIR__ );
		return $templateParser->processTemplate( 'user_page_cta', $data );
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
		global $wgContLang;

		$entity = self::getWikibaseEntity( $item );

		try {
			if ( !$entity ) {
				return null;
			} else {
				return $entity->getFingerprint()->getDescription( $wgContLang->getCode() )->getText();
			}
		} catch ( Exception $ex ) {
			return null;
		}
	}
}
