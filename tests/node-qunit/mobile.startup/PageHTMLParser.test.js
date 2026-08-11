const
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	mw = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	// These both have heavy dependencies on jQuery so must be loaded later.
	sinon = require( 'sinon' ),
	PARSER_OUTPUT = '<div class="mw-parser-output">';
let fixture,
	PageHTMLParser, util;

/** @type {sinon.SinonSandbox} */ let sandbox;
/* eslint-disable jsdoc/valid-types */
/** @type {typeof import('../../../src/mobile.startup/Page')} */ let stubPage;
/** @type {typeof import('../../../src/mobile.startup/Page')} */ let mobileTocPage;
/** @type {typeof import('../../../src/mobile.startup/Page')} */ let sectionPage;
/* eslint-enable jsdoc/valid-types */

QUnit.module( 'MobileFrontend PageHTMLParser.js', {
	beforeEach: function () {
		if ( fixture ) {
			fixture.remove();
		}
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		mw.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );

		PageHTMLParser = require( '../../../src/mobile.startup/PageHTMLParser' );
		util = require( '../../../src/mobile.startup/util' );

		global.mw.util.percentDecodeFragment = function ( decoded ) {
			// We're not testing percentDecodeFragment here, so only test with decoded values
			return decoded;
		};

		stubPage = new PageHTMLParser(
			util.parseHTML( PARSER_OUTPUT ).html(
				'<p>lead</p><div class="ambox">a0</div>'
			)
		);
		mobileTocPage = new PageHTMLParser(
			util.parseHTML( PARSER_OUTPUT ).html( `
				<section class="mf-section-0">
					<div class="ambox">a0</div>
					<p>lead</p>
				</section>
				<div class="mw-heading section-heading">
					<h2>1</h2>
				</div>
				<section class="mf-section-1">
					<div class="ambox">a1</div>
					<div class="mw-heading">
						<h3>1.1</h3>
					</div>
					<div class="ambox">a1.1</div>
				</section>
			` )
		);
		sectionPage = new PageHTMLParser(
			util.parseHTML( PARSER_OUTPUT ).html( `
				<section class="mf-section-0">
					<p>lead</p>
					<div class="ambox">a0</div>
				</section>
				<div class="mw-heading section-heading">
					<h2>1</h2>
				</div>
				<section class="mf-section-1">
					<div class="ambox">a1</div>
					<div class="mw-heading">
						<h3>1.1</h3>
					</div>
					<div class="ambox">a1.1</div>

					<div class="mw-heading">
						<h4>1.1.1</h4>
					</div>
					<div class="ambox">a1.1.1</div>

					<div class="mw-heading">
						<h4>1.1.2</h4>
					</div>
					<div class="ambox">a1.1.2</div>

					<div class="mw-heading">
						<h3>1.2</h3>
					</div>
					<div class="ambox">a1.1</div>
				</section>

				<div class="mw-heading section-heading">
					<h2>2</h2>
				</div>
				<section class="mf-section-6"><div class="ambox">a2</div></section>
				<div class="mw-heading section-heading">
					<h2>3</h2>
				</div>
				<section class="mf-section-7">
					<div class="ambox">a3</div>
				</section>
				<div class="mw-heading section-heading">
					<h2>Section with nested Ambox</h2>
				</div>
				<section class="mf-section-8">
					<div class="ambox">
						<p>nested-ambox-parent,</p>
						<div class="ambox">nested-ambox-1,</div>
						<div class="ambox">nested-ambox-2</div>
					</div>
				</section>

				<div class="mw-heading section-heading">
					<h2>Sub-section with nested Ambox</h2>
				</div>
				<section class="mf-section-9">
					<div class="ambox">
						<p>nested-ambox-parent,</p>
						<div class="ambox">nested-ambox-1,</div>
						<div class="ambox">nested-ambox-2</div>
					</div>
					<div class="mw-heading">
						<h3>subsection heading</h3>
					</div>
					<div class="mw-heading">
						<h3>Another subsection heading</h3>
					</div>
				</section>
			` ) // end .html()
		); // end new Page();
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#findInSectionLead', ( assert ) => {
	// check stub
	[
		[ 0, 'a0', 'lead section' ],
		[ 3, '', 'h4', 'selector does not match', '.foo' ],
		[ 111, '', 'Non-existent section' ]
	].forEach( ( testcase ) => {
		assert.strictEqual(
			stubPage.findChildInSectionLead( testcase[0], testcase[3] || '.ambox' ).text(),
			testcase[1],
			'Stub: Found correct text in desktop test case:' + testcase[2]
		);
	} );
	// check mobile pages with section wrapping
	[
		[ 0, 'a0', 'lead section' ],
		[ 1, 'a1', 'h2' ],
		[ 2, 'a1.1', 'h3' ],
		[ 3, 'a1.1.1', 'h4' ],
		[ 3, '', 'h4', 'selector does not match', '.foo' ],
		[ 7, 'a3', 'h2 later' ],
		[ 111, '', 'Non-existent section' ]
	].forEach( ( testcase ) => {
		assert.strictEqual(
			sectionPage.findChildInSectionLead( testcase[0], testcase[3] || '.ambox' ).text(),
			testcase[1],
			'Mobile: Found correct text in test case:' + testcase[2]
		);
	} );
	[
		[ 0, 'a0', 'lead section' ],
		[ 1, 'a1', 'h2' ],
		[ 2, 'a1.1', 'h3' ],
		[ 111, '', 'Non-existent section' ]
	].forEach( ( testcase ) => {
		assert.strictEqual(
			mobileTocPage.findChildInSectionLead( testcase[0], testcase[3] || '.ambox' ).text(),
			testcase[1],
			'Mobile with table of contents: Found correct text in test case:' + testcase[2]
		);
	} );

	[
		[ 8, '.ambox', /[\s]*nested-ambox-parent,[\s]*nested-ambox-1,\s*nested-ambox-2[\s]*/, 'Nested elements in section' ],
		[ 9, '.ambox', /[\s]*nested-ambox-parent,[\s]*nested-ambox-1,[\s]*nested-ambox-2[\s]*/, 'Nested elements in subsection' ]
	].forEach( ( testcase ) => {
		const result = sectionPage.findChildInSectionLead( testcase[0], testcase[1] );
		sinon.assert.match(
			result.not( result.children() ).text(),
			testcase[2]
		);
	} );

} );
