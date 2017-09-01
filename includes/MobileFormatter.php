<?php
/**
 * MobileFormatter.php
 */

use HtmlFormatter\HtmlFormatter;
use MobileFrontend\ContentProviders\IContentProvider;

/**
 * Converts HTML into a mobile-friendly version
 */
class MobileFormatter extends HtmlFormatter {
	/**
	 * Class name for collapsible section wrappers
	 */
	const STYLE_COLLAPSIBLE_SECTION_CLASS = 'collapsible-block';

	/**
	 * Do not lazy load images smaller than this size (in pixels)
	 * @var int
	 */
	const SMALL_IMAGE_DIMENSION_THRESHOLD_IN_PX = 50;
	/**
	 * Do not lazy load images smaller than this size (in relative to x-height of the current font)
	 * @var int
	 */
	const SMALL_IMAGE_DIMENSION_THRESHOLD_IN_EX = 10;
	/**
	 * Whether scripts can be added in the output.
	 * @var boolean $scriptsEnabled
	 */
	private $scriptsEnabled = true;

	/**
	 * The current revision id of the Title being worked on
	 * @var integer $revId
	 */
	private $revId;

	/** @var array $topHeadingTags Array of strings with possible tags,
		can be recognized as top headings. */
	public $topHeadingTags = [];

	/**
	 * Saves a Title Object
	 * @var Title $title
	 */
	protected $title;

	/**
	 * Whether the table of contents is needed on this page
	 * @var boolean $isTOCEnabled
	 */
	protected $isTOCEnabled = false;

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
	 * Name of the transformation option
	 * @const string SHOW_FIRST_PARAGRAPH_BEFORE_INFOBOX
	 */
	const SHOW_FIRST_PARAGRAPH_BEFORE_INFOBOX = 'showFirstParagraphBeforeInfobox';

	/**
	 * Constructor
	 *
	 * @param string $html Text to process
	 * @param Title $title Title to which $html belongs
	 */
	public function __construct( $html, $title ) {
		parent::__construct( $html );

		$this->title = $title;
		$this->revId = $title->getLatestRevID();
		$this->topHeadingTags = MobileContext::singleton()
			->getMFConfig()->get( 'MFMobileFormatterHeadings' );
	}

	/**
	 * Disables the generation of script tags in output HTML.
	 */
	public function disableScripts() {
		$this->scriptsEnabled = false;
	}
	/**
	 * Creates and returns a MobileFormatter
	 *
	 * @param MobileContext $context
	 * @param IContentProvider $provider
	 * @param bool $enableSections (optional)
	 *  whether to wrap the content of sections
	 * @param bool $includeTOC (optional) whether to include the
	 *  table of contents in output HTML
	 *
	 * @return MobileFormatter
	 */
	public static function newFromContext( MobileContext $context,
		IContentProvider $provider,
		$enableSections = false, $includeTOC = false
	) {
		$mfSpecialCaseMainPage = $context->getMFConfig()->get( 'MFSpecialCaseMainPage' );

		$title = $context->getTitle();
		$isMainPage = $title->isMainPage() && $mfSpecialCaseMainPage;
		$isFilePage = $title->inNamespace( NS_FILE );
		$isSpecialPage = $title->isSpecialPage();

		$html = self::wrapHTML( $provider->getHTML() );
		$formatter = new MobileFormatter( $html, $title );
		$formatter->enableExpandableSections( !$isMainPage && !$isSpecialPage );

		$formatter->setIsMainPage( $isMainPage );

		$formatter->enableExpandableSections( $enableSections );
		$formatter->enableTOCPlaceholder( $includeTOC );

		return $formatter;
	}

	/**
	 * Mark whether a placeholder table of contents should be included at the end of the lead
	 * section
	 * @param bool $flag
	 */
	public function enableTOCPlaceholder( $flag = true ) {
		$this->isTOCEnabled = $flag;
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
	 * @param bool $value
	 */
	public function setIsMainPage( $value = true ) {
		$this->mainPage = $value;
	}

	/**
	 * Performs various transformations to the content to make it appropiate for mobile devices.
	 * @param bool $removeDefaults Whether default settings at $wgMFRemovableClasses should be used
	 * @param bool $removeReferences Whether to remove references from the output
	 * @param bool $removeImages Whether to move images into noscript tags
	 * @param bool $showFirstParagraphBeforeInfobox Whether the first paragraph from the lead
	 *  section should be shown before all infoboxes that come earlier.
	 * @return array
	 */
	public function filterContent(
		$removeDefaults = true, $removeReferences = false, $removeImages = false,
		$showFirstParagraphBeforeInfobox = false
	) {
		$ctx = MobileContext::singleton();
		$config = $ctx->getMFConfig();
		$doc = $this->getDoc();

		$isSpecialPage = $this->title->isSpecialPage();
		$mfRemovableClasses = $config->get( 'MFRemovableClasses' );
		$removableClasses = $mfRemovableClasses['base'];
		if ( $ctx->isBetaGroupMember() ) {
			$removableClasses = array_merge( $removableClasses, $mfRemovableClasses['beta'] );
		}

		// Don't remove elements in special pages
		if ( !$isSpecialPage && $removeDefaults ) {
			$this->remove( $removableClasses );
		}

		if ( $this->removeMedia ) {
			$this->doRemoveImages();
		}

		$transformOptions = [
			'images' => $removeImages,
			'references' => $removeReferences,
			self::SHOW_FIRST_PARAGRAPH_BEFORE_INFOBOX => $showFirstParagraphBeforeInfobox
		];
		// Sectionify the content and transform it if necessary per section
		if ( !$this->mainPage && $this->expandableSections ) {
			list( $headings, $subheadings ) = $this->getHeadings( $doc );
			$this->makeHeadingsEditable( $subheadings );
			$this->makeSections( $doc, $headings, $transformOptions );
		} else {
			// Otherwise apply the per-section transformations to the document as a whole
			$this->filterContentInSection( $doc, $doc, 0, $transformOptions );
		}
		if ( $transformOptions['references'] ) {
			$this->doRewriteReferencesLinksForLazyLoading( $doc );
		}

		return parent::filterContent();
	}

	/**
	 * Apply filtering per element (section) in a document.
	 * @param DOMElement|DOMDocument $el
	 * @param DOMDocument $doc
	 * @param number $sectionNumber Which section is it on the document
	 * @param array $options options about the transformations per section
	 */
	private function filterContentInSection(
		$el, DOMDocument $doc, $sectionNumber, $options = []
	) {
		if ( !$this->removeMedia && $options['images'] && $sectionNumber > 0 ) {
			$this->doRewriteImagesForLazyLoading( $el, $doc );
		}
		if ( $options['references'] ) {
			$this->doRewriteReferencesListsForLazyLoading( $el, $doc );
		}
	}

	/**
	 * Move the first paragraph in the lead section above the infobox
	 *
	 * In order for a paragraph to be moved the following conditions must be met:
	 *   - the lead section contains at least one infobox;
	 *   - the paragraph doesn't already appear before the first infobox
	 *     if any in the DOM;
	 *   - the paragraph contains text content, e.g. no <p></p>;
	 *   - the paragraph doesn't contain coordinates, i.e. span#coordinates.
	 *   - article belongs to the MAIN namespace
	 *
	 * Additionally if paragraph immediate sibling is a list (ol or ul element), the list
	 * is also moved along with paragraph above infobox.
	 *
	 * Note that the first paragraph is not moved before hatnotes, or mbox or other
	 * elements that are not infoboxes.
	 *
	 * @param DOMElement $leadSectionBody
	 * @param DOMDocument $doc Document to which the section belongs
	 */
	private function moveFirstParagraphBeforeInfobox( $leadSectionBody, $doc ) {
		// Move lead parapgraph only on pages in MAIN namespace (see @T163805)
		if ( $this->title->getNamespace() !== NS_MAIN ) {
			return;
		}
		$xPath = new DOMXPath( $doc );
		// Find infoboxes and paragraphs that have text content, i.e. paragraphs
		// that are not empty nor are wrapper paragraphs that contain span#coordinates.
		$infoboxAndParagraphs = $xPath->query(
			'./table[contains(@class,"infobox")] | ./p[string-length(text()) > 0]',
			$leadSectionBody
		);
		// We need both an infobox and a paragraph and the first element of our query result
		// ought to be an infobox.
		if ( $infoboxAndParagraphs->length >= 2 &&
			$infoboxAndParagraphs->item( 0 )->nodeName == 'table'
		) {
			$firstP = null;
			for ( $i = 1; $i < $infoboxAndParagraphs->length; $i++ ) {
				if ( $infoboxAndParagraphs->item( $i )->nodeName == 'p' ) {
					$firstP = $infoboxAndParagraphs->item( $i );
					break;
				}
			}
			if ( $firstP ) {
				$listElementAfterParagraph = null;
				$where = $infoboxAndParagraphs->item( 0 );

				$elementAfterParagraphQuery = $xPath->query( 'following-sibling::*[1]', $firstP );
				if ( $elementAfterParagraphQuery->length > 0 ) {
					$elem = $elementAfterParagraphQuery->item( 0 );
					if ( $elem->tagName === 'ol' || $elem->tagName === 'ul' ) {
						$listElementAfterParagraph = $elem;
					}
				}

				$leadSectionBody->insertBefore( $firstP, $where );
				if ( $listElementAfterParagraph !== null ) {
					$leadSectionBody->insertBefore( $listElementAfterParagraph, $where );
				}
			}
		}
		/**
		 * @see https://phabricator.wikimedia.org/T149884
		 * @todo remove after research is done
		 */
		if ( MobileContext::singleton()->getMFConfig()->get( 'MFLogWrappedInfoboxes' ) ) {
			$this->logInfoboxesWrappedInContainers( $leadSectionBody, $xPath );
		}
	}

	/**
	 * Finds all infoboxes which are one or more levels deep in $xPath content. When at least one
	 * element is found - log the page title and revision
	 *
	 * @see https://phabricator.wikimedia.org/T149884
	 * @param $leadSectionBody
	 * @param DOMXPath $xPath
	 */
	private function logInfoboxesWrappedInContainers( $leadSectionBody, DOMXPath $xPath ) {
		$infoboxes = $xPath->query( './*//table[contains(@class,"infobox")]' .
			'[not(ancestor::table[contains(@class,"infobox")])]', $leadSectionBody );
		if ( $infoboxes->length > 0 ) {
			\MediaWiki\Logger\LoggerFactory::getInstance( 'mobile' )->info(
				"Found infobox wrapped with container on {$this->title} (rev:{$this->revId})"
			);
		}
	}
	/**
	 * Replaces any references links with a link to Special:MobileCite
	 *
	 * @param DOMDocument $doc Document to create and replace elements in
	 */
	private function doRewriteReferencesLinksForLazyLoading( DOMDocument $doc ) {
		$citePath = "$this->revId";

		$xPath = new DOMXPath( $doc );
		$nodes = $xPath->query(
			// sup.reference > a
			'//sup[contains(concat(" ", normalize-space(./@class), " "), " reference ")]/a[1]' );

		foreach ( $nodes as $node ) {
			$fragment = $node->getAttribute( 'href' );
			$node->setAttribute(
				'href',
				SpecialPage::getTitleFor( 'MobileCite', $citePath )->getLocalUrl() . $fragment
			);
		}
	}

	/**
	 * Replaces any references list with a link to Special:MobileCite
	 *
	 * @param DOMElement|DOMDocument $el Element or document to rewrite references in.
	 * @param DOMDocument $doc Document to create elements in
	 */
	private function doRewriteReferencesListsForLazyLoading( $el, DOMDocument $doc ) {
		$citePath = "$this->revId";
		$isReferenceSection = false;

		// Accessing by tag is cheaper than class
		$nodes = $el->getElementsByTagName( 'ol' );
		// PHP's DOM classes are recursive
		// but since we are manipulating the DOMList we have to
		// traverse it backwards
		// see http://php.net/manual/en/class.domnodelist.php
		for ( $i = $nodes->length - 1; $i >= 0; $i-- ) {
			$list = $nodes->item( $i );

			// Use class to decide it is a list of references
			if ( strpos( $list->getAttribute( 'class' ), 'references' ) !== false ) {
				// Only mark the section as a reference container if we're transforming a section, not the
				// document.
				$isReferenceSection = $el instanceof DOMElement;

				$parent = $list->parentNode;
				$placeholder = $doc->createElement( 'a',
					wfMessage( 'mobile-frontend-references-list' ) );
				$placeholder->setAttribute( 'class', 'mf-lazy-references-placeholder' );
				// Note to render a reference we need to know only its reference
				// Note: You can have multiple <references> tag on the same page, we render all of these in
				// the special page together.
				$placeholder->setAttribute( 'href',
					SpecialPage::getTitleFor( 'MobileCite', $citePath )->getLocalUrl() );
				$parent->replaceChild( $placeholder, $list );
			}
		}

		// Mark section as having references
		if ( $isReferenceSection ) {
			$el->setAttribute( 'data-is-reference-section', '1' );
		}
	}

	/**
	 * @see MobileFormatter#getImageDimensions
	 *
	 * @param DOMElement $img
	 * @param string $dimension Either "width" or "height"
	 * @return string|null
	 */
	private function getImageDimension( DOMElement $img, $dimension ) {
		$style = $img->getAttribute( 'style' );
		$numMatches = preg_match( "/.*?{$dimension} *\: *([^;]*)/", $style, $matches );

		if ( !$numMatches && !$img->hasAttribute( $dimension ) ) {
			return null;
		}

		return $numMatches
			? trim( $matches[1] )
			: $img->getAttribute( $dimension ) . 'px';
	}

	/**
	 * Determine the user perceived width and height of an image element based on `style`, `width`,
	 * and `height` attributes.
	 *
	 * As in the browser, the `style` attribute takes precedence over the `width` and `height`
	 * attributes. If the image has no `style`, `width` or `height` attributes, then the image is
	 * dimensionless.
	 *
	 * @param DOMElement $img
	 * @return array with width and height parameters if dimensions are found
	 */
	public function getImageDimensions( DOMElement $img ) {
		$result = [];

		foreach ( [ 'width', 'height' ] as $dimensionName ) {
			$dimension = $this->getImageDimension( $img, $dimensionName );

			if ( $dimension ) {
				$result[$dimensionName] = $dimension;
			}
		}

		return $result;
	}

	/**
	 * Is image dimension small enough to not lazy load it
	 *
	 * @param string $dimension in css format, supports only px|ex units
	 * @return bool
	 */
	public function isDimensionSmallerThanThreshold( $dimension ) {
		$matches = null;
		if ( preg_match( '/(\d+)(\.\d+)?(px|ex)/', $dimension, $matches ) === 0 ) {
			return false;
		}

		$size = $matches[1];
		$unit = array_pop( $matches );

		switch ( strtolower( $unit ) ) {
			case 'px':
				return $size <= self::SMALL_IMAGE_DIMENSION_THRESHOLD_IN_PX;
			case 'ex':
				return $size <= self::SMALL_IMAGE_DIMENSION_THRESHOLD_IN_EX;
			default:
				return false;
		}
	}

	/**
	 * @param array $dimensions
	 * @return bool
	 */
	private function skipLazyLoadingForSmallDimensions( array $dimensions ) {
		if ( array_key_exists( 'width', $dimensions )
			&& $this->isDimensionSmallerThanThreshold( $dimensions['width'] )
		) {
			return true;
		};
		if ( array_key_exists( 'height', $dimensions )
			&& $this->isDimensionSmallerThanThreshold( $dimensions['height'] )
		) {
			return true;
		}
		return false;
	}
	/**
	 * Enables images to be loaded asynchronously
	 *
	 * @param DOMElement|DOMDocument $el Element or document to rewrite images in.
	 * @param DOMDocument $doc Document to create elements in
	 */
	private function doRewriteImagesForLazyLoading( $el, DOMDocument $doc ) {
		$lazyLoadSkipSmallImages = MobileContext::singleton()->getMFConfig()
			->get( 'MFLazyLoadSkipSmallImages' );

		foreach ( $el->getElementsByTagName( 'img' ) as $img ) {
			$parent = $img->parentNode;
			$dimensions = $this->getImageDimensions( $img );

			$dimensionsStyle = ( isset( $dimensions['width'] ) ? "width: {$dimensions['width']};" : '' ) .
				( isset( $dimensions['height'] ) ? "height: {$dimensions['height']};" : '' );

			if ( $lazyLoadSkipSmallImages
				&& $this->skipLazyLoadingForSmallDimensions( $dimensions )
			) {
				continue;
			}

			// HTML only clients
			$noscript = $doc->createElement( 'noscript' );

			// To be loaded image placeholder
			$imgPlaceholder = $doc->createElement( 'span' );
			$imgPlaceholder->setAttribute( 'class', 'lazy-image-placeholder' );
			$imgPlaceholder->setAttribute( 'style', $dimensionsStyle );
			foreach ( [ 'src', 'alt', 'width', 'height', 'srcset', 'class' ] as $attr ) {
				if ( $img->hasAttribute( $attr ) ) {
					$imgPlaceholder->setAttribute( "data-$attr", $img->getAttribute( $attr ) );
				}
			}
			// Assume data saving and remove srcset attribute from the non-js experience
			$img->removeAttribute( 'srcset' );

			// T145222: Add a non-breaking space inside placeholders to ensure that they do not report
			// themselves as invisible when inline.
			$imgPlaceholder->appendChild( $doc->createEntityReference( 'nbsp' ) );

			// Set the placeholder where the original image was
			$parent->replaceChild( $imgPlaceholder, $img );
			// Add the original image to the HTML only markup
			$noscript->appendChild( $img );
			// Insert the HTML only markup before the placeholder
			$parent->insertBefore( $noscript, $imgPlaceholder );
		}
	}

	/**
	 * Replaces images with [annotations from alt]
	 */
	private function doRemoveImages() {
		$doc = $this->getDoc();
		$domElemsToReplace = [];
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

		return parent::getText( $element );
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
		$commonAttributes = [ 'mp-tfa', 'mp-itn' ];

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
	 * Splits the body of the document into sections demarcated by the $headings elements.
	 * Also moves the first paragraph in the lead section above the infobox.
	 *
	 * All member elements of the sections are added to a <code><div></code> so
	 * that the section bodies are clearly defined (to be "expandable" for
	 * example).
	 *
	 * @param DOMDocument $doc
	 * @param [DOMElement] $headings The headings returned by
	 *  {@see MobileFormatter::getHeadings}
	 * @param array $transformOptions Options to pass when transforming content per section
	 */
	protected function makeSections( DOMDocument $doc, array $headings, $transformOptions ) {
		// Find the parser output wrapper div
		$xpath = new DOMXPath( $doc );
		$containers = $xpath->query( 'body/div[@class="mw-parser-output"][1]' );
		if ( !$containers->length ) {
			// No wrapper? This could be an old parser cache entry, or perhaps the
			// OutputPage contained something that was not generated by the parser.
			// Try using the <body> as the container.
			$containers = $xpath->query( 'body' );
			if ( !$containers->length ) {
				throw new Exception( "HTML lacked body element even though we put it there ourselves" );
			}
		}

		$container = $containers->item( 0 );
		$containerChild = $container->firstChild;
		$firstHeading = reset( $headings );
		$sectionNumber = 0;
		$sectionBody = $this->createSectionBodyElement( $doc, $sectionNumber, false );

		while ( $containerChild ) {
			$node = $containerChild;
			$containerChild = $containerChild->nextSibling;

			// If we've found a top level heading, insert the previous section if
			// necessary and clear the container div.
			// Note well the use of DOMNode#nodeName here. Only DOMElement defines
			// DOMElement#tagName.  So, if there's trailing text - represented by
			// DOMText - then accessing #tagName will trigger an error.
			if ( $firstHeading && $node->nodeName === $firstHeading->nodeName ) {
				// The heading we are transforming is always 1 section ahead of the
				// section we are currently processing
				$this->prepareHeading( $doc, $node, $sectionNumber + 1, $this->scriptsEnabled );
				if ( $sectionBody->hasChildNodes() ) {
					// Apply transformations to the section body
					$this->filterContentInSection( $sectionBody, $doc, $sectionNumber, $transformOptions );
				}
				// Insert the previous section body and reset it for the new section
				$container->insertBefore( $sectionBody, $node );

				if ( $sectionNumber === 0 ) {
					if ( $this->isTOCEnabled ) {
						// Insert table of content placeholder which will be progressively enhanced via JS
						$toc = $doc->createElement( 'div' );
						$toc->setAttribute( 'id', 'toc' );
						$toc->setAttribute( 'class', 'toc-mobile' );
						$tocHeading = $doc->createElement( 'h2', wfMessage( 'toc' )->text() );
						$toc->appendChild( $tocHeading );
						$sectionBody->appendChild( $toc );
					}
					if ( $transformOptions[ self::SHOW_FIRST_PARAGRAPH_BEFORE_INFOBOX ] ) {
						$this->moveFirstParagraphBeforeInfobox( $sectionBody, $doc );
					}
				}
				$sectionNumber += 1;
				$sectionBody = $this->createSectionBodyElement( $doc, $sectionNumber, $this->scriptsEnabled );
				continue;
			}

			// If it is not a top level heading, keep appending the nodes to the
			// section body container.
			$sectionBody->appendChild( $node );
		}

		// If the document had the lead section only:
		if ( $sectionNumber == 0 && $transformOptions[ self::SHOW_FIRST_PARAGRAPH_BEFORE_INFOBOX ] ) {
			$this->moveFirstParagraphBeforeInfobox( $sectionBody, $doc );
		}

		if ( $sectionBody->hasChildNodes() ) {
			// Apply transformations to the last section body
			$this->filterContentInSection( $sectionBody, $doc, $sectionNumber, $transformOptions );
		}
		// Append the last section body.
		$container->appendChild( $sectionBody );
	}

	/**
	 * Prepare section headings, add required classes and onclick actions
	 *
	 * @param DOMDocument $doc
	 * @param DOMElement $heading
	 * @param integer $sectionNumber
	 * @param bool $isCollapsible
	 */
	private function prepareHeading( DOMDocument $doc, $heading, $sectionNumber, $isCollapsible ) {
		$className = $heading->hasAttribute( 'class' ) ? $heading->getAttribute( 'class' ) . ' ' : '';
		$heading->setAttribute( 'class', $className . 'section-heading' );
		if ( $isCollapsible ) {
			$heading->setAttribute( 'onclick', 'javascript:mfTempOpenSection(' . $sectionNumber . ')' );
		}

		// prepend indicator - this avoids a reflow by creating a placeholder for a toggling indicator
		$indicator = $doc->createElement( 'div' );
		$indicator->setAttribute( 'class', MobileUI::iconClass( '', 'element', 'indicator' ) );
		$heading->insertBefore( $indicator, $heading->firstChild );
	}

	/**
	 * Creates a Section body element
	 *
	 * @param DOMDocument $doc
	 * @param int $sectionNumber
	 * @param bool $isCollapsible
	 *
	 * @return DOMElement
	 */
	private function createSectionBodyElement( DOMDocument $doc, $sectionNumber, $isCollapsible ) {
		$sectionClass = 'mf-section-' . $sectionNumber;
		if ( $isCollapsible ) {
			// TODO: Probably good to rename this to the more generic 'section'.
			// We have no idea how the skin will use this.
			$sectionClass .= ' ' . self::STYLE_COLLAPSIBLE_SECTION_CLASS;
		}

		// FIXME: The class `/mf\-section\-[0-9]+/` is kept for caching reasons
		// but given class is unique usage is discouraged. [T126825]
		$sectionBody = $doc->createElement( 'div' );
		$sectionBody->setAttribute( 'class', $sectionClass );
		$sectionBody->setAttribute( 'id', 'mf-section-' . $sectionNumber );
		return $sectionBody;
	}

	/**
	 * Marks the headings as editable by adding the <code>in-block</code>
	 * class to each of them, if it hasn't already been added.
	 *
	 * FIXME: <code>in-block</code> isn't semantic in that it isn't
	 * obviously connected to being editable.
	 *
	 * @param [DOMElement] $headings
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
	 * Gets all headings in the document in rank order.
	 *
	 * Note well that the rank order is defined by the
	 * <code>MobileFormatter#topHeadingTags</code> property.
	 *
	 * @param DOMDocument $doc
	 * @return array A two-element array where the first is the highest
	 *  rank headings and the second is all other headings
	 */
	private function getHeadings( DOMDocument $doc ) {
		$headings = $subheadings = [];

		foreach ( $this->topHeadingTags as $tagName ) {
			$elements = $doc->getElementsByTagName( $tagName );

			if ( !$elements->length ) {
				continue;
			}

			// TODO: Under HHVM 3.6.6, `iterator_to_array` returns a one-indexed
			// array rather than a zero-indexed array.  Create a minimal test case
			// and raise a bug.
			// FIXME: Remove array_values when HHVM bug fixed.
			$elements = array_values( iterator_to_array( $elements ) );

			if ( !$headings ) {
				$headings = $elements;
			} else {
				$subheadings = array_merge( $subheadings, $elements );
			}
		}

		return [ $headings, $subheadings ];
	}
}
