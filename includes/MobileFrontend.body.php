<?php
/**
 * MobileFrontend.body.php
 */

use Wikibase\Client\WikibaseClient;
use Wikibase\DataModel\Entity\ItemId;

/**
 * Implements additional functions to use in MobileFrontend
 */
class ExtMobileFrontend {
	/**
	 * Uses EventLogging when available to record an event on server side
	 *
	 * @param string $schema The name of the schema
	 * @param int $revision The revision of the schema
	 * @param array $data The data to be recorded against the schema
	 */
	public static function eventLog( $schema, $revision, $data ) {
		if ( is_callable( 'EventLogging::logEvent' ) ) {
			EventLogging::logEvent( $schema, $revision, $data );
		}
	}

	/**
	 * Transforms content to be mobile friendly version.
	 * Filters out various elements and runs the MobileFormatter.
	 * @param OutputPage $out
	 *
	 * @return string
	 */
	public static function DOMParse( OutputPage $out ) {
		global $wgMFNamespacesWithoutCollapsibleSections;
		wfProfileIn( __METHOD__ );

		$html = $out->getHTML();

		wfProfileIn( __METHOD__ . '-formatter-init' );
		$context = MobileContext::singleton();

		$formatter = MobileFormatter::newFromContext( $context, $html );
		wfProfileOut( __METHOD__ . '-formatter-init' );

		wfRunHooks( 'MobileFrontendBeforeDOM', array( $context, $formatter ) );

		wfProfileIn( __METHOD__ . '-filter' );
		$title = $out->getTitle();
		$isSpecialPage = $title->isSpecialPage();
		$formatter->enableExpandableSections(
			// Don't collapse sections e.g. on JS pages
			$out->canUseWikiPage()
			&& $out->getWikiPage()->getContentModel() == CONTENT_MODEL_WIKITEXT
			// And not in certain namespaces
			&& array_search( $title->getNamespace(), $wgMFNamespacesWithoutCollapsibleSections ) === false
			// And not when what's shown is not actually article text
			&& $context->getRequest()->getText( 'action', 'view' ) == 'view'
		);
		if ( $context->getContentTransformations() ) {
			// Remove images if they're disabled from special pages, but don't transform otherwise
			$formatter->filterContent( /* remove defaults */ !$isSpecialPage );
		}
		wfProfileOut( __METHOD__ . '-filter' );

		wfProfileIn( __METHOD__ . '-getText' );
		$contentHtml = $formatter->getText();
		wfProfileOut( __METHOD__ . '-getText' );

		wfProfileOut( __METHOD__ );
		return $contentHtml;
	}

	/**
	 * Returns a short description of a page from Wikidata
	 *
	 * @param string $item Wikibase id of the page
	 * @return string|null
	 */
	public static function getWikibaseDescription( $item ) {
		global $wgContLang;

		if ( !class_exists( 'Wikibase\\Client\\WikibaseClient' ) ) {
			return null;
		}

		$profileSection = new ProfileSection( __METHOD__ );
		try {
			$entityLookup = WikibaseClient::getDefaultInstance()
				->getStore()
				->getEntityLookup();
			$entity = $entityLookup->getEntity( new ItemId( $item ) );
			if ( !$entity ) {
				return null;
			}
			return $entity->getFingerprint()->getDescription( $wgContLang->getCode() )->getText();
		} catch ( Exception $ex) {
			// Do nothing, exception mostly due to description being unavailable in needed language
		}
		return null;
	}
}
