<?php

namespace MobileFrontend\Transforms;

use DOMElement;

/**
 * Marks the headings as editable by adding the <code>in-block</code>
 * class to each of them, if it hasn't already been added.
 */
class SubHeadingTransform implements IMobileTransform {

	/** @var string[] */
	private $topHeadingTags;

	/**
	 * @param string[] $topHeadingTags list of heading tags ordered by weight
	 */
	public function __construct( array $topHeadingTags ) {
		$this->topHeadingTags = $topHeadingTags;
	}

	/**
	 * Marks the headings as editable by adding the <code>in-block</code>
	 * class to each of them, if it hasn't already been added.
	 *
	 * FIXME: <code>in-block</code> isn't semantic in that it isn't
	 * obviously connected to being editable.
	 *
	 * @param DOMElement[] $headings Heading elements
	 */
	protected function makeHeadingsEditable( array $headings ) {
		foreach ( $headings as $heading ) {
			$class = $heading->getAttribute( 'class' );
			if ( strpos( $class, 'in-block' ) === false ) {
				$heading->setAttribute(
					'class',
					ltrim( $class . ' in-block' )
				);
			}
		}
	}

	/**
	 * Gets all subheadings in the document in rank order.
	 *
	 * Note well that the rank order is defined by the
	 * <code>MobileFormatter#topHeadingTags</code> property.
	 *
	 * @param DOMElement $body
	 * @return DOMElement[]
	 */
	private function getSubHeadings( DOMElement $body ): array {
		$found = false;
		$subheadings = [];
		foreach ( $this->topHeadingTags as $tagName ) {
			$allTags = $body->getElementsByTagName( $tagName );
			$elements = [];
			foreach ( $allTags as $el ) {
				if ( $el->parentNode->getAttribute( 'class' ) !== 'toctitle' ) {
					$elements[] = $el;
				}
			}

			if ( $elements ) {
				if ( !$found ) {
					$found = true;
				} else {
					$subheadings = array_merge( $subheadings, $elements );
				}
			}
		}

		return $subheadings;
	}

	/**
	 * Performs html transformation.
	 * @param DOMElement $node html element
	 */
	public function apply( DOMElement $node ) {
		$this->makeHeadingsEditable(
			$this->getSubHeadings( $node )
		);
	}
}
