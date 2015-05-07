<?php

namespace MobileFrontend\Browse;

use Title;

/**
 * Handles the retrieval of tags - in the context of the Browse experiment - for pages.
 */
class TagService
{
	/**
	 * @var array A map of tag name to the set of matching titles
	 */
	private $tags;

	/**
	 * @param array $tags A map of tag name to the set of matching titles
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

		$result = array();

		// FIXME: This is only good enough when `$this->tags`
		// `wgMFBrowseTags` is small.
		foreach ( $this->tags as $tag => $titles ) {
			if ( is_array( $titles ) && in_array( $title->getText(), $titles ) ) {
				$result[] = $tag;
			}
		}

		return $result;
	}

	/**
	 * Gets the titles associated with the tag.
	 *
	 * @param string $tag Name of a tag
	 * @return Title[]|boolean False if the tag doesn't exist or isn't set to an array
	 */
	public function getTitlesForTag( $tag ) {
		if ( !isset( $this->tags[$tag] ) || !is_array( $this->tags[$tag] ) ) {
			return false;
		}

		return array_map( array( 'Title', 'newFromText' ), $this->tags[$tag] );
	}
}
