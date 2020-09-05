<?php

use MobileFrontend\Transforms\MoveLeadParagraphTransform;

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
	 * @param string $html
	 * @param string $expected
	 * @param string $reason (optional)
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::apply
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::extractLeadIntroduction
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::getLastHatNote
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::moveFirstParagraphUp
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::identifyLeadParagraph
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::isNotEmptyNode
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::isNonLeadParagraph
	 * @dataProvider provideTransform
	 */
	public function testTransform(
		$html,
		$expected,
		$reason = 'Move lead paragraph unexpected result'
	) {
		$transform = new MoveLeadParagraphTransform();
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
		$ambox = '<div class="ambox">Article message box</div>';
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
		$collapsibleInfobox = '<table class="collapsible"><table class="infobox">...</table></table>';
		$collapsibleNotInfobox = '<table class="collapsible">'
			. '<table class="mf-test-infobox">...</table></table>';

		return [
			[
				"$hatnote$hatnote$emptypelt $wrappedCoordsWithTrailingWhitespace$infobox<p>one</p>",
				"$hatnote$hatnote$emptypelt <p>one</p>$wrappedCoordsWithTrailingWhitespace$infobox",
				'coordinates can be wrapped (T242447)'
			],
			[
				"$wrappedTemplateStyles$infobox<p>one</p>",
				"<p>one</p>$wrappedTemplateStyles$infobox",
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
				"<p>one</p>$collapsibleNotInfobox",
				'Collapsible mf-infoboxes are moved.'
			],
			[
				"$collapsibleInfobox<p>one</p>",
				"<p>one</p>$collapsibleInfobox",
				'Collapsible infoboxes are moved.'
			],
			[
				"$infobox$paragraph<ul><li>List</li></ul><ol><li>Another</li></ol>",
				"$paragraph<ul><li>List</li></ul><ol><li>Another</li></ol>$infobox",
				'Paragraph with trailing lists are moved'
			],
			[
				"$infobox<p>one</p><ul><li>List</li></ul><ol><li>Another</li></ol>",
				"<p>one</p><ul><li>List</li></ul><ol><li>Another</li></ol>$infobox",
				'Paragraph with trailing lists are moved'
			],
			[
				"$ambox$infobox<p>one</p>",
				"$ambox<p>one</p>$infobox",
				'ambox stays on top'
			],
			[
				"$hatnote$emptypelt$ambox$infobox<p>one</p>",
				"$hatnote$emptypelt$ambox<p>one</p>$infobox",
				'hatnote, emptyelt & ambox stay on top'
			],
			[
				'<div><table class="mf-infobox">...</table></div><p>one</p>',
				'<p>one</p><div><table class="mf-infobox">...</table></div>'
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
				"$infobox$emptyStack$paragraph",
				"$paragraph$infobox$emptyStack",
				'T170006: Move above stack and infobox',
			],
			[
				"$multiStackInfobox$paragraph",
				"$paragraph$multiStackInfobox",
				'T170006: Move above multiple infoboxes'
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
