var
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	mw = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	// These both have heavy dependencies on jQuery so must be loaded later.
	PageHTMLParser, util,
	sinon = require( 'sinon' ),
	PARSER_OUTPUT = '<div class="mw-parser-output">';
/* eslint-disable one-var */
/** @type {sinon.SinonSandbox} */ var sandbox;
/** @type {typeof import('../../../src/mobile.startup/Page')} */ var stubPage;
/** @type {typeof import('../../../src/mobile.startup/Page')} */ var mobileTocPage;
/** @type {typeof import('../../../src/mobile.startup/Page')} */ var desktopPage;
/** @type {typeof import('../../../src/mobile.startup/Page')} */ var sectionPage;
/* eslint-enable one-var */

QUnit.module( 'MobileFrontend PageHTMLParser.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		mw.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );

		PageHTMLParser = require( '../../../src/mobile.startup/PageHTMLParser' );
		util = require( '../../../src/mobile.startup/util' );

		stubPage = new PageHTMLParser(
			util.parseHTML( PARSER_OUTPUT ).html(
				'<p>lead</p><div class="ambox">a0</div>'
			)
		);
		mobileTocPage = new PageHTMLParser(
			util.parseHTML( PARSER_OUTPUT ).html( `
				<div class="mf-section-0">
					<div class="ambox">a0</div>
					<p>lead</p>
				</div>
				<h2 class="section-heading">1</h2>
				<div class="mf-section-1">
					<div class="ambox">a1</div>
					<h3>1.1</h3>
					<div class="ambox">a1.1</div>
				</div>
			` )
		);
		desktopPage = new PageHTMLParser(
			util.parseHTML( PARSER_OUTPUT ).html( `
				<p>lead</p>
				<div class="ambox">a0</div>
				<h2>1</h2>
				<div class="ambox">a1</div>
				<h3>1.1</h3>
				<div class="ambox">a1.1</div>
			` )
		);
		sectionPage = new PageHTMLParser(
			util.parseHTML( PARSER_OUTPUT ).html( `
				<div class="mf-section-0">
					<p>lead</p>
					<div class="ambox">a0</div>
				</div>

				<h2 class="section-heading">1</h2>
				<div class="mf-section-1">
					<div class="ambox">a1</div>

					<h3>1.1</h3>
					<div class="ambox">a1.1</div>

					<h4>1.1.1</h4>
					<div class="ambox">a1.1.1</div>

					<h4>1.1.2</h4>
					<div class="ambox">a1.1.2</div>

					<h3>1.2</h3>
					<div class="ambox">a1.1</div>
				</div>

				<h2 class="section-heading">2</h2>
				<div class="mf-section-6"><div class="ambox">a2</div></div>

				<h2 class="section-heading">3</h2>
				<div class="mf-section-7"><div class="ambox">a3</div></div>

				<h2 class="section-heading">Section with nested Ambox</h2>
				<div class="mf-section-8">
					<div class="ambox">
						<p>nested-ambox-parent,</p>
						<div class="ambox">nested-ambox-1,</div>
						<div class="ambox">nested-ambox-2</div>
					</div>
				</div>

				<h2 class="section-heading">Sub-section with nested Ambox</h2>
				<div class="mf-section-9">
					<div class="ambox">
						<p>nested-ambox-parent,</p>
						<div class="ambox">nested-ambox-1,</div>
						<div class="ambox">nested-ambox-2</div>
					</div>

					<h3>subsection heading</h3>

					<h3>Another subsection heading</h3>
				</div>
			` ) // end .html()
		); // end new Page();
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#findInSectionLead', function ( assert ) {
	// check desktop page
	[
		[ 0, 'a0', 'lead section' ],
		[ 1, 'a1', 'h2' ],
		[ 2, 'a1.1', 'h3' ],
		[ 3, '', 'h4', 'selector does not match', '.foo' ],
		[ 111, '', 'Non-existent section' ]
	].forEach( function ( params, i ) {
		var
			section = params[0],
			expect = params[1],
			test = params[2],
			selector = params[3] || '.ambox';
		assert.strictEqual(
			desktopPage.findChildInSectionLead( section, selector ).text(),
			expect,
			'Found correct text in desktop test ' + i + ' case: ' + test
		);
	} );
	// check stub
	[
		[ 0, 'a0', 'lead section' ],
		[ 3, '', 'h4', 'selector does not match', '.foo' ],
		[ 111, '', 'Non-existent section' ]
	].forEach( function ( testcase ) {
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
	].forEach( function ( testcase ) {
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
	].forEach( function ( testcase ) {
		assert.strictEqual(
			mobileTocPage.findChildInSectionLead( testcase[0], testcase[3] || '.ambox' ).text(),
			testcase[1],
			'Mobile with table of contents: Found correct text in test case:' + testcase[2]
		);
	} );

	[
		[ 8, '.ambox', /[\s]*nested-ambox-parent,[\s]*nested-ambox-1,\s*nested-ambox-2[\s]*/, 'Nested elements in section' ],
		[ 9, '.ambox', /[\s]*nested-ambox-parent,[\s]*nested-ambox-1,[\s]*nested-ambox-2[\s]*/, 'Nested elements in subsection' ]
	].forEach( function ( testcase ) {
		var result = sectionPage.findChildInSectionLead( testcase[0], testcase[1] );
		sinon.assert.match(
			result.not( result.children() ).text(),
			testcase[2]
		);
	} );

} );

QUnit.test( '#getThumbnails', function ( assert ) {
	var p, textPage, pLegacyUrls, thumbs, pNoViewer, pMetadata, pLazyImages, metadataTable,
		pLazyImagesTypo, pMetadataNested;

	p = new PageHTMLParser(
		util.parseHTML( '<div><a href="/wiki/File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
	);
	textPage = new PageHTMLParser(
		util.parseHTML( '<div></div>' )
	);
	pLegacyUrls = new PageHTMLParser(
		util.parseHTML( '<div><a href="/wikpa/index.php?title=File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
	);
	thumbs = p.getThumbnails();
	pNoViewer = new PageHTMLParser(
		util.parseHTML( '<div><a href="/wikpa/index.php?title=File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box noviewer"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
	);
	pMetadata = new PageHTMLParser(
		util.parseHTML( '<div><a href="/wikpa/index.php?title=File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" class="metadata" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
	);
	pMetadataNested = new PageHTMLParser(
		util.parseHTML( '<div class="noviewer"><a href="/wikpa/index.php?title=File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
	);
	pLazyImages = new PageHTMLParser(
		util.parseHTML( '<div><a href="/wiki/File:Design_portal_logo.jpg" class="image"><span class="lazy-image-placeholder" style="width: 28px;height: 28px;" data-src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Design_portal_logo.jpg/28px-Design_portal_logo.jpg" data-alt="icon" data-width="28" data-height="28" data-class="noviewer">&nbsp;</span></a></div>' )
	);
	pLazyImagesTypo = new PageHTMLParser(
		util.parseHTML( '<div><a href="/wiki/File:Design_portal_logo.jpg" class="image"><span class="lazy-image-placeholder" style="width: 28px;height: 28px;" data-src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Design_portal_logo.jpg/28px-Design_portal_logo.jpg" data-alt="icon" data-width="28" data-height="28" data-class="wot noviewerz bar">&nbsp;</span></a></div>' )
	);
	metadataTable = new PageHTMLParser(
		util.parseHTML( '<div><table class="plainlinks metadata ambox ambox-content ambox-Unreferenced" role="presentation"><tr><td class="mbox-image"><div style="width:52px"><a href="/wiki/File:Question_book-new.svg" class="image"><span class="lazy-image-placeholder" style="width: 50px;height: 39px;" data-src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Question_book-new.svg/50px-Question_book-new.svg.png" data-alt="" data-width="50" data-height="39" data-srcset="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Question_book-new.svg/75px-Question_book-new.svg.png 1.5x, https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Question_book-new.svg/100px-Question_book-new.svg.png 2x"> </span></a></div></td></tr></table>' )
	);

	assert.strictEqual( thumbs.length, 1, 'Found expected number of thumbnails.' );
	assert.strictEqual( thumbs[0].getFileName(), 'File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg',
		'Found expected filename.' );

	thumbs = textPage.getThumbnails();
	assert.strictEqual( thumbs.length, 0, 'This page has no thumbnails.' );

	thumbs = pLegacyUrls.getThumbnails();
	assert.strictEqual( thumbs.length, 1, 'Found expected number of thumbnails.' );
	assert.strictEqual( thumbs[0].getFileName(), 'File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg',
		'Found expected filename.' );

	thumbs = pNoViewer.getThumbnails();
	assert.strictEqual( thumbs.length, 0, 'This page has no thumbnails.' );

	thumbs = pMetadata.getThumbnails();
	assert.strictEqual( thumbs.length, 0, 'This page has no thumbnails.' );

	thumbs = pMetadataNested.getThumbnails();
	assert.strictEqual( thumbs.length, 0,
		'Images inside a container with the class are not included. Images inside tables for example.' );

	thumbs = pLazyImages.getThumbnails();
	assert.strictEqual( thumbs.length, 0,
		'Consider whether the class is on an image which has not been lazy loaded.' );

	thumbs = metadataTable.getThumbnails();
	assert.strictEqual( thumbs.length, 0,
		'Consider whether the lazy loaded image is inside a .metadata container.' );

	thumbs = pLazyImagesTypo.getThumbnails();
	assert.strictEqual( thumbs.length, 1,
		'Thumbnail found if there is a typo.' );
} );
