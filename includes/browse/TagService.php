<?php

namespace MobileFrontend\Browse;

use Title;

/**
 * Handles the retrieval of tags - in the context of the Browse experiment - for pages.
 */
class TagService
{
	/**
	 * @var array A map of category name to tag name
	 */
	private $tags;

	/**
	 * @param array $tags A map of category name to tag name
	 */
	public function __construct( array $tags ) {
		$this->tags = $tags;
	}

	/**
	 * Gets the tags associated with the page.
	 *
	 * Only articles in the main namespace can have tags.
	 *
	 * @param Title $title
	 * @return array
	 */
	public function getTags( Title $title ) {
		if ( !$title->inNamespace( NS_MAIN ) ) {
			return array();
		}

		$associatedTags = array_intersect_key( $this->tags, $title->getParentCategories() );

		return array_values( $associatedTags );
	}
}
