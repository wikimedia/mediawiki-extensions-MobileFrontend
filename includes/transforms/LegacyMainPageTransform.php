<?php

namespace MobileFrontend\Transforms;

use DOMElement;
use DOMXPath;
use Message;
use MessageLocalizer;

class LegacyMainPageTransform implements IMobileTransform, MessageLocalizer {
	/**
	 * Returns interface message text
	 * @param string $key Message key
	 * @param mixed ...$params Any number of message parameters
	 * @return Message
	 */
	public function msg( $key, ...$params ) {
		return wfMessage( $key, ...$params );
	}

	/**
	 * Takes a main page that has been written for desktop and attempts to
	 * make it mobile friendly.
	 * Will scan for #mp-tfa and #mp-itn elements and wrap them with a heading.
	 * Any elements with ids prefixed with `mf-` will be retained in the view any
	 * other elements will be discarded.
	 * @param DOMElement $node to be transformed
	 */
	public function apply( DOMElement $node ) {
		$mainPage = $node->ownerDocument;
		$featuredArticle = $mainPage->getElementById( 'mp-tfa' );
		$newsItems = $mainPage->getElementById( 'mp-itn' );
		$centralAuthImages = $mainPage->getElementById( 'central-auth-images' );
		$changed = false;

		// Collect all the Main Page DOM elements that have an id starting with 'mf-'
		$xpath = new DOMXpath( $mainPage );
		$elements = $xpath->query( '//*[starts-with(@id, "mf-")]' );

		// These elements will be handled specially
		$commonAttributes = [ 'mp-tfa', 'mp-itn' ];

		// Start building the new Main Page content in the $content var
		$content = $mainPage->createElement( 'div' );
		$content->setAttribute( 'id', 'mainpage' );

		// If there is a featured article section, add it to the new Main Page content
		if ( $featuredArticle ) {
			$changed = true;
			$h2FeaturedArticle = $mainPage->createElement(
				'h2',
				$this->msg( 'mobile-frontend-featured-article' )->text()
			);
			$content->appendChild( $h2FeaturedArticle );
			$content->appendChild( $featuredArticle );
		}

		// If there is a news section, add it to the new Main Page content
		if ( $newsItems ) {
			$changed = true;
			$h2NewsItems = $mainPage->createElement( 'h2',
				$this->msg( 'mobile-frontend-news-items' )->text()
			);
			$content->appendChild( $h2NewsItems );
			$content->appendChild( $newsItems );
		}

		// Go through all the collected Main Page DOM elements and format them for mobile
		/** @var DOMElement $element */
		foreach ( $elements as $element ) {
			if ( $element->hasAttribute( 'id' ) ) {
				$id = $element->getAttribute( 'id' );
				// Filter out elements processed specially
				if ( !in_array( $id, $commonAttributes ) ) {
					$changed = true;

					// Convert title attributes into h2 headers
					$sectionTitle = $element->hasAttribute( 'title' ) ? $element->getAttribute( 'title' ) : '';
					if ( $sectionTitle !== '' ) {
						$element->removeAttribute( 'title' );
						$h2UnknownMobileSection =
							$mainPage->createElement( 'h2', htmlspecialchars( $sectionTitle ) );
						$content->appendChild( $h2UnknownMobileSection );
					}
					$br = $mainPage->createElement( 'br' );
					$br->setAttribute( 'clear', 'all' );
					$content->appendChild( $element );
					$content->appendChild( $br );
				}
			}
		}

		// If there are CentralAuth 1x1 images, preserve them unmodified
		if ( $centralAuthImages && $changed ) {
			$content->appendChild( $centralAuthImages );
		}

		// If mobile-appropriate content has been assembled at this point,
		// we will need to replace the DOM
		if ( $changed ) {
			$newBody = $mainPage->createElement( 'body' );
			$newBody->appendChild( $content );
			$oldBody = $mainPage->getElementsByTagName( 'body' )->item( 0 );
			$oldBody->parentNode->replaceChild( $newBody, $oldBody );
		}
	}
}
