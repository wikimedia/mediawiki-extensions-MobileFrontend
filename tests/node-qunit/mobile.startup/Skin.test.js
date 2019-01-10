var
	pages = require( './../utils/PageInputs.html' ),
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' ),
	util = require( '../../../src/mobile.startup/util' ),
	sandbox,
	Skin,
	Page;

QUnit.module( 'MobileFrontend Skin.js', {
	beforeEach: function () {
		var stub = {
				getReferencesLists: function () {},
				getReferencesList: function () {}
			},
			page;
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );

		Skin = require( '../../../src/mobile.startup/Skin' );
		Page = require( '../../../src/mobile.startup/Page' );

		page = new Page( {
			title: 'Foo'
		} );

		// Skin will request tablet modules - avoid this
		sandbox.stub( mw.loader, 'using' ).returns( util.Deferred().resolve() );
		sandbox.stub( stub, 'getReferencesLists' ).returns( util.Deferred().resolve( {} ) );
		sandbox.stub( stub, 'getReferencesList' )
			.withArgs( page, 'Notes_and_references' ).returns( util.Deferred().resolve( util.parseHTML( '<p>' ).text( 'P' ) ) )
			.withArgs( page, 'Notes' ).returns( util.Deferred().resolve( util.parseHTML( '<p>' ).text( 'A' ) ) )
			.withArgs( page, 'Refs' ).returns( util.Deferred().resolve( util.parseHTML( '<p>' ).text( 'B' ) ) )
			.withArgs( page, 'More_refs' ).returns( util.Deferred().resolve( util.parseHTML( '<p>' ).html( '<p>E</p><p>F</p>' ).children() ) );
		this.skin = new Skin( {
			referencesGateway: stub,
			page: page,
			eventBus: {
				on: function () {},
				off: function () {}
			}
		} );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#lazyLoadReferences collapsed', function ( assert ) {
	var $content = util.parseHTML( '<div>' ).append( pages.skinPage );

	return this.skin.lazyLoadReferences( {
		expanded: false,
		page: this.skin.page,
		isReferenceSection: true,
		$heading: $content.find( '#Notes_and_references' ).parent()
	} ).then( function () {
		assert.strictEqual( $content.find( '.mf-section-2' ).text().replace( /[\t\n]/g, '' ),
			'TextPNotesARefsBno forgetMore refs1E2F3',
			'Check all the references section is populated correctly.' );
	} );
} );

QUnit.test( '#lazyLoadReferences expanded', function ( assert ) {
	var
		$content = util.parseHTML( '<div>' ).append( pages.skinPage ),
		result;

	result = this.skin.lazyLoadReferences( {
		expanded: true,
		page: this.skin.page,
		isReferenceSection: true,
		$heading: $content.find( '#Notes_and_references' ).parent()
	} );
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
		Skin.getSectionId( $el.find( '.element' ) ),
		'subheading'
	);
	assert.strictEqual(
		Skin.getSectionId( $elTwo.find( '.element' ) ),
		'Notes',
		'https://phabricator.wikimedia.org/T146394'
	);
	assert.strictEqual(
		Skin.getSectionId( $elThree.find( '.element' ) ),
		'heading'
	);
	assert.strictEqual(
		Skin.getSectionId( $elFour.find( '.element' ) ),
		null
	);
	assert.strictEqual(
		Skin.getSectionId( $elFive.find( '.element' ) ),
		'Bar'
	);
} );
