/* global $ */
var
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	sinon = require( 'sinon' ),
	sandbox,
	identifyLeadParagraph;

QUnit.module( 'MobileFrontend mobile.editor.overlay/identifyLeadParagraph', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		identifyLeadParagraph = require( '../../../src/mobile.editor.overlay/identifyLeadParagraph' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

// Keep in sync with MoveLeadParagraphTransformTest::provideTransform()
function provideCases() {
	var
		infobox = '<table class="infobox">1</table>',
		coordinates = '<span id="coordinates"><span>0;0</span></span>',
		anotherInfobox = '<table class="infobox">2</table>',
		stackInfobox = `<div class="mw-stack">${infobox}</div>`,
		emptyStack = '<div class="mw-stack">Empty</div>',
		multiStackInfobox = `<div class="mw-stack">${infobox}${anotherInfobox}</div>`,
		paragraph = '<p><b>First paragraph</b> <span> with info that links to a ' +
			'\n <a href="">Page</a></span> and some more content</p>',
		emptyP = '<p></p>',
		// The paragraphWithWhitespacesOnly has not only whitespaces (space,new line,tab)
		// , but also contains a span with whitespaces
		paragraphWithWhitespacesOnly = '<p class="someParagraphClass">  \t' +
			'\n<span> \t\r\n</span></p>',
		collapsibleInfobox = '<table class="collapsible"><table class="infobox"></table></table>',
		collapsibleNotInfobox = '<table class="collapsible">' +
			'<table class="mf-test-infobox"></table></table>';

	return [
		[
			`${collapsibleNotInfobox}<p>one</p>`,
			'p',
			'Collapsible mf-infoboxes are not moved.'
		],
		[
			`${collapsibleInfobox}<p>one</p>`,
			'p',
			'Collapsible infoboxes are moved.'
		],
		[
			'<div><table class="mf-infobox"></table></div><p>one</p>',
			'p'
		],
		[
			`${infobox}${paragraph}`,
			'p'
		],
		[
			`${emptyP}${emptyP}${infobox}${paragraph}`,
			'p:last-of-type',
			'Empty paragraphs are ignored'
		],
		[
			`${paragraphWithWhitespacesOnly}${infobox}${paragraph}`,
			'p:last-of-type',
			'T199282: lead paragraph should move when there is empty paragraph before infobox'
		],
		[
			`${infobox}${paragraphWithWhitespacesOnly}`,
			null,
			'T199282: the empty paragraph should not be treated as lead paragraph'
		],
		[
			`${paragraph}${emptyP}${infobox}${paragraph}`,
			'p:first-of-type',
			'T188825: Infobox has to be first non-empty element'
		],
		[
			`${stackInfobox}${paragraph}`,
			'p',
			'T170006: If the infobox is wrapped in a known container it can be moved'
		],
		[
			`${emptyStack}${paragraph}`,
			'p',
			'T170006: However if no infobox inside don\'t move.'
		],
		[
			`${infobox}${emptyStack}${paragraph}`,
			'p',
			'T170006: When a stack and an infobox, ignore mw-stack'
		],
		[
			`${multiStackInfobox}${paragraph}`,
			'p',
			'T170006: Multiple infoboxes will also be moved'
		],
		[
			`${infobox}<p>${coordinates}</p><p>First paragraph</p>`,
			'p:last-of-type',
			'Paragraph with just coordinates in it is ignored'
		],
		[
			`${infobox}<p>First paragraph with ${coordinates}</p><p>Second paragraph</p>`,
			'p:first-of-type',
			'Paragraph with coordinates in it is still the first paragraph'
		],
		[
			`${infobox}<p><span>foo</span>${coordinates}</p><p>Second paragraph</p>`,
			'p:first-of-type',
			'Paragraph with non-empty nested child and coordinates in it is still the first paragraph'
		],
		[
			`${infobox}<p>Lead <span>${coordinates}</span> para</p><p>Not lead</p>`,
			'p:first-of-type',
			'Paragraph with nested coordinates is still the first paragraph'
		]
	];
}

QUnit.test( 'identifyLeadParagraph', function ( assert ) {
	var i, html, expectedSel, message, $dom, expectedNode,
		cases = provideCases();

	for ( i = 0; i < cases.length; i++ ) {
		[ html, expectedSel, message ] = cases[i];
		$dom = $( '<section>' ).html( html );
		expectedNode = expectedSel ? $dom.find( expectedSel )[0] : null;

		assert.strictEqual(
			expectedNode,
			identifyLeadParagraph( $dom ),
			message
		);
	}
} );
