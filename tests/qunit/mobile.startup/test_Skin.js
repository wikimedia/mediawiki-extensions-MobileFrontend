( function ( M, $ ) {
	var Page = M.require( 'mobile.startup/Page' ),
		Skin = M.require( 'mobile.startup/Skin' );

	QUnit.module( 'MobileFrontend Skin.js', {
		setup: function () {
			var stub = {
				getReferencesLists: $.noop,
				getReferencesList: $.noop
			};
			this.page = new Page( {
				title: 'Foo'
			} );
			// Skin will request tablet modules - avoid this
			this.sandbox.stub( mw.loader, 'using' ).returns( $.Deferred().resolve() );
			this.sandbox.stub( stub, 'getReferencesLists' ).returns( $.Deferred().resolve( {} ) );
			this.sandbox.stub( stub, 'getReferencesList' )
				.withArgs( this.page, 'Notes_and_references' ).returns( $.Deferred().resolve( $( '<p>' ).text( 'P' ) ) )
				.withArgs( this.page, 'Notes' ).returns( $.Deferred().resolve( $( '<p>' ).text( 'A' ) ) )
				.withArgs( this.page, 'Refs' ).returns( $.Deferred().resolve( $( '<p>' ).text( 'B' ) ) )
				.withArgs( this.page, 'More_refs' ).returns( $.Deferred().resolve( $( '<p>' ).html( '<p>E</p><p>F</p>' ).children() ) );
			this.$el = $( '<div>' ).append( mw.template.get( 'tests.mobilefrontend', 'skinPage.html' ).render() );
			this.skin = new Skin( {
				el: this.$el,
				referencesGateway: stub,
				page: this.page
			} );
		}
	} );

	QUnit.test( '#loadImagesList (success)', function ( assert ) {
		var stub = this.sandbox.stub( this.skin, 'loadImage' )
			.returns( $.Deferred().resolve() );

		return this.skin.loadImagesList( [
			$( '<div>' ), $( '<div>' )
		] ).done( function () {
			assert.ok( stub.calledTwice,
				'Stub was called twice and resolves successfully.' );
		} );
	} );

	QUnit.test( '#loadImagesList (one image fails)', function ( assert ) {
		var stub = this.sandbox.stub( this.skin, 'loadImage' ),
			d = $.Deferred();

		stub.onCall( 0 ).returns( $.Deferred().resolve() );
		stub.onCall( 1 ).returns( $.Deferred().reject() );

		this.skin.loadImagesList( [
			$( '<div>' ), $( '<div>' )
		] ).fail( function () {
			assert.ok( stub.calledTwice,
				'Stub was called twice and overall result was failure.' );
		} ).always( function () {
			d.resolve();
		} );
		return d;
	} );

	QUnit.test( '#loadImagesList (empty list)', function ( assert ) {
		return this.skin.loadImagesList( [] ).done( function () {
			assert.ok( true, 'An empty list always resolves successfully' );
		} );
	} );

	QUnit.test( '#lazyLoadReferences', function ( assert ) {
		var $content = this.$el;
		this.skin.lazyLoadReferences( {
			wasExpanded: false,
			page: this.skin.page,
			isReferenceSection: true,
			$heading: $content.find( '#Notes_and_references' ).parent()
		} ).done( function () {
			assert.strictEqual( $content.find( '.mf-section-2' ).text().replace( /[\t\n]/g, '' ),
				'TextPNotesARefsBno forgetMore refs1E2F3',
				'Check all the references section is populated correctly.' );
		} );
	} );

	QUnit.test( '#getSectionId', function ( assert ) {
		var
			$el = $(
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
			$elTwo = $(
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
			$elThree = $(
				[
					'<div id="mw-content-text">',
					'<h2><span class="mw-headline" id="heading">Heading</span></h2>',
					'<div><a class="element"></a></div>',
					'</div>'
				].join( '' )
			),
			$elFour = $(
				[
					'<div id="mw-content-text">',
					'<div><a class="element"></a></div>'
				].join( '' )
			),
			$elFive = $(
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

}( mw.mobileFrontend, jQuery ) );
