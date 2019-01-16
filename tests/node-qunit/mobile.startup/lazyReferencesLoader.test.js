var
	pages = require( './../utils/PageInputs.html' ),
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	lazyReferencesLoader,
	sinon = require( 'sinon' ),
	util = require( '../../../src/mobile.startup/util' ),
	sandbox,
	Page;

QUnit.module( 'MobileFrontend lazyReferencesLoader.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );

		Page = require( '../../../src/mobile.startup/Page' );
		lazyReferencesLoader = require( '../../../src/mobile.startup/lazyReferencesLoader' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#lazyReferencesLoader collapsed', function ( assert ) {
	var
		$content = util.parseHTML( '<div>' ).append( pages.skinPage ),
		eventBus = {
			on: function () {},
			off: function () {},
			emit: function () {}
		},
		gateway = {
			getReferencesLists: function () {},
			getReferencesList: function () {}
		},
		page = new Page( { title: 'Foo' } );

	sandbox.stub( gateway, 'getReferencesLists' ).returns( util.Deferred().resolve( {} ) );
	sandbox.stub( gateway, 'getReferencesList' )
		.withArgs( page, 'Notes_and_references' ).returns( util.Deferred().resolve( util.parseHTML( '<p>' ).text( 'P' ) ) )
		.withArgs( page, 'Notes' ).returns( util.Deferred().resolve( util.parseHTML( '<p>' ).text( 'A' ) ) )
		.withArgs( page, 'Refs' ).returns( util.Deferred().resolve( util.parseHTML( '<p>' ).text( 'B' ) ) )
		.withArgs( page, 'More_refs' ).returns( util.Deferred().resolve( util.parseHTML( '<p>' ).html( '<p>E</p><p>F</p>' ).children() ) );

	return lazyReferencesLoader.loadReferences( eventBus, {
		expanded: false,
		page: page,
		isReferenceSection: true,
		$heading: $content.find( '#Notes_and_references' ).parent()
	}, gateway, page ).then( function () {
		assert.strictEqual( $content.find( '.mf-section-2' ).text().replace( /[\t\n]/g, '' ),
			'TextPNotesARefsBno forgetMore refs1E2F3',
			'Check all the references section is populated correctly.' );
	} );
} );

QUnit.test( '#lazyReferencesLoader expanded', function ( assert ) {
	var
		$content = util.parseHTML( '<div>' ).append( pages.skinPage ),
		eventBus = {
			on: function () {},
			off: function () {},
			emit: function () {}
		},
		gateway = {
			getReferencesLists: function () {},
			getReferencesList: function () {}
		},
		page = new Page( { title: 'Foo' } ),
		result;

	result = lazyReferencesLoader.loadReferences( eventBus, {
		expanded: true,
		page: page,
		isReferenceSection: true,
		$heading: $content.find( '#Notes_and_references' ).parent()
	}, gateway, page );
	assert.strictEqual( result, undefined );
} );

QUnit.test( '#getSectionId', function ( assert ) {
	var
		$el = util.parseHTML(
			[
				'<div>',
				'<h2><span class="mw-headline" id="heading">H</span></h2>',
				'<div>',
				'<h3><span class="mw-headline" id="subheading">Subh</span></h3>',
				'<a class="element"></a>',
				'</div>',
				'</div>'
			].join( '' )
		),
		$elTwo = util.parseHTML(
			[
				'<div>',
				'<h2><span class="mw-headline" id="Notes_and_references">Notes and references</span></h2>',
				'<div>',
				'<h3 class="in-block"><span class="mw-headline" id="Notes">Notes</span></h3>',
				'<div class="reflist"><a class="element"></a></div>',
				'</div>',
				'</div>'
			].join( '' )
		),
		$elThree = util.parseHTML(
			[
				'<div id="mw-content-text">',
				'<h2><span class="mw-headline" id="heading">Heading</span></h2>',
				'<div><a class="element"></a></div>',
				'</div>'
			].join( '' )
		),
		$elFour = util.parseHTML(
			[
				'<div id="mw-content-text">',
				'<div><a class="element"></a></div>'
			].join( '' )
		),
		$elFive = util.parseHTML(
			[
				'<div id="mw-content-text">',
				'<h2><span class="mw-headline" id="Foo">Foo</span></h2>',
				'<div>',
				'<p>Foo content.</p>',
				'</div>',
				'<h2><span class="mw-headline" id="Bar">Bar</span></h2>',
				'<div class="reflist"><a class="element"></a></div>',
				'</div>',
				'</div>'
			].join( '' )
		);

	assert.strictEqual(
		lazyReferencesLoader.test.getSectionId( $el.find( '.element' ) ),
		'subheading'
	);
	assert.strictEqual(
		lazyReferencesLoader.test.getSectionId( $elTwo.find( '.element' ) ),
		'Notes',
		'https://phabricator.wikimedia.org/T146394'
	);
	assert.strictEqual(
		lazyReferencesLoader.test.getSectionId( $elThree.find( '.element' ) ),
		'heading'
	);
	assert.strictEqual(
		lazyReferencesLoader.test.getSectionId( $elFour.find( '.element' ) ),
		null
	);
	assert.strictEqual(
		lazyReferencesLoader.test.getSectionId( $elFive.find( '.element' ) ),
		'Bar'
	);
} );
