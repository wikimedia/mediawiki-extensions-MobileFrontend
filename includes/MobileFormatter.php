<?php
/**
 * MobileFormatter.php
 */

/**
 * Converts HTML into a mobile-friendly version
 */
class MobileFormatter extends HtmlFormatter {
	/** @var string $pageTransformStart String prefixes to be
		applied at start and end of output from Parser */
	protected $pageTransformStart = '<div>';
	/** @var string $pageTransformEnd String prefixes to be
		applied at start and end of output from Parser */
	protected $pageTransformEnd = '</div>';
	/** @var string $headingTransformStart String prefixes to be
		applied before and after section content. */
	protected $headingTransformStart = '</div>';
	/** @var string $headingTransformEnd String prefixes to be
		applied before and after section content. */
	protected $headingTransformEnd = '<div>';

	/**
	 * Saves a Title Object
	 * @var Title $title
	 */
	protected $title;

	/**
	 * Are sections expandable?
	 * @var boolean $expandableSections
	 */
	protected $expandableSections = false;
	/**
	 * Whether actual page is the main page
	 * @var boolean $mainPage
	 */
	protected $mainPage = false;

	/**
	 * Constructor
	 *
	 * @param string $html Text to process
	 * @param Title $title Title to which $html belongs
	 */
	public function __construct( $html, $title ) {
		parent::__construct( $html );

		$this->title = $title;
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
		global $wgMFSpecialCaseMainPage;

		$title = $context->getTitle();
		$isMainPage = $title->isMainPage() && $wgMFSpecialCaseMainPage;
		$isFilePage = $title->inNamespace( NS_FILE );
		$isSpecialPage = $title->isSpecialPage();

		$html = self::wrapHTML( $html );
		$formatter = new MobileFormatter( $html, $title );
		$formatter->enableExpandableSections( !$isMainPage && !$isSpecialPage );

		$formatter->setIsMainPage( $isMainPage );
		if ( $context->getContentTransformations() && !$isFilePage ) {
			$formatter->setRemoveMedia( $context->imagesDisabled() );
		}

		return $formatter;
	}

	/**
	 * Set support of page for expandable sections to $flag (standard: true)
	 * @todo kill with fire when there will be minimum of pre-1.1 app users remaining
	 * @param bool $flag
	 */
	public function enableExpandableSections( $flag = true ) {
		$this->expandableSections = $flag;
	}

	/**
	 * Change mainPage (is this the main page) to $value (standard: true)
	 * @param boolean $value
	 */
	public function setIsMainPage( $value = true ) {
		$this->mainPage = $value;
	}

	/**
	 * Removes content inappropriate for mobile devices
	 * @param bool $removeDefaults Whether default settings at $wgMFRemovableClasses should be used
	 * @return array
	 */
	public function filterContent( $removeDefaults = true ) {
		global $wgMFRemovableClasses;

		if ( $removeDefaults ) {
			$this->remove( $wgMFRemovableClasses['base'] );
			$this->remove( $wgMFRemovableClasses['HTML'] ); // @todo: Migrate this variable
		}

		if ( $this->removeMedia ) {
			$this->doRemoveImages();
		}
		return parent::filterContent();
	}

	/**
	 * Replaces images with [annotations from alt]
	 */
	private function doRemoveImages() {
		$doc = $this->getDoc();
		$domElemsToReplace = array();
		foreach ( $doc->getElementsByTagName( 'img' ) as $element ) {
			$domElemsToReplace[] = $element;
		}
		/** @var $element DOMElement */
		foreach ( $domElemsToReplace as $element ) {
			$alt = $element->getAttribute( 'alt' );
			if ( $alt === '' ) {
				$alt = '[' . wfMessage( 'mobile-frontend-missing-image' )->inContentLanguage() . ']';
			} else {
				$alt = '[' . $alt . ']';
			}
			$replacement = $doc->createElement( 'span', htmlspecialchars( $alt ) );
			$replacement->setAttribute( 'class', 'mw-mf-image-replacement' );
			$element->parentNode->replaceChild( $replacement, $element );
		}
	}

	/**
	 * Performs final transformations to mobile format and returns resulting HTML
	 *
	 * @param DOMElement|string|null $element ID of element to get HTML from or
	 *   false to get it from the whole tree
	 * @return string Processed HTML
	 */
	public function getText( $element = null ) {
		if ( $this->mainPage ) {
			$element = $this->parseMainPage( $this->getDoc() );
		}
		$html = parent::getText( $element );

		return $html;
	}

	/**
	 * Returns interface message text
	 * @param string $key Message key
	 * @return string Wiki text
	 */
	protected function msg( $key ) {
		return wfMessage( $key )->text();
	}

	/**
	 * Performs transformations specific to main page
	 * @param DOMDocument $mainPage Tree to process
	 * @return DOMElement|null
	 */
	protected function parseMainPage( DOMDocument $mainPage ) {
		$featuredArticle = $mainPage->getElementById( 'mp-tfa' );
		$newsItems = $mainPage->getElementById( 'mp-itn' );
		$centralAuthImages = $mainPage->getElementById( 'central-auth-images' );

		// Collect all the Main Page DOM elements that have an id starting with 'mf-'
		$xpath = new DOMXpath( $mainPage );
		$elements = $xpath->query( '//*[starts-with(@id, "mf-")]' );

		// These elements will be handled specially
		$commonAttributes = array( 'mp-tfa', 'mp-itn' );

		// Start building the new Main Page content in the $content var
		$content = $mainPage->createElement( 'div' );
		$content->setAttribute( 'id', 'mainpage' );

		// If there is a featured article section, add it to the new Main Page content
		if ( $featuredArticle ) {
			$h2FeaturedArticle = $mainPage->createElement(
				'h2',
				$this->msg( 'mobile-frontend-featured-article' )
			);
			$content->appendChild( $h2FeaturedArticle );
			$content->appendChild( $featuredArticle );
		}

		// If there is a news section, add it to the new Main Page content
		if ( $newsItems ) {
			$h2NewsItems = $mainPage->createElement( 'h2', $this->msg( 'mobile-frontend-news-items' ) );
			$content->appendChild( $h2NewsItems );
			$content->appendChild( $newsItems );
		}

		// Go through all the collected Main Page DOM elements and format them for mobile
		/** @var $element DOMElement */
		foreach ( $elements as $element ) {
			if ( $element->hasAttribute( 'id' ) ) {
				$id = $element->getAttribute( 'id' );
				// Filter out elements processed specially
				if ( !in_array( $id, $commonAttributes ) ) {
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

		// If no mobile-appropriate content has been assembled at this point, return null.
		// This will cause HtmlFormatter to fall back to using the entire page.
		if ( $content->childNodes->length == 0 ) {
			return null;
		}

		// If there are CentralAuth 1x1 images, preserve them unmodified
		if ( $centralAuthImages ) {
			$content->appendChild( $centralAuthImages );
		}

		return $content;
	}

	/**
	 * Transforms heading for toggling and editing
	 *
	 * - Add css classes to all h-tags (h1-h6) _inside_ a section
	 *   to enable editing of these sections. Doesn't add this class to the first
	 *   heading ($tagName)
	 * - Wraps section-content inside a div to enable toggling
	 *
	 * @param string $s
	 * @param string $tagName
	 * @return string
	 */
	protected function headingTransform( $s, $tagName = 'h2' ) {
		// add in-block class to all headings included in this section (except the first one)
		// don't do this for the main page, it breaks things - Bug 190662
		if ( !$this->mainPage ) {
			$s = preg_replace_callback(
				'/<(h[1-6])>/si',
				function ( $match ) use ( $tagName ) {
					$tag = $match[1];
					$cssClass = '';
					if ( $tag !== $tagName ) {
						$cssClass = ' class="in-block"';
					}
					return '<' . $tag . $cssClass . '>';
				},
				$s
			);
		}

		// Makes sections expandable
		$tagRegEx = '<' . $tagName . '.*</' . $tagName . '>';
		$s = $this->pageTransformStart .
			preg_replace(
				'%(' . $tagRegEx . ')%sU', $this->headingTransformStart . '\1' . $this->headingTransformEnd,
				$s
			) .
			$this->pageTransformEnd;

		return $s;
	}

	/**
	 * Finds the first heading in the page and uses that to determine top level sections.
	 * When a page contains no headings returns h6.
	 *
	 * @param string $html
	 * @return string the tag name for the top level headings
	 */
	protected function findTopHeading( $html ) {
		$tags = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' );
		foreach ( $tags as $tag ) {
			if ( strpos( $html, '<' . $tag ) !== false ) {
				return $tag;
			}
		}
		return 'h6';
	}

	/**
	 * Call headingTransform if needed
	 *
	 * @param string $html
	 * @return string
	 */
	protected function onHtmlReady( $html ) {
		if ( $this->expandableSections ) {
			$tagName = $this->findTopHeading( $html );
			$html = $this->headingTransform( $html, $tagName );
		}

		return $html;
	}
}
