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
/** @type {typeof import('../../../src/mobile.startup/Page')} */ let desktopPage;
/** @type {typeof import('../../../src/mobile.startup/Page')} */ let sectionPage;
/* eslint-enable jsdoc/valid-types */

QUnit.module( 'MobileFrontend PageHTMLParser.js', {
	beforeEach: function () {
		if ( fixture ) {
			fixture.remove();
		}
		sandbox = sinon.sandbox.create();
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

QUnit.test( '#findInSectionLead', ( assert ) => {
	// check desktop page
	[
		[ 0, 'a0', 'lead section' ],
		[ 1, 'a1', 'h2' ],
		[ 2, 'a1.1', 'h3' ],
		[ 3, '', 'h4', 'selector does not match', '.foo' ],
		[ 111, '', 'Non-existent section' ]
	].forEach( ( params, i ) => {
		const
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

QUnit.test( '#getThumbnail', ( assert ) => {
	// Valid anchor.
	const $container = util.parseHTML( '<div><a href="/wiki/File:Design_portal_logo.jpg" class="image"><span class="lazy-image-placeholder" style="width: 28px;height: 28px;" data-src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Design_portal_logo.jpg/28px-Design_portal_logo.jpg" data-alt="icon" data-width="28" data-height="28" data-class="thumbimage">&nbsp;</span></a></div>' );
	const parser = new PageHTMLParser( $container );
	const thumb = parser.getThumbnail( $container.find( PageHTMLParser.THUMB_SELECTOR ) );
	assert.notStrictEqual( thumb, null, 'Thumbnail found if valid.' );
	assert.strictEqual( thumb.getFileName(), 'File:Design_portal_logo.jpg', 'Thumbnail found if valid.' );

	// Valid anchor with ?uselang=fa
	const $containerUseLang = util.parseHTML( '<div><a href="/wiki/File:Design_portal_logo.jpg?uselang=fa" class="image"><span class="lazy-image-placeholder" style="width: 28px;height: 28px;" data-src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Design_portal_logo.jpg/28px-Design_portal_logo.jpg" data-alt="icon" data-width="28" data-height="28" data-class="thumbimage">&nbsp;</span></a></div>' );
	const parserUseLang = new PageHTMLParser( $containerUseLang );
	const thumbUseLang = parserUseLang.getThumbnail( $containerUseLang.find( PageHTMLParser.THUMB_SELECTOR ) );
	assert.notStrictEqual( thumbUseLang, null, 'Thumbnail found if valid.' );
	assert.strictEqual( thumbUseLang.getFileName(), 'File:Design_portal_logo.jpg', 'Thumbnail found if valid.' );

	// Valid anchor with legacy URL
	const $containerLegacy = util.parseHTML( '<div><a href="/w/index.php?debug=1&title=File:Design_portal_logo.jpg&uselang=fa" class="image"><span class="lazy-image-placeholder" style="width: 28px;height: 28px;" data-src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Design_portal_logo.jpg/28px-Design_portal_logo.jpg" data-alt="icon" data-width="28" data-height="28" data-class="thumbimage">&nbsp;</span></a></div>' );
	const parserLegacy = new PageHTMLParser( $containerLegacy );
	const thumbLegacy = parserLegacy.getThumbnail( $containerLegacy.find( PageHTMLParser.THUMB_SELECTOR ) );
	assert.notStrictEqual( thumbLegacy, null, 'Thumbnail found if valid.' );
	assert.strictEqual( thumbLegacy.getFileName(), 'File:Design_portal_logo.jpg', 'Thumbnail found if valid.' );

	// Anchor with 'metadata' class should be excluded.
	const $containerMetadata = util.parseHTML( '<div><a href="/wiki/File:Design_portal_logo.jpg" class="image"><span class="lazy-image-placeholder" style="width: 28px;height: 28px;" data-src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Design_portal_logo.jpg/28px-Design_portal_logo.jpg" data-alt="icon" data-width="28" data-height="28" data-class="thumbimage noviewer">&nbsp;</span></a></div>' );
	const parserMetadata = new PageHTMLParser( $containerMetadata );
	const thumbMetadata = parserMetadata.getThumbnail(
		$containerMetadata.find( PageHTMLParser.THUMB_SELECTOR )
	);
	assert.strictEqual( thumbMetadata, null, 'Thumbnail not found if invalid.' );
} );

QUnit.test( '#getThumbnails', ( assert ) => {
	let thumbs;
	const p = new PageHTMLParser(
		util.parseHTML( '<div><a href="/wiki/File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
	);
	const textPage = new PageHTMLParser(
		util.parseHTML( '<div></div>' )
	);
	const pLegacyUrls = new PageHTMLParser(
		util.parseHTML( '<div><a href="/wikpa/index.php?title=File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
	);
	thumbs = p.getThumbnails();
	const pNoViewer = new PageHTMLParser(
		util.parseHTML( '<div><a href="/wikpa/index.php?title=File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box noviewer"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
	);
	const pMetadata = new PageHTMLParser(
		util.parseHTML( '<div><a href="/wikpa/index.php?title=File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" class="metadata" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
	);
	const pMetadataNested = new PageHTMLParser(
		util.parseHTML( '<div class="noviewer"><a href="/wikpa/index.php?title=File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
	);
	const pLazyImages = new PageHTMLParser(
		util.parseHTML( '<div><a href="/wiki/File:Design_portal_logo.jpg" class="image"><span class="lazy-image-placeholder" style="width: 28px;height: 28px;" data-src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Design_portal_logo.jpg/28px-Design_portal_logo.jpg" data-alt="icon" data-width="28" data-height="28" data-class="noviewer">&nbsp;</span></a></div>' )
	);
	const pLazyImagesTypo = new PageHTMLParser(
		util.parseHTML( '<div><a href="/wiki/File:Design_portal_logo.jpg" class="image"><span class="lazy-image-placeholder" style="width: 28px;height: 28px;" data-src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Design_portal_logo.jpg/28px-Design_portal_logo.jpg" data-alt="icon" data-width="28" data-height="28" data-class="wot noviewerz bar">&nbsp;</span></a></div>' )
	);
	const metadataTable = new PageHTMLParser(
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

QUnit.test( '#getLanguages', ( assert ) => {
	const html = `<div id="p-lang">
		<h4>Languages</h4>
		<section>
			<ul class="minerva-languages">
				<li class="interlanguage-link interwiki-fr mw-list-item">
					<a href="https://fr.wikipedia.org/wiki/Tyrannosaurus"
						data-title="Tyrannosaurus"
						data-language-local-name="French"
						title="Tyrannosaurus – French"
						lang="fr" hreflang="fr" class="interlanguage-link-target"><span>Français</span></a>
				</li>
			</ul>
		</section>
	 </div>
	`;
	fixture = document.createElement( 'div' );
	fixture.innerHTML = html;
	global.document.body.appendChild( fixture );

	const p = new PageHTMLParser( util.parseHTML( '' ) );
	const langs = p.getLanguages( 'Foo' );
	assert.strictEqual( langs.languages[ 0 ].title, 'Tyrannosaurus', 'Expected title' );
	assert.strictEqual( langs.languages[ 0 ].langname, 'French', 'Expected language' );
	assert.strictEqual( langs.languages[ 0 ].autonym, 'Français', 'Expected autonym' );
} );

QUnit.test( '#getLanguages (no hyphen)', ( assert ) => {
	const html = `<div id="p-lang">
		<h4>Languages</h4>
		<section>
			<ul class="minerva-languages">
				<li class="interlanguage-link interwiki-fr mw-list-item">
					<a href="https://fr.wikipedia.org/wiki/Tyrannosaurus"
						data-title="Tyrannosaurus"
						title="Tyrannosaurus"
						lang="fr" hreflang="fr" class="interlanguage-link-target"><span>Français</span></a>
				</li>
			</ul>
		</section>
	 </div>
	`;
	fixture = document.createElement( 'div' );
	fixture.innerHTML = html;
	global.document.body.appendChild( fixture );

	const p = new PageHTMLParser( util.parseHTML( '' ) );
	const langs = p.getLanguages( 'Foo' );
	assert.strictEqual( langs.languages[ 0 ].title, 'Tyrannosaurus', 'Expected title' );
	assert.strictEqual( langs.languages[ 0 ].autonym, 'Français', 'Expected autonym' );
	assert.strictEqual( langs.languages[ 0 ].langname, 'Français', 'Language falls back to autonym when not available' );
} );

QUnit.test( '#getLanguages (T349000)', ( assert ) => {
	const html = `<div id="p-lang">
		<h4>Languages</h4>
		<section>
			<ul id="p-variants" class="minerva-languages"></ul>
			<ul class="minerva-languages">
			  <li class="interlanguage-link "><a href="https://ar.wikipedia.org/wiki/%D9%85%D9%87%D9%85%D8%A9:_%D9%85%D8%B3%D8%AA%D8%AD%D9%8A%D9%84%D8%A9_-_%D8%AA%D9%82%D8%AF%D9%8A%D8%B1_%D8%A7%D9%84%D9%85%D9%88%D8%B6%D8%B9_%D8%A7%D9%84%D8%AC%D8%B2%D8%A1_%D8%A7%D9%84%D8%A3%D9%88%D9%84" title="مهمة: مستحيلة - تقدير الموضع الجزء الأول – Arabic" lang="ar" hreflang="ar" class="interlanguage-link-target"><span>العربية</span></a></li>
			  <li class="interlanguage-link "><a href="https://az.wikipedia.org/wiki/Qeyri-m%C3%BCmk%C3%BCn_missiya_%E2%80%93_%C3%96l%C3%BCl%C9%99rin_Hesab%C4%B1:_Birinci_Hiss%C9%99" title="Qeyri-mümkün missiya – Ölülərin Hesabı: Birinci Hissə – Azerbaijani" lang="az" hreflang="az" class="interlanguage-link-target"><span>Azərbaycanca</span></a></li>
			  <li class="interlanguage-link "><a href="https://bg.wikipedia.org/wiki/%D0%9C%D0%B8%D1%81%D0%B8%D1%8F%D1%82%D0%B0_%D0%BD%D0%B5%D0%B2%D1%8A%D0%B7%D0%BC%D0%BE%D0%B6%D0%BD%D0%B0:_%D0%9F%D1%8A%D0%BB%D0%BD%D0%B0_%D1%80%D0%B0%D0%B7%D0%BF%D0%BB%D0%B0%D1%82%D0%B0_%E2%80%93_%D1%87%D0%B0%D1%81%D1%82_%D0%BF%D1%8A%D1%80%D0%B2%D0%B0" title="Мисията невъзможна: Пълна разплата – част първа – Bulgarian" lang="bg" hreflang="bg" class="interlanguage-link-target"><span>Български</span></a></li>
			  <li class="interlanguage-link "><a href="https://bn.wikipedia.org/wiki/%E0%A6%AE%E0%A6%BF%E0%A6%B6%E0%A6%A8:_%E0%A6%87%E0%A6%AE%E0%A7%8D%E0%A6%AA%E0%A6%B8%E0%A6%BF%E0%A6%AC%E0%A6%B2_-_%E0%A6%A1%E0%A7%87%E0%A6%A1_%E0%A6%B0%E0%A7%87%E0%A6%95%E0%A7%8B%E0%A6%A8%E0%A6%BF%E0%A6%82_%E0%A6%AA%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%9F_%E0%A6%93%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%A8" title="মিশন: ইম্পসিবল - ডেড রেকোনিং পার্ট ওয়ান – Bangla" lang="bn" hreflang="bn" class="interlanguage-link-target"><span>বাংলা</span></a></li>
			  <li class="interlanguage-link "><a href="https://ca.wikipedia.org/wiki/Mission:_Impossible_%E2%80%93_Dead_Reckoning_Part_One" title="Mission: Impossible – Dead Reckoning Part One – Catalan" lang="ca" hreflang="ca" class="interlanguage-link-target"><span>Català</span></a></li>
			  <li class="interlanguage-link "><a href="https://cs.wikipedia.org/wiki/Mission:_Impossible_Odplata_%E2%80%93_Prvn%C3%AD_%C4%8D%C3%A1st" title="Mission: Impossible Odplata – První část – Czech" lang="cs" hreflang="cs" class="interlanguage-link-target"><span>Čeština</span></a></li>
			  <li class="interlanguage-link "><a href="https://da.wikipedia.org/wiki/Mission:_Impossible_%E2%80%93_Dead_Reckoning_Part_One" title="Mission: Impossible – Dead Reckoning Part One – Danish" lang="da" hreflang="da" class="interlanguage-link-target"><span>Dansk</span></a></li>
			  <li class="interlanguage-link "><a href="https://de.wikipedia.org/wiki/Mission:_Impossible_%E2%80%93_Dead_Reckoning_Teil_Eins" title="Mission: Impossible – Dead Reckoning Teil Eins – German" lang="de" hreflang="de" class="interlanguage-link-target"><span>Deutsch</span></a></li>
			  <li class="interlanguage-link "><a href="https://el.wikipedia.org/wiki/%CE%95%CF%80%CE%B9%CE%BA%CE%AF%CE%BD%CE%B4%CF%85%CE%BD%CE%B7_%CE%91%CF%80%CE%BF%CF%83%CF%84%CE%BF%CE%BB%CE%AE:_%CE%98%CE%B1%CE%BD%CE%AC%CF%83%CE%B9%CE%BC%CE%B7_%CE%95%CE%BA%CE%B4%CE%AF%CE%BA%CE%B7%CF%83%CE%B7_%E2%80%93_%CE%9C%CE%AD%CF%81%CE%BF%CF%82_%CE%A0%CF%81%CF%8E%CF%84%CE%BF" title="Επικίνδυνη Αποστολή: Θανάσιμη Εκδίκηση – Μέρος Πρώτο – Greek" lang="el" hreflang="el" class="interlanguage-link-target"><span>Ελληνικά</span></a></li>
			  <li class="interlanguage-link "><a href="https://en.wikipedia.org/wiki/Mission:_Impossible_%E2%80%93_Dead_Reckoning_Part_One"
			  	data-title="Mission: Impossible – Dead Reckoning Part One"
				title="Mission: Impossible – Dead Reckoning Part One – English"
				lang="en" hreflang="en"
				class="interlanguage-link-target"><span>English</span></a></li>
			  <li class="interlanguage-link "><a href="https://es.wikipedia.org/wiki/Misi%C3%B3n_imposible:_sentencia_mortal_-_Parte_1" title="Misión imposible: sentencia mortal - Parte 1 – Spanish" lang="es" hreflang="es" class="interlanguage-link-target"><span>Español</span></a></li>
			  <li class="interlanguage-link "><a href="https://fa.wikipedia.org/wiki/%D9%85%D8%A3%D9%85%D9%88%D8%B1%DB%8C%D8%AA:_%D8%BA%DB%8C%D8%B1%D9%85%D9%85%DA%A9%D9%86_%E2%80%93_%D8%B1%D9%88%D8%B2%D8%B4%D9%85%D8%A7%D8%B1_%D9%85%D8%B1%DA%AF_%D9%82%D8%B3%D9%85%D8%AA_%D8%A7%D9%88%D9%84" title="مأموریت: غیرممکن – روزشمار مرگ قسمت اول – Persian" lang="fa" hreflang="fa" class="interlanguage-link-target"><span>فارسی</span></a></li>
			  <li class="interlanguage-link "><a href="https://fi.wikipedia.org/wiki/Mission:_Impossible_%E2%80%93_Dead_Reckoning_Part_One" title="Mission: Impossible – Dead Reckoning Part One – Finnish" lang="fi" hreflang="fi" class="interlanguage-link-target"><span>Suomi</span></a></li>
			  <li class="interlanguage-link "><a href="https://fr.wikipedia.org/wiki/Mission_impossible_:_Dead_Reckoning,_partie_1" title="Mission impossible : Dead Reckoning, partie 1 – French" lang="fr" hreflang="fr" class="interlanguage-link-target"><span>Français</span></a></li>
			  <li class="interlanguage-link "><a href="https://he.wikipedia.org/wiki/%D7%9E%D7%A9%D7%99%D7%9E%D7%94_%D7%91%D7%9C%D7%AA%D7%99_%D7%90%D7%A4%D7%A9%D7%A8%D7%99%D7%AA:_%D7%A0%D7%A7%D7%9E%D7%AA_%D7%9E%D7%95%D7%95%D7%AA_%E2%80%93_%D7%97%D7%9C%D7%A7_%D7%A8%D7%90%D7%A9%D7%95%D7%9F" title="משימה בלתי אפשרית: נקמת מוות – חלק ראשון – Hebrew" lang="he" hreflang="he" class="interlanguage-link-target"><span>עברית</span></a></li>
			  <li class="interlanguage-link "><a href="https://hi.wikipedia.org/wiki/%E0%A4%AE%E0%A4%BF%E0%A4%B6%E0%A4%A8:_%E0%A4%87%E0%A4%AE%E0%A5%8D%E0%A4%AA%E0%A5%89%E0%A4%B8%E0%A4%BF%E0%A4%AC%E0%A4%B2_-_%E0%A4%A1%E0%A5%87%E0%A4%A1_%E0%A4%B0%E0%A5%87%E0%A4%95%E0%A4%A8%E0%A4%BF%E0%A4%82%E0%A4%97_%E0%A4%AA%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%9F_%E0%A4%B5%E0%A4%A8" title="मिशन: इम्पॉसिबल - डेड रेकनिंग पार्ट वन – Hindi" lang="hi" hreflang="hi" class="interlanguage-link-target"><span>हिन्दी</span></a></li>
			  <li class="interlanguage-link "><a href="https://hu.wikipedia.org/wiki/Mission:_Impossible_%E2%80%93_Lesz%C3%A1mol%C3%A1s_%E2%80%93_Els%C5%91_r%C3%A9sz" title="Mission: Impossible – Leszámolás – Első rész – Hungarian" lang="hu" hreflang="hu" class="interlanguage-link-target"><span>Magyar</span></a></li>
			  <li class="interlanguage-link "><a href="https://hy.wikipedia.org/wiki/%D4%B1%D5%BC%D5%A1%D6%84%D5%A5%D5%AC%D5%B8%D6%82%D5%A9%D5%B5%D5%B8%D6%82%D5%B6%D5%B6_%D5%A1%D5%B6%D5%AB%D6%80%D5%A1%D5%A3%D5%B8%D6%80%D5%AE%D5%A5%D5%AC%D5%AB_%D5%A7_7" title="Առաքելությունն անիրագործելի է 7 – Armenian" lang="hy" hreflang="hy" class="interlanguage-link-target"><span>Հայերեն</span></a></li>
			  <li class="interlanguage-link "><a href="https://id.wikipedia.org/wiki/Mission:_Impossible_%E2%80%93_Dead_Reckoning_Part_One" title="Mission: Impossible – Dead Reckoning Part One – Indonesian" lang="id" hreflang="id" class="interlanguage-link-target"><span>Bahasa Indonesia</span></a></li>
			  <li class="interlanguage-link "><a href="https://ja.wikipedia.org/wiki/%E3%83%9F%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3:%E3%82%A4%E3%83%B3%E3%83%9D%E3%83%83%E3%82%B7%E3%83%96%E3%83%AB/%E3%83%87%E3%83%83%E3%83%89%E3%83%AC%E3%82%B3%E3%83%8B%E3%83%B3%E3%82%B0_PART_ONE" title="ミッション:インポッシブル/デッドレコニング PART ONE – Japanese" lang="ja" hreflang="ja" class="interlanguage-link-target"><span>日本語</span></a></li>
			  <li class="interlanguage-link "><a href="https://ko.wikipedia.org/wiki/%EB%AF%B8%EC%85%98_%EC%9E%84%ED%8C%8C%EC%84%9C%EB%B8%94:_%EB%8D%B0%EB%93%9C_%EB%A0%88%EC%BD%94%EB%8B%9D_PART_ONE" title="미션 임파서블: 데드 레코닝 PART ONE – Korean" lang="ko" hreflang="ko" class="interlanguage-link-target"><span>한국어</span></a></li>
			  <li class="interlanguage-link "><a href="https://lo.wikipedia.org/wiki/%E0%BA%A1%E0%BA%B4%E0%BA%AA%E0%BA%8A%E0%BA%B1%E0%BB%88%E0%BA%99:_%E0%BA%AD%E0%BA%B4%E0%BA%A1%E0%BA%9E%E0%BA%AD%E0%BA%AA%E0%BA%8A%E0%BA%B4%E0%BB%80%E0%BA%9A%E0%BA%B4%E0%BB%89%E0%BA%A5_%E0%BA%A5%E0%BB%88%E0%BA%B2%E0%BA%9E%E0%BA%B4%E0%BA%81%E0%BA%B1%E0%BA%94%E0%BA%A1%E0%BB%8D%E0%BA%A5%E0%BA%B0%E0%BA%99%E0%BA%B2_%E0%BA%95%E0%BA%AD%E0%BA%99%E0%BA%97%E0%BA%B5%E0%BB%9C%E0%BA%B6%E0%BB%88%E0%BA%87" title="ມິສຊັ່ນ: ອິມພອສຊິເບິ້ລ ລ່າພິກັດມໍລະນາ ຕອນທີໜຶ່ງ – Lao" lang="lo" hreflang="lo" class="interlanguage-link-target"><span>ລາວ</span></a></li>
			  <li class="interlanguage-link "><a href="https://lv.wikipedia.org/wiki/Neiesp%C4%93jam%C4%81_misija:_Atmaksa._Pirm%C4%81_da%C4%BCa" title="Neiespējamā misija: Atmaksa. Pirmā daļa – Latvian" lang="lv" hreflang="lv" class="interlanguage-link-target"><span>Latviešu</span></a></li>
			  <li class="interlanguage-link "><a href="https://mr.wikipedia.org/wiki/%E0%A4%AE%E0%A4%BF%E0%A4%B6%E0%A4%A8:_%E0%A4%87%E0%A4%AE%E0%A5%8D%E0%A4%AA%E0%A5%89%E0%A4%B8%E0%A4%BF%E0%A4%AC%E0%A4%B2_-_%E0%A4%A1%E0%A5%87%E0%A4%A1_%E0%A4%B0%E0%A5%87%E0%A4%95%E0%A4%A8%E0%A4%BF%E0%A4%82%E0%A4%97_%E0%A4%AA%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%9F_%E0%A4%B5%E0%A4%A8" title="मिशन: इम्पॉसिबल - डेड रेकनिंग पार्ट वन – Marathi" lang="mr" hreflang="mr" class="interlanguage-link-target"><span>मराठी</span></a></li>
			  <li class="interlanguage-link "><a href="https://nl.wikipedia.org/wiki/Mission:_Impossible_%E2%80%93_Dead_Reckoning_Part_One" title="Mission: Impossible – Dead Reckoning Part One – Dutch" lang="nl" hreflang="nl" class="interlanguage-link-target"><span>Nederlands</span></a></li>
			  <li class="interlanguage-link "><a href="https://no.wikipedia.org/wiki/Mission:_Impossible_%E2%80%93_Dead_Reckoning_Part_One" title="Mission: Impossible – Dead Reckoning Part One – Norwegian Bokmål" lang="nb" hreflang="nb" class="interlanguage-link-target"><span>Norsk bokmål</span></a></li>
			  <li class="interlanguage-link "><a href="https://pl.wikipedia.org/wiki/Mission:_Impossible_%E2%80%93_Dead_Reckoning_Part_One" title="Mission: Impossible – Dead Reckoning Part One – Polish" lang="pl" hreflang="pl" class="interlanguage-link-target"><span>Polski</span></a></li>
			  <li class="interlanguage-link "><a href="https://pt.wikipedia.org/wiki/Mission:_Impossible_%E2%80%93_Dead_Reckoning_Part_One" title="Mission: Impossible – Dead Reckoning Part One – Portuguese" lang="pt" hreflang="pt" class="interlanguage-link-target"><span>Português</span></a></li>
			  <li class="interlanguage-link "><a href="https://ro.wikipedia.org/wiki/Misiune:_Imposibil%C4%83_-_R%C4%83fuial%C4%83_mortal%C4%83_partea_%C3%AEnt%C3%A2i" title="Misiune: Imposibilă - Răfuială mortală partea întâi – Romanian" lang="ro" hreflang="ro" class="interlanguage-link-target"><span>Română</span></a></li>
			  <li class="interlanguage-link "><a href="https://ru.wikipedia.org/wiki/%D0%9C%D0%B8%D1%81%D1%81%D0%B8%D1%8F_%D0%BD%D0%B5%D0%B2%D1%8B%D0%BF%D0%BE%D0%BB%D0%BD%D0%B8%D0%BC%D0%B0:_%D0%A1%D0%BC%D0%B5%D1%80%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F_%D1%80%D0%B0%D1%81%D0%BF%D0%BB%D0%B0%D1%82%D0%B0,_%D1%87%D0%B0%D1%81%D1%82%D1%8C_1" title="Миссия невыполнима: Смертельная расплата, часть 1 – Russian" lang="ru" hreflang="ru" class="interlanguage-link-target"><span>Русский</span></a></li>
			  <li class="interlanguage-link "><a href="https://sr.wikipedia.org/wiki/%D0%9D%D0%B5%D0%BC%D0%BE%D0%B3%D1%83%D1%9B%D0%B0_%D0%BC%D0%B8%D1%81%D0%B8%D1%98%D0%B0:_%D0%9E%D0%B4%D0%BC%D0%B0%D0%B7%D0%B4%D0%B0_%E2%80%94_%D0%9F%D1%80%D0%B2%D0%B8_%D0%B4%D0%B5%D0%BE" title="Немогућа мисија: Одмазда — Први део – Serbian" lang="sr" hreflang="sr" class="interlanguage-link-target"><span>Српски / srpski</span></a></li>
			  <li class="interlanguage-link "><a href="https://sv.wikipedia.org/wiki/Mission:_Impossible_%E2%80%93_Dead_Reckoning_Part_One" title="Mission: Impossible – Dead Reckoning Part One – Swedish" lang="sv" hreflang="sv" class="interlanguage-link-target"><span>Svenska</span></a></li>
			  <li class="interlanguage-link "><a href="https://th.wikipedia.org/wiki/%E0%B8%A1%E0%B8%B4%E0%B8%8A%E0%B8%8A%E0%B8%B1%E0%B9%88%E0%B8%99:%E0%B8%AD%E0%B8%B4%E0%B8%A1%E0%B8%9E%E0%B8%AD%E0%B8%AA%E0%B8%8B%E0%B8%B4%E0%B9%80%E0%B8%9A%E0%B8%B4%E0%B9%89%E0%B8%A5_%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B8%9E%E0%B8%B4%E0%B8%81%E0%B8%B1%E0%B8%94%E0%B8%A1%E0%B8%A3%E0%B8%93%E0%B8%B0_%E0%B8%95%E0%B8%AD%E0%B8%99%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%AB%E0%B8%99%E0%B8%B6%E0%B9%88%E0%B8%87" title="มิชชั่น:อิมพอสซิเบิ้ล ล่าพิกัดมรณะ ตอนที่หนึ่ง – Thai" lang="th" hreflang="th" class="interlanguage-link-target"><span>ไทย</span></a></li>
			  <li class="interlanguage-link "><a href="https://tr.wikipedia.org/wiki/Mission:_Impossible_-_%C3%96l%C3%BCmc%C3%BCl_Hesapla%C5%9Fma_Birinci_B%C3%B6l%C3%BCm" title="Mission: Impossible - Ölümcül Hesaplaşma Birinci Bölüm – Turkish" lang="tr" hreflang="tr" class="interlanguage-link-target"><span>Türkçe</span></a></li>
			  <li class="interlanguage-link "><a href="https://uk.wikipedia.org/wiki/%D0%9C%D1%96%D1%81%D1%96%D1%8F_%D0%BD%D0%B5%D0%BC%D0%BE%D0%B6%D0%BB%D0%B8%D0%B2%D0%B0:_%D0%A0%D0%BE%D0%B7%D0%BF%D0%BB%D0%B0%D1%82%D0%B0._%D0%A7%D0%B0%D1%81%D1%82%D0%B8%D0%BD%D0%B0_%D0%BF%D0%B5%D1%80%D1%88%D0%B0" title="Місія неможлива: Розплата. Частина перша – Ukrainian" lang="uk" hreflang="uk" class="interlanguage-link-target"><span>Українська</span></a></li>
			  <li class="interlanguage-link "><a href="https://vi.wikipedia.org/wiki/Nhi%E1%BB%87m_v%E1%BB%A5:_B%E1%BA%A5t_kh%E1%BA%A3_thi_%E2%80%93_Nghi%E1%BB%87p_b%C3%A1o_ph%E1%BA%A7n_1" title="Nhiệm vụ: Bất khả thi – Nghiệp báo phần 1 – Vietnamese" lang="vi" hreflang="vi" class="interlanguage-link-target"><span>Tiếng Việt</span></a></li>
			  <li class="interlanguage-link "><a href="https://zh.wikipedia.org/wiki/%E4%B8%8D%E5%8F%AF%E8%83%BD%E7%9A%84%E4%BB%BB%E5%8B%99%EF%BC%9A%E8%87%B4%E5%91%BD%E6%B8%85%E7%AE%97_%E7%AC%AC%E4%B8%80%E7%AB%A0" title="不可能的任務：致命清算 第一章 – Chinese" lang="zh" hreflang="zh" class="interlanguage-link-target"><span>中文</span></a></li>
		   </ul>
		</section>
	 </div>
	`;
	fixture = document.createElement( 'div' );
	fixture.innerHTML = html;
	global.document.body.appendChild( fixture );

	const p = new PageHTMLParser( util.parseHTML( '' ) );
	const langs = p.getLanguages( 'Foo' );
	assert.strictEqual( langs.languages.length, 37, 'Expected languages' );
	assert.strictEqual( langs.variants.length, 0, 'Expected variants' );
	assert.strictEqual(
		langs.languages.filter( ( lang ) => lang.lang === 'en' )[ 0 ].title,
		'Mission: Impossible – Dead Reckoning Part One',
		'Check the English title'
	);
} );
