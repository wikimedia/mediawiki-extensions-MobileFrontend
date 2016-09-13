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

	QUnit.test( '#lazyLoadReferences', 1, function ( assert ) {
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

}( mw.mobileFrontend, jQuery ) );
