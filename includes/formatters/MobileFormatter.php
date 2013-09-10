<?php

/**
 * Converts HTML into a mobile-friendly version
 */
abstract class MobileFormatter extends HtmlFormatter {
	/**
	 * @var Title
	 */
	protected $title;

	protected $expandableSections = false;
	protected $mainPage = false;
	protected $backToTopLink = true;
	protected $flattenRedLinks = false;

	protected $headings = 0;

	/**
	 * Constructor
	 *
	 * @param string $html: Text to process
	 * @param Title $title: Title to which $html belongs
	 */
	public function __construct( $html, $title ) {
		parent::__construct( $html );

		$this->title = $title;
		$this->flattenRedLinks();
	}

	/**
	 * Creates and returns a MobileFormatter
	 *
	 * @param MobileContext $context
	 * @param string $html
	 *
	 * @return MobileFormatter
	 */
	public static function newFromContext( $context, $html ) {
		wfProfileIn( __METHOD__ );

		$title = $context->getTitle();
		$isMainPage = $title->isMainPage();
		$isFilePage = $title->inNamespace( NS_FILE );
		$isSpecialPage = $title->isSpecialPage();

		$html = self::wrapHTML( $html );
		if ( $context->getContentFormat() === 'WML' ) {
			$wmlContext = new WmlContext( $context );
			$formatter = new MobileFormatterWML( $html, $title, $wmlContext );
		} else {
			$formatter = new MobileFormatterHTML( $html, $title );
			$formatter->enableExpandableSections( !$isMainPage && !$isSpecialPage );
		}

		if ( $context->isBetaGroupMember() ) {
			$formatter->disableBackToTop();
		}
		if ( !$context->isAlphaGroupMember() ) {
			$formatter->setIsMainPage( $isMainPage );
		}
		if ( $context->getContentTransformations() && !$isFilePage ) {
			$formatter->removeImages( $context->imagesDisabled() );
		}

		wfProfileOut( __METHOD__ );
		return $formatter;
	}

	/**
	 * @return string: Output format
	 */
	public abstract function getFormat();

	/**
	 * @todo: kill with fire when there will be minimum of pre-1.1 app users remaining
	 * @param bool $flag
	 */
	public function enableExpandableSections( $flag = true ) {
		$this->expandableSections = $flag;
	}

	/**
	 * @todo: kill with fire when dynamic sections in production
	 */
	public function disableBackToTop() {
		$this->backToTopLink = false;
	}

	public function setIsMainPage( $value = true ) {
		$this->mainPage = $value;
	}

	/**
	 * Sets whether red links should be flattened
	 * @param bool $flag
	 */
	public function flattenRedLinks( $flag = true ) {
		$this->flattenRedLinks = $flag;
	}

	/**
	 * Removes content inappropriate for mobile devices
	 * @param bool $removeDefaults: Whether default settings at $wgMFRemovableClasses should be used
	 */
	public function filterContent( $removeDefaults = true ) {
		global $wgMFRemovableClasses;

		if ( $removeDefaults ) {
			$this->remove( $wgMFRemovableClasses['base'] );
			$this->remove( $wgMFRemovableClasses[$this->getFormat()] );
		}
		parent::filterContent();

		// Handle red links with action equal to edit
		if ( $this->flattenRedLinks ) {
			$doc = $this->getDoc();
			$xpath = new DOMXpath( $doc );
			$redLinks = $xpath->query( '//a[@class="new"]' );
			/** @var $redLink DOMElement */
			foreach ( $redLinks as $redLink ) {
				// PHP Bug #36795 — Inappropriate "unterminated entity reference"
				$spanNode = $doc->createElement( "span", str_replace( "&", "&amp;", $redLink->nodeValue ) );

				if ( $redLink->hasAttributes() ) {
					$attributes = $redLink->attributes;
					foreach ( $attributes as $attribute ) {
						if ( $attribute->name != 'href' ) {
							$spanNode->setAttribute( $attribute->name, $attribute->value );
						}
					}
				}

				$redLink->parentNode->replaceChild( $spanNode, $redLink );
			}
		}
	}

	/**
	 * Performs final transformations to mobile format and returns resulting HTML/WML
	 *
	 * @param DOMElement|string|null $element: ID of element to get HTML from or false to get it from the whole tree
	 * @return string: Processed HTML
	 */
	public function getText( $element = null ) {
		wfProfileIn( __METHOD__ );
		if ( $this->mainPage ) {
			$element = $this->parseMainPage( $this->getDoc() );
		}
		$html = parent::getText( $element );
		wfProfileOut( __METHOD__ );
		return $html;
	}

	/**
	 * Callback for headingTransform()
	 * @param array $matches
	 * @return string
	 */
	protected abstract function headingTransformCallback( $matches );

	/**
	 * generates a back top link for a given section number
	 * @param int $headingNumber: The number corresponding to the section heading
	 * @return string
	 */
	protected function backToTopLink( $headingNumber ) {
		return Html::rawElement( 'a',
				array( 'id' => 'anchor_' . $headingNumber,
					'href' => '#section_' . $headingNumber,
					'class' => 'section_anchors' ),
				'&#8593;' . $this->msg( 'mobile-frontend-back-to-top-of-section' ) );
	}

	/**
	 * Prepares headings in WML mode, makes sections expandable in HTML mode
	 * @param string $s
	 * @return string
	 */
	protected function headingTransform( $s ) {
		wfProfileIn( __METHOD__ );

		// Closures are a PHP 5.3 feature.
		// MediaWiki currently requires PHP 5.2.3 or higher.
		// So, using old style for now.
		$s = '<div id="content_0" class="content_block openSection">'
			. preg_replace_callback(
				'%<h2(.*)<span class="mw-headline" [^>]*>(.+)</span>[\s\r\n]*</h2>%sU',
				array( $this, 'headingTransformCallback' ),
				$s
			);

		// if we had any, make sure to close the whole thing!
		if ( $this->headings > 0 ) {
			if ( $this->backToTopLink ) {
				$bt = $this->backToTopLink( intval( $this->headings ) );
			} else {
				$bt = '';
			}
			$s .= '</div>' // <div class="content_block">
				. $bt;
		}
		$s .= "\n</div>";
		wfProfileOut( __METHOD__ );
		return $s;
	}

	/**
	 * Returns interface message text
	 * @param string $key: Message key
	 * @return string Wiki text
	 */
	protected function msg( $key ) {
		return wfMessage( $key )->text();
	}

	/**
	 * Performs transformations specific to main page
	 * @param DOMDocument $mainPage: Tree to process
	 * @return DOMElement|null
	 */
	protected function parseMainPage( DOMDocument $mainPage ) {
		wfProfileIn( __METHOD__ );

		$featuredArticle = $mainPage->getElementById( 'mp-tfa' );
		$newsItems = $mainPage->getElementById( 'mp-itn' );

		$xpath = new DOMXpath( $mainPage );
		$elements = $xpath->query( '//*[starts-with(@id, "mf-")]' );

		$commonAttributes = array( 'mp-tfa', 'mp-itn' );

		$content = $mainPage->createElement( 'div' );
		$content->setAttribute( 'id', 'mainpage' );

		if ( $featuredArticle ) {
			$h2FeaturedArticle = $mainPage->createElement( 'h2', $this->msg( 'mobile-frontend-featured-article' ) );
			$content->appendChild( $h2FeaturedArticle );
			$content->appendChild( $featuredArticle );
		}

		if ( $newsItems ) {
			$h2NewsItems = $mainPage->createElement( 'h2', $this->msg( 'mobile-frontend-news-items' ) );
			$content->appendChild( $h2NewsItems );
			$content->appendChild( $newsItems );
		}

		/** @var $element DOMElement */
		foreach ( $elements as $element ) {
			if ( $element->hasAttribute( 'id' ) ) {
				$id = $element->getAttribute( 'id' );
				if ( !in_array( $id, $commonAttributes ) ) {
					$sectionTitle = $element->hasAttribute( 'title' ) ? $element->getAttribute( 'title' ) : '';
					if( $sectionTitle !== '' ) {
						$element->removeAttribute( 'title' );
						$h2UnknownMobileSection = $mainPage->createElement( 'h2', $sectionTitle );
						$content->appendChild( $h2UnknownMobileSection );
					}
					$br = $mainPage->createElement( 'br' );
					$br->setAttribute( 'clear', 'all' );
					$content->appendChild( $element );
					$content->appendChild( $br );
				}
			}
		}
		if ( $content->childNodes->length == 0 ) {
			$content = null;
		}

		wfProfileOut( __METHOD__ );
		return $content;
	}
}
