<?php

use MobileFrontend\Transforms\MoveLeadParagraphTransform;
use Wikimedia\TestingAccessWrapper;

/**
 * @group MobileFrontend
 */
class MoveLeadParagraphTransformTest extends \MediaWikiUnitTestCase {
	public static function wrap( $html ) {
		return "<!DOCTYPE HTML>
<html><body>$html</body></html>
";
	}

	public static function wrapSection( $html ) {
		return "<section>$html</section>";
	}

	/**
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::identifyInfoboxElement
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::matchElement
	 * @dataProvider provideIdentifyInfoboxElement
	 */
	public function testIdentifyInfoboxElement( string $html, ?string $expected, string $msg ) {
		$doc = new DOMDocument();
		$doc->loadHTML( self::wrap( $html ), LIBXML_NOERROR );
		$xPath = new DOMXPath( $doc );
		$bodyNode = $doc->getElementsByTagName( 'body' )->item( 0 );

		$wrappedInfobox = $doc->createElement( 'table' );
		$wrappedInfobox->setAttribute( 'class', 'infobox' );
		$stack = $doc->createElement( 'div' );
		$stack->setAttribute( 'class', 'mw-stack' );
		$stack->appendChild( $wrappedInfobox );
		$pNode = $doc->createElement( 'p' );
		$infobox = $doc->createElement( 'table' );
		$infobox->setAttribute( 'class', 'infobox' );
		$anotherInfobox = $doc->createElement( 'table' );
		$anotherInfobox->setAttribute( 'class', 'infobox' );
		$section = $doc->createElement( 'div' );
		$section->appendChild( $anotherInfobox );

		$transform = TestingAccessWrapper::newFromObject(
			new MoveLeadParagraphTransform( 'DummyTitle', 1 )
		);

		$infobox = $transform->identifyInfoboxElement( $xPath, $bodyNode );

		$this->assertEquals(
			$expected,
			$infobox ? $infobox->getNodePath() : null,
			$msg
		);
	}

	public function provideIdentifyInfoboxElement() : array {
		return [
			[
				'html' => '<p></p>',
				'expected' => null,
				'msg' => 'Paragraph only'
			],
			[
				'html' => '<p></p><div class="infobox"></div>',
				'expected' => '/html/body/div',
				'msg' => 'Simple infobox'
			],
			[
				'html' => '<p></p><div class="mw-stack"><table class="infobox"></table></div>',
				'expected' => '/html/body/div',
				'msg' => 'Infobox wrapped in an known container'
			],
			[
				'html' => '<p></p><div><table class="infobox"></table></div>',
				'expected' => '/html/body/div/table',
				'msg' => 'Infobox wrapped in an unknown container'
			],
			[
				'html' => '<p></p><div class="thumb tright"></div>',
				'expected' => '/html/body/div',
				'msg' => 'Thumbnail'
			],
			[
				'html' => '<p></p><figure></figure>',
				'expected' => '/html/body/figure',
				'msg' => 'Thumbnail (Parsoid)'
			],
		];
	}

	/**
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::apply
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::moveFirstParagraphBeforeInfobox
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::hasNoNonEmptyPrecedingParagraphs
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::identifyInfoboxElement
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::identifyLeadParagraph
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::isNotEmptyNode
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::isNonLeadParagraph
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::isPreviousSibling
	 */
	public function testApplySectionSecondSectionShouldBeIgnored() {
		$infobox = '<table class="infobox">1</table>';
		$paragraph = '<p><b>First paragraph</b> <span> with info that links to a '
			. PHP_EOL . ' <a href="">Page</a></span> and some more content</p>';

		$transform = new MoveLeadParagraphTransform( 'A', 1 );
		libxml_use_internal_errors( true );
		$doc = new DOMDocument();
		$doc->loadHTML( self::wrap(
			self::wrapSection( 'First' ) . self::wrapSection( $infobox . $paragraph )
		) );
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals(
			self::wrap( self::wrapSection( 'First' ) . self::wrapSection( $infobox . $paragraph ) ),
			$doc->saveHTML(),
			"The second section should be ignored"
		);
		libxml_clear_errors();
	}

	/**
	 * @param string $html
	 * @param string $expected
	 * @param string $reason
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::apply
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::moveFirstParagraphBeforeInfobox
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::hasNoNonEmptyPrecedingParagraphs
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::identifyInfoboxElement
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::identifyLeadParagraph
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::isNotEmptyNode
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::isNonLeadParagraph
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::isPreviousSibling
	 * @dataProvider provideTransform
	 */
	public function testTransform(
		$html,
		$expected,
		$reason = 'Move lead paragraph unexpected result'
	) {
		$transform = new MoveLeadParagraphTransform( 'A', 1 );
		libxml_use_internal_errors( true );
		$doc = new DOMDocument();
		$doc->loadHTML( self::wrap( self::wrapSection( $html ) ) );
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals(
			self::wrap( self::wrapSection( $expected ) ),
			$doc->saveHTML(), $reason
		);
		libxml_clear_errors();
	}

	public function provideTransform() {
		$divinfobox = '<div class="infobox infobox_v3">infobox</div>';
		$hatnote = '<div role="note" class="hatnote navigation-not-searchable">hatnote.</div>';
		$infobox = '<table class="infobox">1</table>';
		$coordinates = '<span id="coordinates"><span>0;0</span></span>';
		$templateStyles = '<style data-mw-deduplicate="TemplateStyles:r123">CSS</style>';
		$wrappedTemplateStyles = "<p>$templateStyles</p>";
		$wrappedTemplateStylesAndContent = "<p>Content $templateStyles</p>";
		$wrappedCoordsWithTrailingWhitespace = '<p><span><span id="coordinates">not empty</span>'
		  . '</span>    </p>';
		$anotherInfobox = '<table class="infobox">2</table>';
		$stackInfobox = "<div class=\"mw-stack\">$infobox</div>";
		$emptyStack = '<div class="mw-stack">Empty</div>';
		$emptypelt = '<p class="mw-empty-elt"></p>';
		$multiStackInfobox = "<div class=\"mw-stack\">$infobox$anotherInfobox</div>";
		$paragraph = '<p><b>First paragraph</b> <span> with info that links to a '
			. PHP_EOL . ' <a href="">Page</a></span> and some more content</p>';
		$emptyP = '<p></p>';
		// The $paragraphWithWhitespacesOnly has not only whitespaces (space,new line,tab)
		// , but also contains a span with whitespaces
		$paragraphWithWhitespacesOnly = '<p class="someParagraphClass">  	'
			. PHP_EOL . "<span> 	\r\n</span></p>";
		$collapsibleInfobox = '<table class="collapsible"><table class="infobox"></table></table>';
		$collapsibleNotInfobox = '<table class="collapsible">'
			. '<table class="mf-test-infobox"></table></table>';

		return [
			[
				"$hatnote$hatnote$emptypelt $wrappedCoordsWithTrailingWhitespace$infobox<p>one</p>",
				"$hatnote$hatnote$emptypelt $wrappedCoordsWithTrailingWhitespace<p>one</p>$infobox",
				'coordinates can be wrapped (T242447)'
			],
			[
				"$wrappedTemplateStyles$infobox<p>one</p>",
				"$wrappedTemplateStyles<p>one</p>$infobox",
				'wrapped template styles'
			],
			[
				"$infobox$wrappedTemplateStylesAndContent",
				"$wrappedTemplateStylesAndContent$infobox",
				'lead paragraph has template styles'
			],
			[
				"$infobox<p>One $templateStyles$coordinates</p>",
				"<p>One $templateStyles$coordinates</p>$infobox",
				'lead paragraph has template styles and coordinates'
			],
			[
				"$divinfobox<p>one</p>",
				"<p>one</p>$divinfobox",
				'infoboxes can be divs',
			],
			[
				"$collapsibleNotInfobox<p>one</p>",
				"$collapsibleNotInfobox<p>one</p>",
				'Collapsible mf-infoboxes are not moved.'
			],
			[
				"$collapsibleInfobox<p>one</p>",
				"<p>one</p>$collapsibleInfobox",
				'Collapsible infoboxes are moved.'
			],
			[
				'<div><table class="mf-infobox"></table></div><p>one</p>',
				'<div><table class="mf-infobox"></table></div><p>one</p>'
			],
			[
				"$infobox$paragraph",
				"$paragraph$infobox",
			],
			[
				"$emptyP$emptyP$infobox$paragraph",
				"$emptyP$emptyP$paragraph$infobox",
				'Empty paragraphs are ignored'
			],
			[
				"$paragraphWithWhitespacesOnly$infobox$paragraph",
				"$paragraphWithWhitespacesOnly$paragraph$infobox",
				'T199282: lead paragraph should move when there is empty paragraph before infobox'
			],
			[
				"$infobox$paragraphWithWhitespacesOnly",
				"$infobox$paragraphWithWhitespacesOnly",
				'T199282: the empty paragraph should not be treated as lead paragraph'
			],
			[
				"$paragraph$emptyP$infobox$paragraph",
				"$paragraph$emptyP$infobox$paragraph",
				'T188825: Infobox has to be first non-empty element'
			],
			[
				"$stackInfobox$paragraph",
				"$paragraph$stackInfobox",
				'T170006: If the infobox is wrapped in a known container it can be moved',
			],
			[
				"$emptyStack$paragraph",
				"$emptyStack$paragraph",
				'T170006: However if no infobox inside don\'t move.'
			],
			[
				"$infobox$emptyStack$paragraph",
				"$paragraph$infobox$emptyStack",
				'T170006: When a stack and an infobox, ignore mw-stack',
			],
			[
				"$multiStackInfobox$paragraph",
				"$paragraph$multiStackInfobox",
				'T170006: Multiple infoboxes will also be moved'
			],
			[
				"$infobox<p>$coordinates</p><p>First paragraph</p>",
				"<p>First paragraph</p>$infobox<p>$coordinates</p>",
				"Paragraph with just coordinates in it is ignored"
			],
			[
				"$infobox<p>First paragraph with $coordinates</p><p>Second paragraph</p>",
				"<p>First paragraph with $coordinates</p>$infobox<p>Second paragraph</p>",
				"Paragraph with coordinates in it is still the first paragraph"
			],
			[
				"$infobox<p><span>foo</span>$coordinates</p><p>Second paragraph</p>",
				"<p><span>foo</span>$coordinates</p>$infobox<p>Second paragraph</p>",
				"Paragraph with non-empty nested child and coordinates in it is still the first paragraph"
			],
			[
				"$infobox<p>Lead <span>$coordinates</span> para</p><p>Not lead</p>",
				"<p>Lead <span>$coordinates</span> para</p>$infobox<p>Not lead</p>",
				"Paragraph with nested coordinates is still the first paragraph"
			]
		];
	}
}
